export * from './common';
export * from './DecisionTable';
export * from './ExpressionNode';
export declare function WebService(request: any, response: any): Promise<void>;
export declare function Execute({ definition, data, options, loadFrom }: {
    definition: any;
    data: any;
    options: any;
    loadFrom: any;
}): any;
