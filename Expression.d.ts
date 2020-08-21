export declare class Expression {
    script: any;
    ast: any;
    constructor(script: any);
    get isCondition(): Boolean;
    static load(json: any): Expression;
    compile(): Promise<void>;
    getState(): this;
    display(): void;
    evaluate(data: any): Promise<any>;
}
export declare class Condition extends Expression {
    get isCondition(): Boolean;
    variableName: any;
    constructor(script: any, variableName: any);
    compile(): Promise<void>;
    evaluate(data: any): Promise<any>;
}
