BIN=node_modules/.bin

MOCHA_ARGS= --compilers js:babel-register \
		--recursive \
    --require babel-polyfill

MOCHA_TARGET=src/**/__tests__/**/*.spec.js

build: clean
	$(BIN)/babel src  --ignore __tests__ --out-dir lib

clean:
	rm -rf lib/*

test:
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) $(MOCHA_TARGET)

test-watch:
	NODE_ENV=test $(BIN)/mocha $(MOCHA_ARGS) -w $(MOCHA_TARGET)

test-cover:
	NODE_ENV=test $(BIN)/babel-istanbul cover _mocha  -- --require babel-polyfill $(MOCHA_TARGET)

lint:
	$(BIN)/eslint --ext .js,.jsx .


PHONY: build clean test test-watch test-cover lint