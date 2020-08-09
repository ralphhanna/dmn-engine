"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionTable = exports.DTVariable = exports.HIT_POLICY = void 0;
const ExpressionNode_1 = require("./ExpressionNode");
var HIT_POLICY;
(function (HIT_POLICY) {
    HIT_POLICY["Unique"] = "U";
    HIT_POLICY["Any"] = "A";
    HIT_POLICY["First"] = "F";
    HIT_POLICY["RuleOrder"] = "R";
    HIT_POLICY["Collect"] = "C";
})(HIT_POLICY = exports.HIT_POLICY || (exports.HIT_POLICY = {}));
// https://docs.camunda.org/manual/7.9/reference/dmn11/decision-table/hit-policy/
class DTExecutor {
    constructor(dt, input) {
        this.dt = dt;
        this.input = input;
        this.context = input;
        this.results = [];
        this.rulesPassed = [];
    }
    execute() {
        var r = 0;
        this.executeRules();
        console.log(this.rulesPassed);
        console.log(this.results);
    }
    executeRules() {
        var r = 0;
        const rules = this.dt.rules;
        let ret;
        for (r = 0; r < rules.length; r++) {
            let rule = rules[r];
            const output = {};
            ret = rule.evaluate(this.input, output);
            if (ret) {
                console.log(" Rule #" + rule.id + " has returned");
                this.results.push(output);
                return;
            }
            else
                console.log(" Rule #" + rule.id + " has failed");
        }
        console.log("**No Rule has returned**");
    }
}
class Rule {
    constructor(dt, id, conditions, actions) {
        this.dt = dt;
        this.id = id;
        let i;
        this.conditions = [];
        this.actions = [];
        for (i = 0; i < conditions.length; i++) {
            const cond = conditions[i];
            const varName = dt.conditionVars[i].name;
            this.conditions.push(new ExpressionNode_1.Condition(cond, varName));
        }
        for (i = 0; i < actions.length; i++) {
            const action = actions[i];
            this.actions.push(new ExpressionNode_1.Expression(action));
        }
    }
    asJson() {
        return [this.id, this.conditions, this.actions];
    }
    compile() {
        this.conditions.forEach(cond => { cond.compile(); });
        this.actions.forEach(action => { action.compile(); });
        return null;
    }
    evaluate(data, output) {
        let values = data;
        var allTrue = true;
        var c;
        for (c = 0; c < this.conditions.length; c++) {
            const cond = this.conditions[c];
            const varName = cond.variableName;
            const val = data[varName];
            const ret = cond.evaluate(data);
            if (!ret) {
                console.log('condition:' + varName + " " + cond.script + "vs: " + val + ' not true .. skipping');
                allTrue = false;
                break;
            }
            else
                console.log('condition:' + varName + " " + cond.script + "vs: " + val + ' true');
        }
        if (allTrue) {
            for (c = 0; c < this.actions.length; c++) {
                const action = this.actions[c];
                const outVar = this.dt.actionVars[c];
                const ret = action.evaluate(data);
                output[outVar.name] = ret;
            }
            return true;
        }
        else
            return false;
    }
}
class DTVariable {
}
exports.DTVariable = DTVariable;
class DecisionTable {
    constructor({ name, conditionVars, actionVars, rules, hitPolicy }) {
        this.name = name;
        const condCount = conditionVars.length;
        const actioCount = actionVars.length;
        this.conditionVars = conditionVars;
        this.actionVars = actionVars;
        this.hitPolicy = hitPolicy;
        let id = 1;
        this.rules = [];
        rules.forEach(rule => {
            this.rules.push(new Rule(this, rule[0], rule.slice(1, condCount + 1), rule.slice(condCount + 1)));
        });
    }
    load(source) {
    }
    compile() {
        const image = { rules: [] };
        this.rules.forEach(rule => {
            image.rules.push(rule.compile());
        });
        return image;
    }
    evaluate(data) {
        this.results = [];
        var r = 0;
        const rules = this.rules;
        let ret;
        for (r = 0; r < rules.length; r++) {
            let rule = rules[r];
            const output = {};
            ret = rule.evaluate(data, output);
            if (ret) {
                console.log(" Rule #" + rule.id + " has returned");
                this.results.push(output);
                return;
            }
            else
                console.log(" Rule #" + rule.id + " has failed");
        }
        console.log("**No Rule has returned**");
    }
    saveAsJson() {
        const rules = [];
        this.rules.forEach(rule => { rules.push(rule.asJson()); });
        const obj = {
            name: this.name,
            hitPolicy: this.hitPolicy,
            conditionVars: this.conditionVars,
            actionVars: this.actionVars,
            rules: rules
        };
        return JSON.stringify(obj, null, 2);
    }
    static load(json) {
        return new DecisionTable(json);
    }
}
exports.DecisionTable = DecisionTable;
function trimParam(param) {
    if (param.startsWith('"') && param.endsWith('"'))
        return param.substring(1, param.length - 1);
    if (param.startsWith("'") && param.endsWith("'"))
        return param.substring(1, param.length - 1);
    else
        return param.trim();
}
//# sourceMappingURL=decision.js.map