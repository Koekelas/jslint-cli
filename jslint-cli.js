#!/usr/bin/env node
/*jslint
  node
*/

"use strict";

const fs = require("fs");
const {get} = require("https");
const {join} = require("path");
const {homedir} = require("os");
const {jslint} = require("./lib/jslint");
const {emacs: emacsReport} = require("./lib/report");
const {promiseify} = require("./lib/util");

const configDir = `${homedir()}/.jslint-cli`;
const jslintPath = join(configDir, `jslint.js`);
const jslintUrl = "https://raw.githubusercontent.com/douglascrockford/JSLint/master/jslint.js";
const errorExitCode = 1;

const mkdir = promiseify(fs.mkdir);
const readFile = promiseify(fs.readFile);
const writeFile = promiseify(fs.writeFile);

const readStdin = (function () {
    const buffer = promiseify(process.stdin).then(function (chunks) {
        return Buffer.concat(chunks);
    });
    return function (encoding) {
        return buffer.then(function (buffer) {
            if (encoding) {
                return buffer.toString(encoding);
            }
            return buffer;
        });
    };
}());

function readUrl(url, encoding) {
    return new Promise(function (resolve, reject) {
        get(url)
            .on("response", function (response) {
                promiseify(response)
                    .then(function (chunks) {
                        const buffer = Buffer.concat(chunks);
                        if (encoding) {
                            resolve(buffer.toString(encoding));
                        } else {
                            resolve(buffer);
                        }
                    })
                    .catch(reject);
            })
            .on("error", reject);
    });
}

function createConfigDir() {
    return mkdir(configDir)
        .catch(function (error) {
            if (error.code !== "EEXIST") {
                throw error;
            }
        })
        .then(function () {
            return configDir;
        });
}

function fetchJslint() {
    return readFile(jslintPath, "utf8").catch(function (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
        return Promise
            .all([createConfigDir(), readUrl(jslintUrl, "utf8")])
            .then(function ([ignore, source]) {
                return writeFile(jslintPath, source).then(function () {
                    return source;
                });
            });
    });
}

Promise
    .all([fetchJslint(), readStdin("utf8")])
    .then(function ([jslintSource, source]) {
        const lint = jslint(jslintSource);
        const report = emacsReport(lint(source));
        if (!report) {
            return;
        }
        process.stdout.write(`${report}
`);
    })
    .catch(function ({message}) {
        process.stderr.write(`${message}
`);
        process.exitCode = errorExitCode;
    });
