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
const DecisionTable_1 = require("./DecisionTable");
const simple = require("dmn-moddle");
const index_1 = require("./index");
const fs = require('fs');
const DmnModdle = simple();
//test();
//testDT();
testExprs();
function testExprs() {
    return __awaiter(this, void 0, void 0, function* () {
        const exprs = [
            ['1>5', false],
            ['3=5', false],
            ['3=3', true],
            ['2 in[1..3]', true],
            ['2 in(1,2,3)', true],
            ['8 in(1,2,3)', false],
            ['25 between 20 and 5000', true],
            ['25000.25 between 20 and 5000', false],
            ['a in[1..3]', true, { a: 2 }],
            ['function(age)( age < 21)', true, { a: 2 }],
        ];
        const conds = [
            ['>5', 1, false],
            ['5', 3, false],
            ['not (5)', 3, true],
            ['not ("Manager")', "Employee", true],
            //        ['=3',3, true],       failed in parsing
            //        ['2 in[1..3]',2, true],   failed
            ["'Low','Medium','High'", 'Medium', true],
        ];
        var i;
        for (i = 0; i < exprs.length; i++) {
            const expr = exprs[i][0];
            const exp = exprs[i][1];
            let context = {};
            if (exprs[i][2]) {
                context = exprs[i][2];
                console.log(context);
            }
            const res = yield index_1.ExecuteExpression(expr, context);
            console.log(`expr: ${expr} res: ${res.toString()} vs ${exp}`);
        }
        for (i = 0; i < conds.length; i++) {
            const cond = conds[i][0];
            const val = conds[i][1];
            const exp = conds[i][2];
            let context = {};
            if (exprs[i][3]) {
                context = exprs[i][3];
                console.log(context);
            }
            else {
                context = { input: val };
            }
            console.log(cond);
            console.log(context);
            const res = yield index_1.ExecuteCondition(cond, 'input', context);
            if (res !== null)
                console.log(`condition: ${cond} res: ${res.toString()} vs ${exp}`);
        }
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('testDT');
        //    console.log(simple);
        //testDT();
        //    console.log(simple());
        const defs = yield read('table.dmn', 'definitions');
        console.log(defs);
    });
}
function read(fileName, root = 'dmn:Definitions') {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const file = fs.readFileSync(fileName, 'utf8');
            DmnModdle.fromXML(file, root, (err, definitions) => {
                if (err) {
                    reject(err);
                }
                resolve(definitions);
            });
        });
    });
}
function testDT() {
    console.log('=====');
    const dt1Json = {
        name: "Banking",
        hitPolicy: DecisionTable_1.HIT_POLICY.Any,
        conditionVars: [
            { name: 'clientType', type: 'string' },
            { name: 'onDeposit', type: 'money' },
            { name: 'netWorth', type: 'money' },
        ],
        actionVars: [
            { name: 'category', type: 'string' }
        ],
        rules: [
            //  clientType, OnDeposit, NetWorth,    -> category
            [1, `"Business"`, `<100000 `, `"High"`, `"High Value Business"`],
            [2, `"Business"`, `>=100000 `, `not "High"`, `"High Value Business"`],
            [3, `"Business"`, `<100000 `, `not ("High")`, `Business Standard"`],
            [4, `"Private"`, `>=20000 `, ` "High"`, `"Personal Wealth Management"`],
            [5, `"Private"`, `>=20000 `, `not ("High")`, `"Personal Wealth Management"`],
            [6, `"Private"`, `<20000 `, `-`, `"Personal Standard"`]
        ]
    };
    const dt2Json = {
        name: 'sample',
        hitPolicy: 'Unqiue',
        "conditionVars": [
            {
                "name": "clientType",
                "type": "string"
            },
            {
                "name": "onDeposit",
                "type": "money"
            },
            {
                "name": "netWorth",
                "type": "money"
            }
        ],
        "actionVars": [
            {
                "name": "category",
                "type": "string"
            }
        ],
        "rules": [
            [
                1,
                "\"Business\"",
                "<100000 ",
                "\"High\"",
                "\"High Value Business\""
            ],
            [2,
                "\"Business\"",
                ">=100000 ",
                "not \"High\"",
                "\"High Value Business\""
            ],
            [
                3,
                "\"Business\"",
                "<100000 ",
                "not (\"High\")",
                "Business Standard\""
            ],
            [
                4,
                "\"Private\"",
                ">=20000 ",
                " \"High\"",
                "\"Personal Wealth Management\""
            ],
            [
                5,
                "\"Private\"",
                ">=20000 ",
                "not (\"High\")",
                "\"Personal Wealth Management\""
            ],
            [
                6,
                "\"Private\"",
                "<20000 ",
                "-",
                "\"Personal Standard\""
            ]
        ]
    };
    const values = { clientType: 'Business', onDeposit: 50000, netWorth: 'High' };
    const dt1 = new DecisionTable_1.DecisionTable(dt1Json);
    const res1 = dt1.evaluate(values);
    console.log('compile');
    //console.log(decisionTable.compile());
    //console.log(decisionTable.saveAsJson());
    const res = index_1.ExecuteDecisionTable({ definition: dt2Json, data: values, options: null, loadFrom: null });
    console.log(res);
    return;
    const dt2 = new DecisionTable_1.DecisionTable(dt2Json);
    const res2 = dt2.evaluate(values);
    console.log(JSON.stringify(res1, null, 2));
    console.log(JSON.stringify(res2, null, 2));
}
/* Syntax:
  Strings:
  -------  quotes are optional if no space
           () are optional
   value:
         'value'
         value
         "value"
   condition:
         value                   means == value
         in (val1,val2,val3)
         not in (val1,val2,val3)
         startsWith('abc')
         endsWith('abc')
         contains('abc')
   
   <condition> and <condition>
   <condition> or <condition>

  numbers:
    value:
        numeric value
        , are ignored
        $ is ignored
    >   value
    <   value
    <=
    >=
    between value1, value2
    between value1 and value2

symbols
    
 */
function trimParam(param) {
    if (param.startsWith('"') && param.endsWith('"'))
        return param.substring(1, param.length - 1);
    if (param.startsWith("'") && param.endsWith("'"))
        return param.substring(1, param.length - 1);
    else
        return param.trim();
}
//# sourceMappingURL=testDT.js.map