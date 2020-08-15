export declare class GoogleSheets {
    auth: any;
    constructor();
    init(): Promise<void>;
    getRule(spreadsheetId: any, range: any): Promise<{
        decisionTable: {
            name: any;
            hitPolicy: any;
            conditionVars: any[];
            actionVars: any[];
            rules: any[];
        };
        tests: any[];
    }>;
    getData(spreadsheetId: any, range: any): Promise<unknown>;
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorizeAsync(credentials: any): Promise<unknown>;
}
