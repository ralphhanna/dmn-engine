"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operator = void 0;
const common_1 = require("./common");
const ExpressionNode_1 = require("./ExpressionNode");
const OPERATORS = [{
        name: '^', precedenceValue: 10, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return Math.pow(values[0], values[1]);
        }
    },
    {
        name: '*', precedenceValue: 20, leftOperands: 1, rightOperands: 1,
        funct: function (operator, values) {
            return values[0] * values[1];
        }
    },
    {
        name: '/', precedenceValue: 30, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] / values[1];
        }
    },
    {
        name: '-', precedenceValue: 40, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] - values[1];
        }
    },
    {
        name: '+', precedenceValue: 50, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] + values[1];
        }
    },
    {
        name: '<', precedenceValue: 60, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] < values[1];
        }
    },
    {
        name: '>', precedenceValue: 70, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return (values[0] > values[1]);
        }
    },
    {
        name: '<=', precedenceValue: 80, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] <= values[1];
        }
    },
    {
        name: '>=', precedenceValue: 90, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] >= values[1];
        }
    },
    {
        name: '==', precedenceValue: 100, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] == values[1];
        }
    },
    {
        name: 'and', precedenceValue: 110, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] && values[1];
        }
    },
    {
        name: 'or', precedenceValue: 120, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] || values[1];
        }
    },
    {
        name: 'not', precedenceValue: 130, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return !values[0];
        }
    },
    {
        name: 'between', precedenceValue: 134, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values, executor) {
            /*  .left value
             *  .beteen
             *  ..and
             *  ...value1
             *  ...value2
             *
                1-->Operator         #2   between
                2--->Literal         #1   600                               result=<600>
                2--->Binary          #4   and
                3---->Literal        #3   500
                3---->Literal        #5   700
             */
            const v0 = values[0];
            const childAnd = expression.children[1];
            const child1 = childAnd.children[0];
            const child2 = childAnd.children[1];
            const v1 = executor.getValue(child1);
            const v2 = executor.getValue(child2);
            return (v0 >= v1 && v0 <= v2);
        }
    }];
const operatorList = [
    ['^', 10, [1, 1], [1, 1]],
    ['*', 20, [1, 1], [1, 1]],
    ['-', 30, [1, 1], [1, 1]],
    ['+', 40, [1, 1], [1, 1]],
    ['/', 50, [1, 1], [1, 1]],
    ['<', 60, [0, 1], [1, 1]],
    ['>', 70, [0, 1], [1, 1]],
    ['<=', 80, [0, 1], [1, 1]],
    ['>=', 90, [0, 1], [1, 1]],
    ['==', 100, [0, 1], [1, 1]],
    ['and', 110, [1, 1], [1, 1]],
    ['or', 120, [1, 1], [1, 1]],
    ['not', 130, [0, 1], [0, 1]],
    ['between', 140, [0, 1], [1, 1]],
];
;
/**
 *  operator definition
 *
 *      name:
 *      precedence value
 *
 *      leftOperands
 *      rightOperands
 *      conditionOperandPosition:   left or right or none
 *
 *
 * */
// example
class Operator {
    constructor(obj) {
        this.name = obj.name;
        this.precedenceValue = obj.precedenceValue;
        this.leftOperands = obj.leftOperands;
        this.rightOperands = obj.rightOperands;
        this.conditionOperand = obj.conditionOperand;
        this.function = obj.funct;
    }
    //ret = Operator.execute(expr.value, values, value, isCondition);
    static execute(name, values, expression, executor) {
        console.log(' got it ' + name);
        console.log(values);
        const operator = Operator.operatorsMap.get(name);
        if (operator) {
            return operator.function(expression, values, executor);
        }
    }
    static parse(rootNode, parser, forCondition) {
        if (!Operator.operatorsMap) {
            Operator.operatorsMap = new Map();
            Operator.operators.forEach(operStruct => {
                const oper = new Operator(operStruct);
                Operator.operatorsMap.set(oper.name, oper);
            });
        }
        for (const entry of Operator.operatorsMap.entries()) {
            const oper = entry[1];
            oper.parseOperator(rootNode, parser, forCondition);
        }
    }
    parseOperator(rootNode, parser, forCondition) {
        let leftOperands = this.leftOperands;
        let rightOperands = this.rightOperands;
        let conditionOperand;
        if (forCondition && this.conditionOperand) {
            if (this.conditionOperand == 'L')
                conditionOperand = 'L';
            ;
            if (this.conditionOperand == 'R')
                conditionOperand = 'R';
        }
        let node = rootNode.children[0];
        let moves = [];
        const self = this;
        const list = [];
        rootNode.loopUp(function (node, level) {
            //console.log(" from looping up " + node.id);
            list.push(node);
        });
        // most operators rely on two operand however 
        list.forEach(node => {
            //            debug('tree','checking node ' + node.id + " "+node.value)
            //console.log("checking operator " + node.id + " " + node.value);
            if ((node.type == common_1.EXPRESSION_TYPE.Operator ||
                node.type == common_1.EXPRESSION_TYPE.Binary ||
                node.type == common_1.EXPRESSION_TYPE.Text) && node.value == self.name) {
                if (node.type == common_1.EXPRESSION_TYPE.Text)
                    node.type = common_1.EXPRESSION_TYPE.Operator;
                if (leftOperands == 1) {
                    if (conditionOperand == 'L') {
                        const newNode = new ExpressionNode_1.ExpressionNode(common_1.EXPRESSION_TYPE.Text, node, '$$VALUE', node.position);
                        //moves.push({ node: newNode, parent: node });
                    }
                    else {
                        const opr2 = node.previous();
                        if (!opr2)
                            return parser.error("Error Operator " + self.name + " requires a left parameter");
                        opr2.move(node);
                        console.log(' moving ' + opr2.id + ' to be a child of ' + node.id);
                        //moves.push({ node: opr2, parent: node });
                    }
                }
                if (rightOperands == 1) {
                    if (conditionOperand == 'R') {
                        new ExpressionNode_1.ExpressionNode(common_1.EXPRESSION_TYPE.Text, node, '$$VALUE', node.position);
                    }
                    else {
                        const opr1 = node.next();
                        if (!opr1)
                            return parser.error("Error Operator " + self.name + " requires a right parameter");
                        opr1.move(node);
                        console.log(' moving ' + opr1.id + ' to be a child of ' + node.id);
                        //moves.push({ node: opr1, parent: node });
                    }
                }
            }
        });
        moves.forEach(move => {
            move.node.move(move.parent);
            console.log(' moving ' + move.node.id + ' to be a child of ' + move.parent.id);
        });
        return true;
    }
}
exports.Operator = Operator;
Operator.operators = OPERATORS;
//# sourceMappingURL=Operator.js.map