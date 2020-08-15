const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

import { DecisionTable } from './DecisionTable';

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
class CSVReader {

    static parseRule(rows) {
        const dt = { name: null, hitPolicy: null, conditionVars: [], actionVars: [], rules: [] };
        const tests = [];
        let varTypes = null;
        let c, inputStart, outputStart, annotationStart, hitPolicyPosition;
        let r = 1;
        let mode = '';
        rows.forEach(row => {
            console.log(row)
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
                                let i;
                                const record = {};
                                for (i = 0; i < dt.conditionVars.length; i++) {
                                    const varName = dt.conditionVars[i].name;
                                    record[varName] = CSVReader.trimParam(row[i + 1]);
                                }
                                record['__ID'] = r;

                                tests.push(record);
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
        // console.log(dt.tests);
        return {decisionTable: dt, tests}
    }
    static trimParam(param) {
        if (param.startsWith('"') && param.endsWith('"'))
            return param.substring(1, param.length - 1);
        if (param.startsWith("'") && param.endsWith("'"))
            return param.substring(1, param.length - 1);
        else
            return param.trim();
    }
}

export class GoogleSheets {

    auth=null;
    constructor() {
    }
    async init() {
        let content = fs.readFileSync('credentials.json');
        //        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        //  authorize(JSON.parse(content), listMajors);
        // authorize(JSON.parse(content), doIt);
        let token = await this.authorizeAsync(JSON.parse(content));
        this.auth=token;
    }
    async getRule(spreadsheetId, range) {
        const rows = await this.getData(spreadsheetId, range);
        console.log(rows);
        return CSVReader.parseRule(rows);
    }
    async getData(spreadsheetId, range) {

        return new Promise((resolve, reject) => {

            const sheets = google.sheets({ version: 'v4', auth: this.auth });
            sheets.spreadsheets.values.get({
                // spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
                spreadsheetId: spreadsheetId,
                range: range,
            }, (err, res) => {
                if (err) return reject('The API returned an error: ' + err);
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
                } else {
                    console.log('No data found.');
                }

            });
        });
    }
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async authorizeAsync(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    /*
    return new Promise((resolve, reject) => {
            ...
            resolve(data)
        })
    }); */

    return new Promise((resolve, reject) => {

        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                //   return getNewToken(oAuth2Client, callback);
            }
            oAuth2Client.setCredentials(JSON.parse(token));
            // callback(oAuth2Client);
            resolve(oAuth2Client)
        });

    });

}
}

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
async function main() {


    const importer = new GoogleSheets();
    await importer.init();

    var id = '13O_4UhOKB6YPybQaoRdhMqopqa0RjG8qXIIyRU7Q890';///edit#gid=1076308066';
    var sheetId = '1076308066';
    var { decisionTable: dtDefinition , tests } = await importer.getRule(id, 'Vacation');
    console.log(decisionTable);
    console.log(tests);
    var { decisionTable, results } = DecisionTable.execute(dtDefinition, tests);
    console.log(results);
    results.forEach(record => {
        console.log(record.input);
        console.log("Vacation:" + record.actions.Vacation + " for row # " + record.input['__ID']);
    });
    const fileName = 'tests\\Vacation.json';
    //fs.writeFile(fileName , decisionTable.asJson() , function (err) { });
    decisionTable.save(fileName);
    const dt2 = DecisionTable.load(fileName);
    dt2.evaluate(tests[0]);

}

main();