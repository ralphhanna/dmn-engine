"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheets = void 0;
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const DecisionTable_1 = require("./DecisionTable");
/*
 * Decison	Vaction Allowance	Hit Policy	Collect+
Variables	Input	Input	Output	Annotation
Variable	YearsOfService	EmployeeType	Vacation	Annotation
data type	integer	string	integer
Rules:
1	-	"Contract"	0
2	-	'Executive"	4
3	-	'Employee"	2
4	>10	in ['Employee','Executive']	1	Additional Week for 10 years
5	>20	in ['Employee','Executive']	1	Another week after 20 years



Tests	5	"Employee"
 */
function parseRule(rows) {
    let dt = { name: null, hitPolicy: null, conditionVars: [], actionVars: [], rules: [], tests: [] };
    let varTypes = null;
    let c, inputStart, outputStart, annotationStart, hitPolicyPosition;
    let r = 1;
    let mode = '';
    rows.forEach(row => {
        console.log(row);
        if (row.length > 0) {
            const title = row[0];
            console.log('row ' + r + " " + title + " mode: " + mode);
            switch (title) {
                case 'Decision':
                    for (c = 1; c < row.length; c++) {
                        if (row[c] == 'Hit Policy')
                            hitPolicyPosition = c;
                    }
                    mode = 'Decision';
                    break;
                case 'Variables':
                    mode = 'VariableTypes';
                    break;
                case 'Rules:':
                    mode = 'Rules';
                    break;
                case 'Tests:':
                    mode = 'Tests';
                    break;
                default:
                    switch (mode) {
                        case 'Decision':
                            dt.name = row[0];
                            dt.hitPolicy = row[hitPolicyPosition];
                            break;
                        case 'VariableTypes':
                            for (c = 1; c < row.length; c++) {
                                if (row[c] == 'Input')
                                    inputStart = c;
                                else if (row[c] == 'Output')
                                    outputStart = c;
                                else if (row[c] == 'Annotation')
                                    annotationStart = c;
                            }
                            mode = 'Variables';
                            break;
                        case 'Variables':
                            for (c = inputStart; c < outputStart; c++) {
                                dt.conditionVars.push({ name: row[c] });
                            }
                            for (c = outputStart; c < annotationStart && c < row.length; c++) {
                                dt.actionVars.push({ name: row[c] });
                            }
                            mode = '';
                            break;
                        case 'Rules':
                            dt.rules.push(row);
                            break;
                        case 'Tests':
                            dt.tests.push(row);
                            break;
                    }
                    break;
            }
        }
        else
            mode = '';
        r++;
    });
    //console.log(dt);
    console.log(dt.tests);
    /*
    const decisionTable = new DecisionTable({
        name: dt.name, conditionVars: dt.inputVars, actionVars: dt.actionVars,
        rules: dt.rules, hitPolicy: dt.hitPolicy
    });

    console.log(decisionTable);*/
    const data = [];
    dt.tests.forEach(test => {
        const record = {};
        let i;
        for (i = 0; i < dt.conditionVars.length; i++) {
            const varName = dt.conditionVars[i].name;
            record[varName] = trimParam(test[i + 1]);
        }
        data.push(record);
        //const results = decisionTable.evaluate(data);
    });
    const results = DecisionTable_1.DecisionTable.execute(dt, data);
    console.log(results);
}
function trimParam(param) {
    if (param.startsWith('"') && param.endsWith('"'))
        return param.substring(1, param.length - 1);
    if (param.startsWith("'") && param.endsWith("'"))
        return param.substring(1, param.length - 1);
    else
        return param.trim();
}
class GoogleSheets {
    constructor() {
        this.auth = null;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let content = fs.readFileSync('credentials.json');
            //        if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Sheets API.
            //  authorize(JSON.parse(content), listMajors);
            // authorize(JSON.parse(content), doIt);
            let token = yield authorizeAsync(JSON.parse(content));
            this.auth = token;
        });
    }
    getRule(spreadsheetId, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.getData(spreadsheetId, range);
            console.log(rows);
            parseRule(rows);
        });
    }
    getData(spreadsheetId, range) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const sheets = google.sheets({ version: 'v4', auth: this.auth });
                sheets.spreadsheets.values.get({
                    // spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
                    spreadsheetId: spreadsheetId,
                    range: range,
                }, (err, res) => {
                    if (err)
                        return reject('The API returned an error: ' + err);
                    const rows = res.data.values;
                    resolve(rows);
                    let r = 1;
                    if (rows.length) {
                        console.log('Range:' + range);
                        // Print columns A and E, which correspond to indices 0 and 4.
                        rows.map((row) => {
                            //                    console.log('Row: ', r++, row);
                            //        console.log(`${row[0]}, ${row[4]}`);
                        });
                    }
                    else {
                        console.log('No data found.');
                    }
                });
            });
        });
    }
}
exports.GoogleSheets = GoogleSheets;
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
/*
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
//  authorize(JSON.parse(content), listMajors);
  authorize(JSON.parse(content), doIt);
  
});
*/
function listData(auth, spreadsheetId, range) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        // spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        spreadsheetId: spreadsheetId,
        range: range,
    }, (err, res) => {
        if (err)
            return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        let r = 1;
        if (rows.length) {
            console.log('Range:' + range);
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                console.log('Row: ', r++, row);
                //        console.log(`${row[0]}, ${row[4]}`);
            });
        }
        else {
            console.log('No data found.');
        }
    });
}
function doIt(auth) {
    var id = '13O_4UhOKB6YPybQaoRdhMqopqa0RjG8qXIIyRU7Q890'; ///edit#gid=1076308066';
    var sheetId = '1076308066';
    //listMajors(auth);
    listData(auth, id, 'Vacation');
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err)
            return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err)
                return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err)
                    return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 
        https://docs.google.com/spreadsheets/d/11h4kO2_-sLjruh77hV4ek8YgiE2r42uHs5_RyFJB_KM/edit#gid=786379238
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'A2:E',
    }, (err, res) => {
        if (err)
            return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('Name, Major:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                console.log(`${row[0]}, ${row[4]}`);
            });
        }
        else {
            console.log('No data found.');
        }
    });
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorizeAsync(credentials) {
    return __awaiter(this, void 0, void 0, function* () {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        /*
        return new Promise((resolve, reject) => {
                ...
                resolve(data)
            })
        }); */
        return new Promise((resolve, reject) => {
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) {
                    //   return getNewToken(oAuth2Client, callback);
                }
                oAuth2Client.setCredentials(JSON.parse(token));
                // callback(oAuth2Client);
                resolve(oAuth2Client);
            });
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        /*
            let content = fs.readFileSync('credentials.json');
        //        if (err) return console.log('Error loading client secret file:', err);
                // Authorize a client with credentials, then call the Google Sheets API.
                //  authorize(JSON.parse(content), listMajors);
                // authorize(JSON.parse(content), doIt);
                let token = await authorizeAsync(JSON.parse(content));
                doIt(token);
        */
        const importer = new GoogleSheets();
        yield importer.init();
        //    console.log(importer);
        var id = '13O_4UhOKB6YPybQaoRdhMqopqa0RjG8qXIIyRU7Q890'; ///edit#gid=1076308066';
        var sheetId = '1076308066';
        //listMajors(auth);
        yield importer.getRule(id, 'Vacation');
    });
}
main();
//# sourceMappingURL=google.js.map