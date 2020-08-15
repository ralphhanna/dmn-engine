"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionEngine = void 0;
const ExpressionNode_1 = require("./ExpressionNode");
const common_1 = require("./common");
//var REGEX = /([a-zA-Z\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
var REGEX = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
//var OPERATORS = `<>=!+-*/`;
class ExpressionEngine {
    evaluateCondition(string, value) {
        const data = { value: value, caseId: 1001, customer: 'Mr. Hanna' };
        const expr = ExpressionNode_1.Condition.compile(string, 'value');
        if (!expr)
            return null;
        const result = expr.evaluate(data);
        expr.display();
        console.log('result:' + result);
        return result;
        expr.display();
        common_1.logger.log('result:' + result);
        console.log('result:' + result);
        return result;
    }
    evaluate(string) {
        const msg = "Evaluating Expresion'" + string + "'";
        console.log(msg);
        common_1.logger.log('');
        common_1.logger.log('');
        common_1.logger.log(msg);
        common_1.logger.log('--------------------------------------');
        const data = { caseId: 1001, customer: 'Mr. Hanna' };
        const expr = ExpressionNode_1.Expression.compile(string);
        if (!expr)
            return null;
        const result = expr.evaluate(data);
        expr.display();
        console.log('result:' + result);
        return { result, expression: expr };
    }
}
exports.ExpressionEngine = ExpressionEngine;
//# sourceMappingURL=ExpressionEngine.js.map