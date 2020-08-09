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
