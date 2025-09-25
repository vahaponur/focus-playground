.PHONY: install compile package publish version-patch version-minor version-major clean clean-publish-minor

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

clean-publish-minor:
	npm install
	npm run compile
	npm version minor
	vsce publish
clean-publish-patch:
	npm install
	npm version patch
	npm run package
	vsce publish