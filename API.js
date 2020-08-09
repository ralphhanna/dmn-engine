"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExpressionNode_1 = require("./ExpressionNode");
const DecisionTable_1 = require("./DecisionTable");
api();
function api() {
    const context = { name: 'John', job: 'Analyst', salary: 50000 };
    let exprResult, condResult, ruleOutput, dtOutput;
    const expr = new ExpressionNode_1.Expression(`salary* 1.05`);
    console.log(expr.evaluate(context));
    const cond = new ExpressionNode_1.Condition(`>40000`, 'salary');
    console.log(cond.evaluate(context));
    const decisionTable = new DecisionTable_1.DecisionTable({
        name: 'Raise',
        conditionVars: [
            //			['name','string'],
            ['job', 'string'],
            ['salary', 'money']
        ],
        actionVars: [
            ['raise', 'money']
        ],
        rules: [
            [1, '-', `>40000`, `salary *1.05`],
            [2, '-', `>30000`, `salary *1.1`]
        ],
        hitPolicy: DecisionTable_1.HIT_POLICY.Unique
    });
    dtOutput = decisionTable.evaluate(context);
    console.log(dtOutput);
}
/* */ 
//# sourceMappingURL=API.js.map