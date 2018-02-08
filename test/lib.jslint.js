/*jslint
  node
*/

"use strict";

const {jslint} = require("../lib/jslint");

const jslintTests = {
    extractsAnalysis(test) {
        const expected = "object";
        const source = "function jslint() {return {};}";
        const lint = jslint(source);
        const analysis = lint("let x;");
        test.expect(1);
        test.strictEqual(typeof analysis, expected);
        test.done();
    },

    insertsArgs(test) {
        const expected = {source: "let x;", options: {}, globals: []};
        const source = "function jslint(source, options, globals) {return {source, options, globals};}";
        const lint = jslint(source);
        const analysis = lint(expected.source, expected.options, expected.globals);
        test.expect(1);
        test.deepEqual(analysis, expected); // deepStrictEqual() isn't exposed
        test.done();
    }
};

module.exports = {jslint: jslintTests};
