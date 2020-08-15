import { Expression } from './ExpressionNode';
export declare class ExpressionEngine {
    evaluateCondition(string: any, value: any): any;
    evaluate(string: any): {
        result: any;
        expression: Expression;
    };
}
