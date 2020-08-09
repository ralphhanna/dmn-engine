import { EXPRESSION_TYPE } from './common';
import { ExpressionNode } from './ExpressionNode';
import { Token } from './ExpressionParser';
export declare class TreeBuilder {
    tokens: any;
    pos: any;
    rootNode: any;
    nodes: any;
    errors: any[];
    constructor(tokens: any);
    build(forCondition: any): ExpressionNode;
    newNode(parent: any, token: Token, type?: EXPRESSION_TYPE): ExpressionNode;
    buildBrackets(rootNode: ExpressionNode): boolean;
    error(msg: any): boolean;
    buildBracketNodes(start: ExpressionNode): any;
    /**
     * check for operators and move
     * before:   operand1
     *           op
     *           operand2
     * after:    op
     *              operand1
     *              operand2
     * */
    BuildOperators(operator: any, leftOperands: any, rightOperands: any): boolean;
}
