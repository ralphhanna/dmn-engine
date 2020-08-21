"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
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
exports.ExecuteDecisionTable = exports.ExecuteExpression = exports.ExecuteCondition = void 0;
const DecisionTable_1 = require("./DecisionTable");
const Expression_1 = require("./Expression");
__exportStar(require("./common"), exports);
function ExecuteCondition(script, variable, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const cond = new Expression_1.Condition(script, variable);
        return yield cond.evaluate(context);
    });
}
exports.ExecuteCondition = ExecuteCondition;
function ExecuteExpression(script, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const expr = new Expression_1.Expression(script);
        return yield expr.evaluate(context);
    });
}
exports.ExecuteExpression = ExecuteExpression;
function ExecuteDecisionTable({ definition, data, options, loadFrom }) {
    console.log(definition);
    console.log(data);
    console.log(options);
    console.log(loadFrom);
    const dt = new DecisionTable_1.DecisionTable(definition);
    const res = dt.evaluate(data);
    return res;
}
exports.ExecuteDecisionTable = ExecuteDecisionTable;
//# sourceMappingURL=index.js.map