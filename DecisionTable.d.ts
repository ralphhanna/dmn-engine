import { Rule } from "./Rule";
export declare enum HIT_POLICY {
    Unique = "Unique",
    Any = "Any",
    First = "First",
    RuleOrder = "Order",
    Collect = "Collect+"
}
export declare class DTOutput {
    input: {};
    rules: any[];
    successCount: number;
    actions: {};
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
    private processAll;
    constructor({ name, conditionVars, actionVars, rules, hitPolicy }: {
        name: any;
        conditionVars: any;
        actionVars: any;
        rules: any;
        hitPolicy: any;
    });
    /**
     * Execute a DT on the fly, passing multiple records
     * used for WebAPI
     * @param dtDefinition
     * @param data
     */
    static execute(dtDefinition: any, data: any): Promise<{
        decisionTable: DecisionTable;
        results: any[];
    }>;
    compile(): {
        rules: any[];
    };
    evaluate(data: any): Promise<any>;
    private processResults;
    save(fileName: any): void;
    static load(fileName: any): DecisionTable;
    asJson(): string;
}
