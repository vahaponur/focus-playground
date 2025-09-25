.PHONY: install compile package publish version-patch version-minor version-major clean

install:
	npm install

compile:
	npm run compile

package:
	npm run package

publish:
	vsce publish

version-patch:
	npm version patch && echo "Remember to git push --follow-tags"

version-minor:
	npm version minor && echo "Remember to git push --follow-tags"

version-major:
	npm version major && echo "Remember to git push --follow-tags"

clean:
	rm -rf node_modules out focus-playground-*.vsix
