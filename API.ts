import { Expression , Condition } from "./Expression";
import { DecisionTable, HIT_POLICY } from "./DecisionTable";

api();
function api() {

	const context = { name:'John',job: 'Analyst', salary: 50000};

	let exprResult,condResult,ruleOutput, dtOutput;

	const expr=new Expression(`salary* 1.05`);
	console.log(expr.evaluate(context));


	const cond=new Condition(`>40000`,'salary');
	console.log(cond.evaluate(context));


	const decisionTable = new DecisionTable(
		{
			name: 'Raise',
	conditionVars:[	
//			['name','string'],
			['job','string'],
			['salary','money']
		  ],
	actionVars: [
			['raise','money']
			],
	rules: [
			[1,'-',`>40000`,`salary *1.05`],
			[2,'-',`>30000`,`salary *1.1`]
			],
	hitPolicy: HIT_POLICY.Unique});
	
	dtOutput = decisionTable.evaluate(context);

	console.log(dtOutput);
}


/* */