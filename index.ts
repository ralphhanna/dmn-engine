import { DecisionTable } from './DecisionTable';
import { Condition,Expression } from './Expression';
export * from './common';

export async function ExecuteCondition(script, variable, context) {
	const cond = new Condition(script, variable);
	return await cond.evaluate(context);
}
export async function ExecuteExpression(script,context) {
	const expr = new Expression(script);
	return await expr.evaluate(context);
}
export function ExecuteDecisionTable(
	{ definition,
		data,
		options,
		loadFrom
	}) {
	console.log(definition);
	console.log(data);


	console.log(options);
	console.log(loadFrom);

	const dt = new DecisionTable(definition);

	const res = dt.evaluate(data);
	return res;


}

