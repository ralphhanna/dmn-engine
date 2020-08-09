import { Executor } from "./Executor";
export declare class RulesDelegate {
    executor: Executor;
    context: any;
    constructor();
    init(executor: any, data: any): void;
    /**
     * called if a variable request but not found in context object
     *
     * @param name
     */
    getVariable(name: any): string;
    customFunctions(funct: any, params: any, executor: any): any;
    executeFunction(funct: any, params: any, executor: any): any;
}
