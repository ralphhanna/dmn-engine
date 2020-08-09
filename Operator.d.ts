/**
 *  operator definition
 *
 *      name:
 *      precedence value
 *
 *      leftOperands
 *      rightOperands
 *      conditionOperandPosition:   left or right or none
 *
 *
 * */
export declare class Operator {
    name: any;
    precedenceValue: any;
    leftOperands: any;
    rightOperands: any;
    conditionOperand: any;
    function: any;
    static operators: ({
        name: string;
        precedenceValue: number;
        leftOperands: number;
        rightOperands: number;
        funct: (expression: any, values: any) => any;
        conditionOperand?: undefined;
    } | {
        name: string;
        precedenceValue: number;
        leftOperands: number;
        rightOperands: number;
        conditionOperand: string;
        funct: (expression: any, values: any) => boolean;
    } | {
        name: string;
        precedenceValue: number;
        leftOperands: number;
        rightOperands: number;
        conditionOperand: string;
        funct: (expression: any, values: any, executor: any) => boolean;
    })[];
    static operatorsMap: any;
    constructor(obj: any);
    static execute(name: any, values: any, expression: any, executor: any): any;
    static parse(rootNode: any, parser: any, forCondition: any): void;
    parseOperator(rootNode: any, parser: any, forCondition: any): boolean;
}
