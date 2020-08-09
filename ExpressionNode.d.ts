import { EXPRESSION_TYPE } from './common';
export declare class Expression {
    script: any;
    rootNode: ExpressionNode;
    constructor(script: any);
    get isCondition(): Boolean;
    static compile(script: any, variableName?: string): Expression;
    static load(json: any): Expression;
    compile(): void;
    getState(): this;
    display(): void;
    evaluate(data: any): any;
}
export declare class Condition extends Expression {
    get isCondition(): Boolean;
    variableName: any;
    constructor(script: any, variableName: any);
    static compile(script: any, variableName: any): Condition;
    evaluate(data: any): any;
}
export declare class TreeNode {
    parent: any;
    children: any;
    constructor(parent: any);
    addChild(node: any): void;
    root(): any;
    first(withinParent?: boolean): void;
    next(withinParent?: boolean): any;
    previous(withinParent?: boolean): any;
    loop(funct: any, level?: number): void;
    loopUp(funct: any, level?: number): void;
    delete(): void;
    move(newParent: any): any;
}
export declare class ExpressionNode extends TreeNode {
    type: EXPRESSION_TYPE;
    value: any;
    result: any;
    position: any;
    id: any;
    static id: number;
    constructor(type: any, parent: any, value: any, position: any);
    static NewFromToken(token: any, parent: any, type?: any): ExpressionNode;
    getState(): {
        type: EXPRESSION_TYPE;
        value: any;
        children: any[];
    };
    displayExpression(level?: number): void;
    static calcTypeFromToken(token: any): EXPRESSION_TYPE.Literal | EXPRESSION_TYPE.Number | EXPRESSION_TYPE.Text | EXPRESSION_TYPE.Binary | EXPRESSION_TYPE.Operator;
}
