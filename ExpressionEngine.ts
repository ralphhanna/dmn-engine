import { Logger } from './common';
import { Expression, ExpressionNode, Condition } from './ExpressionNode'
import { RulesDelegate } from './RulesDelegate';

import { Executor } from './Executor';
import { logger, debug , TOKEN_GROUP ,EXPRESSION_TYPE , Options} from './common';
import { Token } from './ExpressionParser';

//var REGEX = /([a-zA-Z\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
var REGEX = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;

//var OPERATORS = `<>=!+-*/`;
export class ExpressionEngine {


    evaluateCondition(string, value) {

        const data = { value: value, caseId: 1001, customer: 'Mr. Hanna' };
        const expr = Condition.compile(string,'value');

        if (!expr)
            return null;

        const result = expr.evaluate(data);

        expr.display();
        console.log('result:' + result);
        return result;

        expr.display();
        logger.log('result:' + result);
        console.log('result:' + result);
        return result;

    }

    evaluate(string) {

        const msg = "Evaluating Expresion'" + string + "'";
        console.log(msg);
        logger.log('');
        logger.log('');
        logger.log(msg)
        logger.log('--------------------------------------');



        const data = { caseId: 1001, customer: 'Mr. Hanna' };
        const expr = Expression.compile(string);

        if (!expr)
            return null;

        const result = expr.evaluate(data);
        expr.display();
        console.log('result:' + result);
        return { result, expression: expr };

    }
    /**
     * 1,   handles function calls  looking for bracket after text 
     * 2.   special sytax for condition:
     *          > 30 days
     * 
     * @param expr
     */
}

