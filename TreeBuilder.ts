import { RulesDelegate } from './RulesDelegate';
import { logger, debug , TOKEN_GROUP ,EXPRESSION_TYPE} from './common';
import { ExpressionNode, TreeNode } from './ExpressionNode';
import { Token } from './ExpressionParser';
import { Operator } from './Operator';


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
export class TreeBuilder {
    tokens;
    pos;    // currentToken
    rootNode;
    nodes;
    errors=[];
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    build(forCondition):ExpressionNode {

        this.rootNode = this.newNode(null, this.tokens[0], EXPRESSION_TYPE.Root);
        this.rootNode.value = '';
        if (this.tokens.length == 1 && this.tokens[0].entry == '-') {
            this.rootNode.type = EXPRESSION_TYPE.AlwaysTrue;
            return this.rootNode;
        }
        this.tokens.forEach(token => {
            this.newNode(this.rootNode, token);
        });
        debug('tree'," before brackets ");
        this.rootNode.displayExpression();

        if (!this.buildBrackets(this.rootNode))
            return null;

        debug('tree'," after brackets ");
        this.rootNode.displayExpression();
        //  operator, ForCondition, ForExpression
        //          , left, right , left ,right
        Operator.parse(this.rootNode,this,forCondition);

        return this.rootNode;
    }
    newNode(parent, token: Token, type: EXPRESSION_TYPE =null) {
        return ExpressionNode.NewFromToken(token, parent, type);
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
    buildBrackets(rootNode: ExpressionNode) {

        let moves = [];
        let deletes = [];
        let prev = null;
        let nextNode = null;
        let node = rootNode.children[0];

        while (node) {
            debug('tree'," root checking node " + node.id );

            if (node.type == EXPRESSION_TYPE.Operator && node.value == '(') {
                this.buildBracketNodes(node);

                debug('tree',' root got back from building bracket child' + node.id);
                node = rootNode.children[0];
            }
            else {
                node = node.next();

            }
            if (node)
                debug('tree'," root got next node" + node.id);
        }
        debug('tree'," before call fixes");
        rootNode.displayExpression();

        rootNode.loop(function (node, level) {
            debug('tree',' loop ' + node.id);
            let prev = node.previous();
            if (prev && prev.type == EXPRESSION_TYPE.Text && node.type == EXPRESSION_TYPE.Bracket) {
                prev.type = EXPRESSION_TYPE.Call;
                debug('tree',' moving ' + node.id + " call to " + prev.id);
                node.move(prev);
            }
        });
        rootNode.displayExpression();
        debug('tree'," after call fixes");

        return true;
    }
    error(msg) {
        console.log("**********");
        console.log(msg);
        debug('error', msg);
        this.errors.push(msg);
        console.log("**********");
        throw new Error(msg);

        return false;
    }
    buildBracketNodes(start: ExpressionNode) {

        let node = start;
        let bracketNode = null;
        let moves = [];
        let deletes = [];
        let prev = null;
        let nextNode = null;
        debug('tree'," build brackets for " + start.id);
        while (node) {
            debug('tree'," checking node " + node.id + " by " + start.id);

            if (bracketNode && node.value == '(') {
                moves.push({ node, parent: bracketNode });
                debug('tree','  moving ' + node.id + " sub bracket  to " + bracketNode.id);
                debug('tree','  calling sub ' + node.id);
                this.buildBracketNodes(node);
                debug('tree',' got back from building bracket child' + node.id);
            }
            else if (node.value == '(') {
                bracketNode = node;
                node.type = EXPRESSION_TYPE.Bracket;
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
                debug('tree','  moving ' + node.id + " element of ( " + bracketNode.id);
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
    BuildOperators(operator,leftOperands,rightOperands) {

        let node = this.rootNode.children[0];
        let moves = [];
        const self = this;

        // most operators rely on two operand however 
        this.rootNode.loop(function (node, level) {
//            debug('tree','checking node ' + node.id + " "+node.value)
            if (node.value == 'between' && node.type == 'Text' )
        {
                console.log('between');
        }

            if ((node.type == EXPRESSION_TYPE.Operator ||
                node.type == EXPRESSION_TYPE.Binary ||
                node.type == EXPRESSION_TYPE.Text
            ) && node.value == operator) {

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

