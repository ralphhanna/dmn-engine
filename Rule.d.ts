import { Expression, Condition } from './Expression';
import { DTVariable } from './DecisionTable';
export declare class Rule {
    id: any;
    conditions: Condition[];
    actions: Expression[];
    conditionVars: DTVariable[];
    actionVars: DTVariable[];
    constructor(id: any, conditions: string[], actions: string[], conditionVars: DTVariable[], actionVars: DTVariable[]);
    asJson(): any[];
    compile(): any;
    evaluate(data: any, result: any): Promise<boolean>;
}
