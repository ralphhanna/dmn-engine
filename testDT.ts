import { EXPRESSION_TYPE } from "./common";
import { Expression, Condition } from './ExpressionNode';
import { HIT_POLICY, DecisionTable } from "./DecisionTable";
import { Execute } from './index';

testDT();

function testDT() {
    console.log('=====');
const dt1Json =
{
    name: "Banking",
    hitPolicy: HIT_POLICY.Any,
    conditionVars:
        [
            { name: 'clientType', type: 'string' },
            { name: 'onDeposit', type: 'money' },
            { name: 'netWorth', type: 'money' },
        ],
    actionVars:
        [
            { name: 'category', type: 'string' }
        ] ,
    rules: [
        //  clientType, OnDeposit, NetWorth,    -> category
        [1, `"Business"`, ` < 100000 `, `"High"`, `"High Value Business"`],
        [2, `"Business"`, ` >= 100000 `, `not "High"`, `"High Value Business"`],
        [3, `"Business"`, ` < 100000 `, `not ("High")`, `Business Standard"`],
        [4, `"Private"`, ` >= 20000 `, ` "High"`, `"Personal Wealth Management"`],
        [5, `"Private"`, ` >= 20000 `, `not ("High")`, `"Personal Wealth Management"`],
        [6, `"Private"`, ` < 20000 `, `-`, `"Personal Standard"`]
    ]
};

    const dt2Json =
    {
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
            ]   ,
        "rules": [
                [
                    1,
                    "\"Business\"",
                    " < 100000 ",
                    "\"High\"",
                    "\"High Value Business\""
                ],
                [ 2,
                    "\"Business\"",
                    " >= 100000 ",
                    "not \"High\"",
                    "\"High Value Business\""
            ], 
            [
                    3,
                    "\"Business\"",
                    " < 100000 ",
                    "not (\"High\")",
                    "Business Standard\""
            ],
            [
                    4,
                    "\"Private\"",
                    " >= 20000 ",
                    " \"High\"",
                    "\"Personal Wealth Management\""
            ],
            [
                    5,
                    "\"Private\"",
                    " >= 20000 ",
                    "not (\"High\")",
                    "\"Personal Wealth Management\""
            ],
            [
                    6,
                    "\"Private\"",
                    " < 20000 ",
                    "-",
                    "\"Personal Standard\""
            ]
        ]
    };

    const values = { clientType: 'Business', onDeposit: 50000, netWorth: 'High' };


    const dt1= new DecisionTable(dt1Json);

    const res1 = dt1.evaluate(values);
    
    console.log('compile');

    //console.log(decisionTable.compile());

    //console.log(decisionTable.saveAsJson());

    const res = Execute({ definition: dt2Json, data: values , options: null , loadFrom: null });
    console.log(res);
    return;
    const dt2 = new DecisionTable(dt2Json);

    const res2=dt2.evaluate(values);

    console.log(JSON.stringify(res1,null,2));
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
