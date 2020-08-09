import { ExpressionNode } from './ExpressionNode';
export declare class Executor {
    delegate: any;
    context: any;
    forCondition: any;
    value: any;
    constructor(data: any);
    /**
 * values from bracket (1,2,3)
 *
 * */
    getParameterValues(expr: any): any[];
    /**
     * values could be children nodes or group
     * */
    getValue(child: any): any;
    getValues(expr: any): any[];
    evaluateCondition(expr: ExpressionNode, value: any, isCondition?: boolean): any;
    evaluate(expr: ExpressionNode): any;
    getNamedVariable(object: any, name: any): any;
}
