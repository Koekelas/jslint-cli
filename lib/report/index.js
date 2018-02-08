/*jslint
  node
*/

"use strict";

const {comp} = require("../util");

function simpleErrors(analysis) {
    return analysis.warnings.map(function ({line, column, message}) {
        return {line, column, message};
    });
}

function simpleReport(simpleErrors) {
    if (!simpleErrors.length) {
        return undefined;
    }
    return simpleErrors
        .map(function ({line, column, message}) {
            return `${line},${column} ${message}`;
        })
        .join("\n");
}

const simple = comp(simpleReport, simpleErrors);

const emacs = comp(
    simpleReport,
    function (simpleErrors) {
        return simpleErrors.map(function ({line, column, message}) {
            return {line: line + 1, column: column + 1, message};
        });
    },
    simpleErrors
);

module.exports = {simple, emacs};
