export * from './common';
export declare function ExecuteCondition(script: any, variable: any, context: any): Promise<any>;
export declare function ExecuteExpression(script: any, context: any): Promise<any>;
export declare function ExecuteDecisionTable({ definition, data, options, loadFrom }: {
    definition: any;
    data: any;
    options: any;
    loadFrom: any;
}): Promise<any>;
