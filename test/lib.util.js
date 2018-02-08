/*jslint
  node this
*/

"use strict";

const {Readable, Writable} = require("stream");
const {
    isStream,
    isReadableStream,
    partial,
    comp,
    promiseifyAsyncF,
    promiseifyReadableStream,
    promiseify
} = require("../lib/util");

function isPromise(val) {
    return typeof val === "object" && typeof val.then === "function";
}

function sum(...ns) {
    return ns.reduce(function (result, n) {
        return result + n;
    }, 0);
}

const isStreamTests = {
    identifiesStream(test) {
        test.expect(1);
        test.ok(isStream(new Readable()));
        test.done();
    },

    identifiesNotStreamNumber(test) {
        test.expect(1);
        test.ok(!isStream(1));
        test.done();
    },

    identifiesNotStreamObject(test) {
        test.expect(1);
        test.ok(!isStream({}));
        test.done();
    }
};

const isReadableStreamTests = {
    identifiesReadableStream(test) {
        test.expect(1);
        test.ok(isReadableStream(new Readable()));
        test.done();
    },

    identifiesNotReadableStream(test) {
        test.expect(1);
        test.ok(!isReadableStream(new Writable()));
        test.done();
    }
};

const partialTests = {
    passesArgs(test) {
        const expected = 6;
        const sum1 = partial(sum, 1, 2, 3);
        test.expect(1);
        test.strictEqual(sum1(), expected);
        test.done();
    },

    passesMoreArgs(test) {
        const expected = 6;
        const sum1 = partial(sum);
        test.expect(1);
        test.strictEqual(sum1(1, 2, 3), expected);
        test.done();
    },

    passesAllArgs(test) {
        const expected = 21;
        const sum1 = partial(sum, 1, 2, 3);
        test.expect(1);
        test.strictEqual(sum1(4, 5, 6), expected);
        test.done();
    },

    passesArgsInOrder(test) {
        const expected = -1;
        const oneMin = partial(function (n, o) {
            return n - o;
        }, 1);
        test.expect(1);
        test.strictEqual(oneMin(2), expected);
        test.done();
    },

    isCallableMultipleTimes(test) {
        const expected = 9;
        const inc = partial(function (n, o) {
            return n + o;
        }, 1);
        test.expect(1);
        test.strictEqual(sum(inc(1), inc(2), inc(3)), expected);
        test.done();
    }
};

const compTests = {
    passesArgs(test) {
        const expected = 6;
        const sum1 = comp(sum);
        test.expect(1);
        test.strictEqual(sum1(1, 2, 3), expected);
        test.done();
    },

    callsFsRightToLeft(test) {
        const expected = 6;
        const plusOneMinTwoTimesThree = comp(function (n) {
            return n * 3;
        }, function (n) {
            return n - 2;
        }, function (n) {
            return n + 1;
        });
        test.expect(1);
        test.strictEqual(plusOneMinTwoTimesThree(3), expected);
        test.done();
    },

    isCallableMultipleTimes(test) {
        const expected = 15;
        const inc = function (n) {
            return n + 1;
        };
        const plusThree = comp(inc, inc, inc);
        test.expect(1);
        test.strictEqual(sum(plusThree(1), plusThree(2), plusThree(3)), expected);
        test.done();
    }
};

const promiseifyAsyncFTests = {
    resolvesOnResult(test) {
        const expected = "result";
        const resolve = promiseifyAsyncF(function (callback) {
            callback(undefined, expected);
        });
        test.expect(1);
        resolve().then(function (result) {
            test.strictEqual(result, expected);
            test.done();
        });
    },

    rejectsOnError(test) {
        const expected = "error";
        const reject = promiseifyAsyncF(function (callback) {
            callback(new Error(expected));
        });
        test.expect(1);
        reject().catch(function ({message}) {
            test.strictEqual(message, expected);
            test.done();
        });
    },

    passesArgs(test) {
        const expected = 6;
        const sum1 = promiseifyAsyncF(function (n, o, p, callback) {
            callback(undefined, n + o + p);
        });
        test.expect(1);
        sum1(1, 2, 3).then(function (result) {
            test.strictEqual(result, expected);
            test.done();
        });
    },

    isCallableMultipleTimes(test) {
        const expected = 45;
        const sum1 = promiseifyAsyncF(function (...args) {
            const callback = args.pop();
            callback(undefined, sum.apply(undefined, args));
        });
        test.expect(1);
        Promise
            .all([sum1(1, 2), sum1(3, 4, 5), sum1(6, 7, 8, 9)])
            .then(function ([n, m, o]) {
                test.strictEqual(sum(n, m, o), expected);
                test.done();
            });
    }
};

const promiseifyReadableStreamTests = {
    resolvesOnEnd(test) {
        const expected = "";
        const readable = promiseifyReadableStream(new Readable({read() {
            this.push(null);
        }}));
        test.expect(1);
        readable.then(function (chunks) {
            test.strictEqual(Buffer.concat(chunks).toString(), expected);
            test.done();
        });
    },

    rejectsOnError(test) {
        const expected = "error";
        const readable = promiseifyReadableStream(new Readable({read() {
            this.emit("error", new Error(expected));
        }}));
        test.expect(1);
        readable.catch(function ({message}) {
            test.strictEqual(message, expected);
            test.done();
        });
    },

    buffersChunksInOrder(test) {
        const expected = "result";
        const readable = promiseifyReadableStream(new Readable({read() {
            this.push("re");
            this.push("su");
            this.push("lt");
            this.push(null);
        }}));
        test.expect(1);
        readable.then(function (chunks) {
            test.strictEqual(Buffer.concat(chunks).toString(), expected);
            test.done();
        });
    }
};

const promiseifyTests = {
    promiseifiesF(test) {
        const identitiy = promiseify(function (val, callback) {
            callback(undefined, val);
        });
        test.expect(1);
        test.ok(isPromise(identitiy(1)));
        test.done();
    },

    promiseifiesReadableStream(test) {
        const readable = promiseify(new Readable({read() {
            this.push(null);
        }}));
        test.expect(1);
        test.ok(isPromise(readable));
        test.done();
    },

    throwsNoImplementationNumber(test) {
        test.expect(1);
        test.throws(function () {
            promiseify(1);
        }, /No\simplementation/);
        test.done();
    },

    throwsNoImplementationObject(test) {
        test.expect(1);
        test.throws(function () {
            promiseify({});
        }, /No\simplementation/);
        test.done();
    }
};

module.exports = {
    isStream: isStreamTests,
    isReadableStream: isReadableStreamTests,
    partial: partialTests,
    comp: compTests,
    promiseifyAsyncF: promiseifyAsyncFTests,
    promiseifyReadableStream: promiseifyReadableStreamTests,
    promiseify: promiseifyTests
};
