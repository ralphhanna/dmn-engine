"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.debug = exports.Options = exports.EXPRESSION_TYPE = exports.TOKEN_GROUP = void 0;
const RulesDelegate_1 = require("./RulesDelegate");
const FS = require('fs');
var TOKEN_GROUP;
(function (TOKEN_GROUP) {
    TOKEN_GROUP["alpha"] = "alpha";
    TOKEN_GROUP["number"] = "number";
    TOKEN_GROUP["symbol"] = "symbol";
    TOKEN_GROUP["space"] = "space";
})(TOKEN_GROUP = exports.TOKEN_GROUP || (exports.TOKEN_GROUP = {}));
//  Text    words without quote
//  string  quoted string
//  Number  numeric values
var EXPRESSION_TYPE;
(function (EXPRESSION_TYPE) {
    EXPRESSION_TYPE["Root"] = "Root";
    EXPRESSION_TYPE["Single"] = "Single";
    EXPRESSION_TYPE["Literal"] = "Literal";
    EXPRESSION_TYPE["Number"] = "Number";
    EXPRESSION_TYPE["Text"] = "Text";
    EXPRESSION_TYPE["Binary"] = "Binary";
    EXPRESSION_TYPE["Operator"] = "Operator";
    EXPRESSION_TYPE["Bracket"] = "Bracket";
    EXPRESSION_TYPE["Group"] = "Group";
    EXPRESSION_TYPE["Call"] = "Call";
    EXPRESSION_TYPE["Token"] = "";
    EXPRESSION_TYPE["AlwaysTrue"] = "True";
})(EXPRESSION_TYPE = exports.EXPRESSION_TYPE || (exports.EXPRESSION_TYPE = {}));
class Options {
}
exports.Options = Options;
Options.debugTokens = false;
Options.debugExpression = false;
Options.debugExecution = false;
Options.debugTree = false;
Options.delegate = new RulesDelegate_1.RulesDelegate();
function debug(type, title, obj = null) {
    exports.logger.log(title);
    if (type == 'execution' && !Options.debugExecution)
        return;
    if (type == 'tokens' && !Options.debugTokens)
        return;
    if (type == 'tree' && !Options.debugTree)
        return;
    console.log(title);
    if (obj) {
        console.log(obj);
        exports.logger.log(JSON.stringify(obj));
    }
}
exports.debug = debug;
class Logger {
    constructor({ toConsole = true, toFile = '', callback = null }) {
        this.debugMsgs = [];
        this.toConsole = true;
        this.toFile = null;
        this.callback = null;
        this.setOptions({ toConsole, toFile, callback });
    }
    setOptions({ toConsole, toFile, callback }) {
        this.toConsole = toConsole;
        this.toFile = toFile;
        this.callback = callback;
    }
    msg(message, type = 'log') {
        if (this.toConsole)
            console.log(message);
        if (this.callback) {
            this.callback(message, type);
        }
        this.debugMsgs.push({ message, type });
    }
    clear() {
        this.debugMsgs = [];
    }
    get() {
        return this.debugMsgs;
    }
    debug(message) {
        this.msg(message, 'debug');
    }
    warn(message) {
        this.msg(message, 'warn');
    }
    log(message) {
        this.msg(message);
    }
    error(err) {
        if (typeof err === 'object') {
            if (err.message) {
                this.msg(err.message, 'error');
                console.log('\nError Message: ' + err.message);
            }
            if (err.stack) {
                console.log('\nStacktrace:');
                console.log('====================');
                console.log(err.stack);
                this.log(err.stack);
            }
        }
        else {
            this.msg(err, 'error');
        }
        throw new Error(err);
    }
    save(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("writing to:" + filename + " " + this.debugMsgs.length);
            let id = FS.openSync(filename, 'w', 666);
            {
                FS.writeSync(id, 'Started at: ' + new Date().toISOString() + "\n", null, 'utf8');
                let l = 0;
                for (l = 0; l < this.debugMsgs.length; l++) {
                    let msg = this.debugMsgs[l];
                    if (msg.type == 'error') {
                        let line = msg.type + ": at line " + (l + 1) + " " + msg.message;
                        FS.writeSync(id, line + "\n", null, 'utf8');
                    }
                }
                for (l = 0; l < this.debugMsgs.length; l++) {
                    let msg = this.debugMsgs[l];
                    let line;
                    if (msg.type == 'eror')
                        line = msg.type + ":" + msg.message;
                    else
                        line = msg.message;
                    FS.writeSync(id, line + "\n", null, 'utf8');
                }
                FS.closeSync(id);
                this.clear();
            }
        });
    }
}
exports.Logger = Logger;
exports.logger = new Logger({ toConsole: false });
//# sourceMappingURL=common.js.map