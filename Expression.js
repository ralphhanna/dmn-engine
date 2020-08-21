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
exports.Condition = exports.Expression = void 0;
const feel = require('js-feel/dist/feel');
const FEEL = feel;
class Expression {
    constructor(script) {
        this.script = script;
    }
    get isCondition() { return false; }
    static load(json) {
        const inst = new Expression(json);
        return inst;
    }
    compile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ast = yield parse(this.script);
            // this.ast = parser.compile(this.script, this.isCondition);
        });
    }
    getState() {
        return this;
    }
    display() {
        // this.rootNode.displayExpression();
    }
    evaluate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ast)
                yield this.compile();
            if (this.ast) {
                const result = yield this.ast.build(data);
                return result;
            }
            return null;
            // const executor = new Executor(data);
            //return executor.evaluateCondition(this.rootNode, null, false);
        });
    }
}
exports.Expression = Expression;
function parse(script, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ast = yield FEEL.parse(script, options);
            return ast;
        }
        catch (exc) {
            console.log("Error in parsing " + script);
            console.log(exc.message);
            return null;
        }
    });
}
class Condition extends Expression {
    constructor(script, variableName) {
        super(script);
        this.variableName = variableName;
    }
    get isCondition() { return true; }
    compile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ast = yield parse(this.script, { startRule: 'SimpleUnaryTests' });
            // this.ast = parser.compile(this.script, this.isCondition);
        });
    }
    /*
    const condition = await feel.parse(conditionScript, { startRule: 'SimpleUnaryTests' });
    const funct = await condition.build(context, {}, 'input');
    const out = funct(inputValue);
    */
    evaluate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let value, funct, out;
            if (!this.ast)
                yield this.compile();
            if (!this.ast)
                return null;
            try {
                funct = yield this.ast.build(data, {}, 'input');
                value = getValue(data[this.variableName]);
                out = funct(value);
                return out;
            }
            catch (exc) {
                console.log(`Error in evaluating '${this.script}' for value: '${value}'`);
                console.log(`--- generated function  '${funct.toString()}'`);
                console.log(data);
                console.log(exc.message);
                return out;
            }
            //return executor.evaluateCondition(this.rootNode, value, true);
        });
    }
}
exports.Condition = Condition;
function getValue(value) {
    let val = parseFloat(value);
    if (!isNaN(val))
        return val;
    else
        return value;
}
//# sourceMappingURL=Expression.js.map