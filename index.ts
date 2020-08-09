import { DecisionTable } from './DecisionTable';

export * from './common';
export * from './DecisionTable';
export * from './ExpressionNode';
export * from './RulesDelegate';

export async function WebService(request, response) {
	console.log(request);
	console.log(response);
	let { definition, data, options, loadFrom } = request.body;
	response.json(Execute(request.body));
}
export function Execute(
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

