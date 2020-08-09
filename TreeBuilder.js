"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeBuilder = void 0;
const common_1 = require("./common");
const ExpressionNode_1 = require("./ExpressionNode");
const Operator_1 = require("./Operator");
/*
 *
 * adjust tree for simple conditions as follows:
 *
 * Simple Mode:
 * Rules:
 *  -   compare oprators (<>==) require only 1 parameter vs 2 in Script mode
 *  -
 *  -   functions first parameter is the value
 *
 *  single node ->                  add $$ ==
 *
 *  single node                     change to text to literal
 *
 *  compare operation    >=         add $$ in front
 *
 *
 *  Simple Condition                                        Script
 *  not 5                                                   $$ != 5
 *  >5                                                      $$ >5
 *  in (1,2,3)                                              in($$,1,2,3)
 *  between(a,b)                                            between($$,a,b)
 *  1+2                                                     1+2
 *
 *
 */
/* Todo:
 *
    expression
    result-expression
    handle result expressions:

    constant
        'high'
        500

    operations
        500 * 1.5

    variables
        salary * 1.5

*/
class TreeBuilder {
    constructor(tokens) {
        this.errors = [];
        this.tokens = tokens;
        this.pos = 0;
    }
    build(forCondition) {
        this.rootNode = this.newNode(null, this.tokens[0], common_1.EXPRESSION_TYPE.Root);
        this.rootNode.value = '';
        if (this.tokens.length == 1 && this.tokens[0].entry == '-') {
            this.rootNode.type = common_1.EXPRESSION_TYPE.AlwaysTrue;
            return this.rootNode;
        }
        this.tokens.forEach(token => {
            this.newNode(this.rootNode, token);
        });
        common_1.debug('tree', " before brackets ");
        this.rootNode.displayExpression();
        if (!this.buildBrackets(this.rootNode))
            return null;
        common_1.debug('tree', " after brackets ");
        this.rootNode.displayExpression();
        //  operator, ForCondition, ForExpression
        //          , left, right , left ,right
        Operator_1.Operator.parse(this.rootNode, this, forCondition);
        return this.rootNode;
    }
    newNode(parent, token, type = null) {
        return ExpressionNode_1.ExpressionNode.NewFromToken(token, parent, type);
    }
    /* check for brackets
        * before:
        *
        *   t1
        *   t2
        *   (
        *   t3
        *   t4
        *   (
        *   t5
        *   t6
        *   )
        *   )
        * after:
        *
        *   t1
        *   t2
        *   (
        *       t3
        *       t4
        *       (
        *           t5
        *           t6
        *
        *
        *   operand1
            * op
            * operand2
            * after: op
                * operand1
                * operand2
    */
    buildBrackets(rootNode) {
        let moves = [];
        let deletes = [];
        let prev = null;
        let nextNode = null;
        let node = rootNode.children[0];
        while (node) {
            common_1.debug('tree', " root checking node " + node.id);
            if (node.type == common_1.EXPRESSION_TYPE.Operator && node.value == '(') {
                this.buildBracketNodes(node);
                common_1.debug('tree', ' root got back from building bracket child' + node.id);
                node = rootNode.children[0];
            }
            else {
                node = node.next();
            }
            if (node)
                common_1.debug('tree', " root got next node" + node.id);
        }
        common_1.debug('tree', " before call fixes");
        rootNode.displayExpression();
        rootNode.loop(function (node, level) {
            common_1.debug('tree', ' loop ' + node.id);
            let prev = node.previous();
            if (prev && prev.type == common_1.EXPRESSION_TYPE.Text && node.type == common_1.EXPRESSION_TYPE.Bracket) {
                prev.type = common_1.EXPRESSION_TYPE.Call;
                common_1.debug('tree', ' moving ' + node.id + " call to " + prev.id);
                node.move(prev);
            }
        });
        rootNode.displayExpression();
        common_1.debug('tree', " after call fixes");
        return true;
    }
    error(msg) {
        console.log("**********");
        console.log(msg);
        common_1.debug('error', msg);
        this.errors.push(msg);
        console.log("**********");
        throw new Error(msg);
        return false;
    }
    buildBracketNodes(start) {
        let node = start;
        let bracketNode = null;
        let moves = [];
        let deletes = [];
        let prev = null;
        let nextNode = null;
        common_1.debug('tree', " build brackets for " + start.id);
        while (node) {
            common_1.debug('tree', " checking node " + node.id + " by " + start.id);
            if (bracketNode && node.value == '(') {
                moves.push({ node, parent: bracketNode });
                common_1.debug('tree', '  moving ' + node.id + " sub bracket  to " + bracketNode.id);
                common_1.debug('tree', '  calling sub ' + node.id);
                this.buildBracketNodes(node);
                common_1.debug('tree', ' got back from building bracket child' + node.id);
            }
            else if (node.value == '(') {
                bracketNode = node;
                node.type = common_1.EXPRESSION_TYPE.Bracket;
                /*                prev = node.previous();
                                if (prev && prev.type == EXPRESSION_TYPE.Text) {
                                    prev.type = EXPRESSION_TYPE.Call;
                //                    debug('tree',' moving ' + node.id + " call to " + prev.id);
                //                    moves.push({ node, parent: prev});
                                }
                */
            }
            else if (bracketNode && node.value == ')') {
                node.delete();
                break;
            }
            else if (bracketNode) {
                moves.push({ node, parent: bracketNode });
                common_1.debug('tree', '  moving ' + node.id + " element of ( " + bracketNode.id);
            }
            node = node.next();
        }
        moves.forEach(move => {
            move.node.move(move.parent);
        });
        start.displayExpression();
        return bracketNode;
    }
    /**
     * check for operators and move
     * before:   operand1
     *           op
     *           operand2
     * after:    op
     *              operand1
     *              operand2
     * */
    BuildOperators(operator, leftOperands, rightOperands) {
        let node = this.rootNode.children[0];
        let moves = [];
        const self = this;
        // most operators rely on two operand however 
        this.rootNode.loop(function (node, level) {
            //            debug('tree','checking node ' + node.id + " "+node.value)
            if (node.value == 'between' && node.type == 'Text') {
                console.log('between');
            }
            if ((node.type == common_1.EXPRESSION_TYPE.Operator ||
                node.type == common_1.EXPRESSION_TYPE.Binary ||
                node.type == common_1.EXPRESSION_TYPE.Text) && node.value == operator) {
                if (leftOperands == 1) {
                    const opr2 = node.previous();
                    if (!opr2)
                        return self.error("Error Operator " + operator + " requires a left parameter");
                    moves.push({ node: opr2, parent: node });
                }
                if (rightOperands == 1) {
                    const opr1 = node.next();
                    if (!opr1)
                        return self.error("Error Operator " + operator + " requires a right parameter");
                    moves.push({ node: opr1, parent: node });
                }
            }
        });
        moves.forEach(move => {
            move.node.move(move.parent);
        });
        return true;
    }
}
exports.TreeBuilder = TreeBuilder;
//# sourceMappingURL=TreeBuilder.js.map