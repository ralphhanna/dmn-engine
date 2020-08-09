import { Expression, Condition } from './ExpressionNode';
export declare enum HIT_POLICY {
    Unique = "U",
    Any = "A",
    First = "F",
    RuleOrder = "R",
    Collect = "C"
}
declare class Rule {
    id: any;
    conditions: Condition[];
    actions: Expression[];
    dt: DecisionTable;
    constructor(dt: any, id: any, conditions: any, actions: any);
    asJson(): any[];
    compile(): any;
    evaluate(data: any, output: any): boolean;
}
export declare class DTVariable {
    name: any;
    type: 'String' | 'Number' | 'Money' | 'Date';
}
export declare class DecisionTable {
    name: any;
    conditionVars: DTVariable[];
    actionVars: DTVariable[];
    rules: Rule[];
    hitPolicy: HIT_POLICY;
    results: any[];
    constructor({ name, conditionVars, actionVars, rules, hitPolicy }: {
        name: any;
        conditionVars: any;
        actionVars: any;
        rules: any;
        hitPolicy: any;
    });
    load(source: any): void;
    compile(): {
        rules: any[];
    };
    evaluate(data: any): void;
    saveAsJson(): string;
    static load(json: any): DecisionTable;
}
export {};
