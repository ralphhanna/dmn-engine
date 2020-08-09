export declare class GoogleSheets {
    auth: any;
    constructor();
    init(): Promise<void>;
    getRule(spreadsheetId: any, range: any): Promise<void>;
    getData(spreadsheetId: any, range: any): Promise<unknown>;
}
