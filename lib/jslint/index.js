/*jslint
  node
*/

"use strict";

const {Script} = require("vm");

function jslint(source) {
    const script = new Script(`${source}
analysis = jslint(source, options, globals);`);
    return function (source, options, globals) {
        const sandbox = {analysis: undefined, source, options, globals};
        script.runInNewContext(sandbox);
        return sandbox.analysis;
    };
}

module.exports = {jslint};
