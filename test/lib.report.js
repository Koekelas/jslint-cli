/*jslint
  node
*/

"use strict";

const {simple, emacs} = require("../lib/report");

const analysis = {
    warnings: [
        {line: 0, column: 0, message: "message"},
        {line: 1, column: 0, message: "message"},
        {line: 2, column: 0, message: "message"}
    ]
};

const simpleTests = {
    reportsErrors(test) {
        const expected = "0,0 message\n1,0 message\n2,0 message";
        test.expect(1);
        test.strictEqual(simple(analysis), expected);
        test.done();
    },

    reportsUndefinedNoErrors(test) {
        const expected = undefined;
        test.expect(1);
        test.strictEqual(simple({warnings: []}), expected);
        test.done();
    }
};

const emacsTests = {
    reportsErrors(test) {
        const expected = "1,1 message\n2,1 message\n3,1 message";
        test.expect(1);
        test.strictEqual(emacs(analysis), expected);
        test.done();
    }
};

module.exports = {simple: simpleTests, emacs: emacsTests};
