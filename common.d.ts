export declare enum TOKEN_GROUP {
    alpha = "alpha",
    number = "number",
    symbol = "symbol",
    space = "space"
}
export declare enum EXPRESSION_TYPE {
    Root = "Root",
    Single = "Single",
    Literal = "Literal",
    Number = "Number",
    Text = "Text",
    Binary = "Binary",
    Operator = "Operator",
    Bracket = "Bracket",
    Group = "Group",
    Call = "Call",
    Token = "",
    AlwaysTrue = "True"
}
export declare class Options {
    static debugTokens: boolean;
    static debugExpression: boolean;
    static debugExecution: boolean;
    static debugTree: boolean;
    static delegate: any;
}
export declare function debug(type: any, title: any, obj?: any): void;
export declare class Logger {
    debugMsgs: any[];
    toConsole: boolean;
    toFile: any;
    callback: any;
    constructor({ toConsole, toFile, callback }: {
        toConsole?: boolean;
        toFile?: string;
        callback?: any;
    });
    setOptions({ toConsole, toFile, callback }: {
        toConsole: any;
        toFile: any;
        callback: any;
    }): void;
    msg(message: any, type?: string): void;
    clear(): void;
    get(): any[];
    debug(message: any): void;
    warn(message: any): void;
    log(message: any): void;
    error(err: any): void;
    save(filename: any): Promise<void>;
}
export declare const logger: Logger;
