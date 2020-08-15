/**
 * class structure
 *      DefaultImplementor
 *          CustomImplementor
 *              DataObject  <---    custom
 *
 *
 *
 * */
export declare class DefaultImplementor {
    Date: any;
    Time: any;
    String: any;
    Number: any;
    constructor();
}
export declare class ExecutionContext extends DefaultImplementor {
    constructor(data: any);
}
export declare class ExpressionDate {
    now(): Date;
}
export declare class ExpressionTime {
}
export declare class ExpressionString {
    size(values: any): any;
    /**
     * example:
     *  String.add('Hello,',' World!')   -> returns 'Hello, World!'
     *
     * @param str1
     * @param str2
     */
    add(values: any): any;
    substr(values: any): any;
    startsWith(str: any, check: any): any;
    endsWith(str: any, check: any): any;
    contains(str1: any, check: any): any;
}
