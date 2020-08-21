import { GoogleSheets } from './google';

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
async function main() {


    const importer = new GoogleSheets();
    await importer.init();

    var id = '13O_4UhOKB6YPybQaoRdhMqopqa0RjG8qXIIyRU7Q890';///edit#gid=1076308066';
    var sheetId = '1076308066';
    var { decisionTable: dtDefinition, tests } = await importer.getRule(id, 'Vacation');
    console.log('main start1');
    console.log(dtDefinition);
    console.log('tests');
    console.log(tests);
    var { decisionTable, results } = await DecisionTable.execute(dtDefinition, tests);
    console.log('results')
    console.log(results);
    results.forEach(record => {
        console.log(record.input);
        console.log(record);
//        console.log("Vacation:" + record.actions.Vacation + " for row # " + record.input['__ID']);
    });
    const fileName = 'tests\\Vacation.json';
    //fs.writeFile(fileName , decisionTable.asJson() , function (err) { });
    decisionTable.save(fileName);
    const dt2 = DecisionTable.load(fileName);
    //dt2.evaluate(tests[0]);

}

main();