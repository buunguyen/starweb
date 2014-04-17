test:
	./node_modules/.bin/mocha --harmony --reporter spec --bail --no-colors --recursive

.PHONY: test