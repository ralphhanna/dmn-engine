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
const google_1 = require("./google");
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const importer = new google_1.GoogleSheets();
        yield importer.init();
        var id = '13O_4UhOKB6YPybQaoRdhMqopqa0RjG8qXIIyRU7Q890'; ///edit#gid=1076308066';
        var sheetId = '1076308066';
        var { decisionTable: dtDefinition, tests } = yield importer.getRule(id, 'Vacation');
        console.log('main start1');
        console.log(dtDefinition);
        console.log('tests');
        console.log(tests);
        var { decisionTable, results } = yield DecisionTable_1.DecisionTable.execute(dtDefinition, tests);
        console.log('results');
        console.log(results);
        results.forEach(record => {
            console.log(record.input);
            console.log(record);
            //        console.log("Vacation:" + record.actions.Vacation + " for row # " + record.input['__ID']);
        });
        const fileName = 'tests\\Vacation.json';
        //fs.writeFile(fileName , decisionTable.asJson() , function (err) { });
        decisionTable.save(fileName);
        const dt2 = DecisionTable_1.DecisionTable.load(fileName);
        //dt2.evaluate(tests[0]);
    });
}
main();
//# sourceMappingURL=testGoogle.js.map