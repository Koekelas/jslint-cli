/*jslint
  node
*/

"use strict";

function isStream(val) {
    return typeof val === "object" && typeof val.pipe === "function";
}

function isReadableStream(val) {
    return isStream(val) && typeof val.read === "function";
}

function partial(f, ...args) {
    return function (...moreArgs) {
        return f.apply(undefined, args.concat(moreArgs));
    };
}

function comp(...fs) {
    const f = fs.pop();
    fs.reverse();
    return function (...args) {
        return fs.reduce(function (result, f) {
            return f(result);
        }, f.apply(undefined, args));
    };
}

function promiseifyAsyncF(f) {
    return function (...args) {
        return new Promise(function (resolve, reject) {
            args.push(function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
            f.apply(undefined, args);
        });
    };
}

function promiseifyReadableStream(stream) {
    return new Promise(function (resolve, reject) {
        const chunks = [];
        stream
            .on("data", function (chunk) {
                chunks.push(chunk);
            })
            .on("end", function () {
                resolve(chunks);
            })
            .on("error", function (error) {
                reject(error);
            });
    });
}

function promiseify(val) {
    if (typeof val === "function") {
        return promiseifyAsyncF(val);
    }
    if (isReadableStream(val)) {
        return promiseifyReadableStream(val);
    }
    throw new Error("No implementation");
}

module.exports = {
    isStream,
    isReadableStream,
    partial,
    comp,
    promiseifyAsyncF,
    promiseifyReadableStream,
    promiseify
};
