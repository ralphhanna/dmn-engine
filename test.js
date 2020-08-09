"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const ExpressionEngine_1 = require("./ExpressionEngine");
function testCond(expr, value, res) {
    const engine = new ExpressionEngine_1.ExpressionEngine();
    const ret = engine.evaluateCondition(expr, value);
    if (ret !== res) {
        console.log("***Error -" + expr + " for " + value + "result: " + ret + "expecting:" + res);
        common_1.logger.log("***Error -" + expr + " for " + value + "result: " + ret + "expecting:" + res);
    }
    return;
}
function testExp(expr, res) {
    console.log('expecting: ' + res);
    common_1.logger.log('expecting: ' + res);
    const engine = new ExpressionEngine_1.ExpressionEngine();
    const ret = engine.evaluate(expr);
    if (ret !== res) {
        common_1.Options.debugExecution = true;
        common_1.Options.debugExpression = true;
        //        parser.evaluateCondition(expr, value);
        console.log("***Error -" + expr + "result: " + ret + "expecting:" + res);
        common_1.logger.log("***Error -" + expr + "result: " + ret + "expecting:" + res);
        //        throw Error("Error -" + expr + " failed for " + value);
    }
    return;
}
function runTest(list, category = '') {
    console.log(list);
    list.forEach(item => {
        const cat = item.category;
        console.log("Running " + cat.name);
        if (cat.expressions) {
            cat.expressions.forEach(expr => {
                console.log(expr);
                try {
                    testExp(expr[0], expr[1]);
                }
                catch (exc) {
                    console.log(exc);
                    common_1.logger.log(exc.message);
                }
            });
        }
        if (cat.conditions) {
            cat.conditions.forEach(expr => {
                console.log(expr);
                try {
                    testCond(expr[0], expr[1], expr[2]);
                }
                catch (exc) {
                    console.log(exc);
                    common_1.logger.log(exc.message);
                }
            });
        }
    });
}
// Structure for Expression
var scripts = [{
        category: {
            name: 'tokens syntax',
            expressions: [
                [`2 + 3 'test' > and  <  == or function - * () []`, 20],
                ["caseId", 1001],
                [`2 + 3`, 5],
                [`(2 + 3) * 4`, 20],
                [`4 * (2 + 3)`, 20],
                [`4 * (2 + (3+0))`, 20],
                [`2 + 3 * 4`, 14],
                [`3 * 4 +2`, 14],
                ['"high"', 'high'],
                [`2+3`, 5]
            ]
        }
    }
];
var conditions = [{
        category: {
            name: 'tokens syntax',
            conditions: [
                ["> 200 or < 500", 20, true],
                ["-20", '55', false],
                ["20+35", '55', true],
                ["> 200 or < 500", 20, true],
                [`'High'`, 'High', true],
                [`High`, 'Low', false],
                ["> 200 or < 500", 20, true],
                ["(> 200) or (< 500)", 20, true],
                ["(in ('abc','xyz-abc')", 'abc', true],
                ["(in ('abc','xyz-abc') ) and startsWith('a')", 'abc', true],
                ["in ('abc','xyz-abc','another entry', 9)", "abc", true],
                ["(2+3)", '5', true],
                ["2+3", '5', true],
                ["2*4", '8', true],
                ["(2+3)*4", '20', true],
                ["(in (abc,'xyz-abc') ) and startsWith('a')", 'abc', true],
                ["in (abc,'xyz-abc') and startsWith('a')", 'abc', true],
                ["75.25", '75', false],
                //["75.25", '75.25', true],    
                ["2,075.25", '75', false],
                ["2,075.25", '2075.25', true],
                ["-20", '-20', true],
                [">=75", '75', true],
                ["<=55", '55', true],
                ["==55", '55', true],
                ["2 + 3", '5', true],
                ["> 200 or < 500", 20, true],
                ["object.fun('test')", '75', true],
                ["5 + object.fun('test')", '75', true],
                ["in (abc,'xyz-abc','another entry')", "abc", true],
                ["not in (abc,'xyz-abc') ", 'abc', true],
                ["in (abc,'xyz-abc') and startsWith('a') ", 'abc', true],
                ["in (abc,'xyz-abc') and not startsWith('a') ", 'abc', false],
                ["in (abc,'xyz-abc') and startsWith('a')  and 3 ", 'abc', false],
                ["75", 'not 75', false],
                ["'High'", 'High', true],
                ["in (abc,'xyz-abc','another entry')", "abc", true],
                ["between ( 95 , 2500.0 )", 200, true],
            ]
        }
    }
];
common_1.Options.debugTokens = true;
common_1.Options.debugExpression = true;
common_1.Options.debugExecution = true;
testCond(`$ not 10 and $<500`, 20, true);
//testExp(`20 <500 `, true);
//testExp(`2 + 3`, true);
//main();
//testExp(` in ('1','2','3')`, null);
//testExp(` (1> $v1) and  funct (v1 , 2 , 3) startsWith "abc12$@!3z"`, null);
//testExp(` (1>2) and  funct (v1 , 2 , 3) `, null);
//testExp(` between a and b `, null);
//   make between an operator
//  operators:  type:   
//      L 0-1
//      R 0-2
/*console.log(process.argv);
var args = process.argv;
if (args.length > 4) {
    console.log('testing condition ' + args[2], args[3], args[4]);
   // testCond(args[2], args[3], args[4]);
}
else if (args.length > 3) {
        console.log('testing expression' + args[2], args[3]);
   // testExp(args[2], args[3]);
    }
    */
function main() {
    common_1.logger.log("starting");
    runTest(scripts);
    runTest(conditions);
    common_1.logger.save("./parser.log");
}
//# sourceMappingURL=test.js.map