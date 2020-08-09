import { EXPRESSION_TYPE } from "./common";
import { Expression, Condition } from './ExpressionNode';
import { DecisionTable, DTVariable} from './DecisionTable';


export class Rule {
    id;
    conditions: Condition[];
    actions: Expression[];
    conditionVars: DTVariable [];
    actionVars: DTVariable[];

    constructor(id, conditions: string[], actions: string[], conditionVars: DTVariable[],actionVars: DTVariable[]) {
        this.conditionVars = conditionVars;
        this.actionVars = actionVars;
        this.id = id;
        let i;
        this.conditions = [];
        this.actions = [];
        for (i = 0; i < conditions.length; i++) {
            const cond: String = conditions[i];
            const varName = this.conditionVars[i].name;
            this.conditions.push(new Condition(cond, varName));
        }
        for (i = 0; i < this.actionVars.length; i++) {
            const action: String = actions[i];
            this.actions.push(new Expression(action));
        }
    }
    asJson() {
        return [this.id,this.conditions,this.actions];
    }
    compile() {
        this.conditions.forEach(cond => { cond.compile(); });
        this.actions.forEach(action=> { action.compile(); });

        return null;
    }
    evaluate(data, result) {
        let values = data;
        var allTrue = true;
        var c;

        for (c = 0; c < this.conditions.length; c++) {
            const cond:Condition = this.conditions[c];
            const varName = cond.variableName;
            const val = data[varName];
            const ret = cond.evaluate(data);
            if (!ret) {
                console.log('condition:' + varName + " " + cond.script + "vs: " + val + ' not true .. skipping');
                allTrue = false;
                result.failedCondition = c;
                break;
            }
            else
                console.log('condition:' + varName + " " + cond.script+ "vs: " + val + ' true');

        }
        if (allTrue) {
            result.output = {};
            for (c = 0; c < this.actions.length; c++) {
                const action: Expression = this.actions[c];
                const outVar = this.actionVars[c];
                const ret = action.evaluate(data);
                result.output[outVar.name] = ret;
            }
            return true;
        }
        else
            return false;
    }
}
