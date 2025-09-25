import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;
let idleTimer: NodeJS.Timeout | undefined;
let snoozeUntil = 0;
let panel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    const startCmd = vscode.commands.registerCommand('focusPlayground.start', () => {
        openPlayground(context);
    });
    const toggleIdleCmd = vscode.commands.registerCommand('focusPlayground.toggleIdle', async () => {
        const current = getCfg('focusPlayground.autoShowOnIdle') as boolean;
        await vscode.workspace.getConfiguration().update('focusPlayground.autoShowOnIdle', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Auto-show on idle ${!current ? 'enabled' : 'disabled'}.`);
    });

    context.subscriptions.push(startCmd, toggleIdleCmd);

    // Status bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '▶ Focus Playground';
    statusBarItem.tooltip = 'Open Focus Playground mini-games (Ctrl/Cmd+Alt+F)';
    statusBarItem.command = 'focusPlayground.start';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Idle nudge
    resetIdleTimer(context);
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => resetIdleTimer(context)),
        vscode.window.onDidChangeActiveTextEditor(() => resetIdleTimer(context)),
        vscode.window.onDidChangeTextEditorSelection(() => resetIdleTimer(context))
    );
}

function getCfg(key: string) {
    return vscode.workspace.getConfiguration().get(key);
}

function resetIdleTimer(context: vscode.ExtensionContext) {
    if (idleTimer) clearTimeout(idleTimer);
    const auto = getCfg('focusPlayground.autoShowOnIdle') as boolean;
    const idleSeconds = (getCfg('focusPlayground.idleSeconds') as number) || 25;

    if (!auto) return;

    idleTimer = setTimeout(async () => {
        if (Date.now() < snoozeUntil) return;
        const choice = await vscode.window.showInformationMessage('Brain break? Play a 30s micro‑game.',
            'Play', 'Snooze 10m', 'Disable');
        if (choice === 'Play') {
            openPlayground(context);
        } else if (choice === 'Snooze 10m') {
            snoozeUntil = Date.now() + 10 * 60 * 1000;
        } else if (choice === 'Disable') {
            await vscode.workspace.getConfiguration().update('focusPlayground.autoShowOnIdle', false, vscode.ConfigurationTarget.Global);
        }
    }, idleSeconds * 1000);
}

function openPlayground(context: vscode.ExtensionContext) {
    const sidebar = getCfg('focusPlayground.sidebar') as boolean;
    const duration = (getCfg('focusPlayground.defaultDuration') as number) || 30;

    if (panel) {
        panel.reveal(sidebar ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active);
        panel.webview.postMessage({ type: 'config', duration });
        return;
    }

    panel = vscode.window.createWebviewPanel(
        'focusPlayground',
        'Focus Playground',
        sidebar ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    const webview = panel.webview;
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'style.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'main.js'));

    const nonce = getNonce();
    panel.webview.html = /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data: blob:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
<link href="${styleUri}" rel="stylesheet">
<title>Focus Playground</title>
</head>
<body>
<div id="app" data-duration="${duration}"></div>
<script type="module" src="${scriptUri}" nonce="${nonce}"></script>
</body>
</html>`;

    panel.onDidDispose(() => {
        panel = undefined;
    });
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function deactivate() {
    // noop
}
