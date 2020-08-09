"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionTable = exports.DTVariable = exports.HIT_POLICY = void 0;
const Rule_1 = require("./Rule");
var HIT_POLICY;
(function (HIT_POLICY) {
    HIT_POLICY["Unique"] = "Unique";
    HIT_POLICY["Any"] = "Any";
    HIT_POLICY["First"] = "First";
    HIT_POLICY["RuleOrder"] = "Order";
    HIT_POLICY["Collect"] = "Collect+";
})(HIT_POLICY = exports.HIT_POLICY || (exports.HIT_POLICY = {}));
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
            this.rules.push(new Rule_1.Rule(rule[0], rule.slice(1, condCount + 1), rule.slice(condCount + 1), conditionVars, actionVars));
        });
    }
    processAll() {
        if (this.hitPolicy == 'Collect+')
            return true;
        else
            return false;
    }
    /**
     * Execute a DT on the fly, passing multiple records
     * used for WebAPI
     * @param dtDefinition
     * @param data
     */
    static execute(dtDefinition, data) {
        const dt = new DecisionTable(dtDefinition);
        const response = [];
        data.forEach(record => {
            response.push(dt.evaluate(record));
        });
        return response;
    }
    compile() {
        const image = { rules: [] };
        this.rules.forEach(rule => {
            image.rules.push(rule.compile());
        });
        return image;
    }
    evaluate(data) {
        const output = { _results: [], _success: 0 };
        var r = 0;
        const rules = this.rules;
        let ret;
        for (r = 0; r < rules.length; r++) {
            let rule = rules[r];
            const result = { ruleId: rule.id };
            ret = rule.evaluate(data, result);
            if (ret) {
                console.log(" Rule #" + rule.id + " has returned");
                output._success++;
                output._results.push(result);
            }
            else {
                console.log(" Rule #" + rule.id + " has failed on " + result['failedCondition'] + " condition");
                output._results.push(result);
                if (!this.processAll)
                    break;
            }
        }
        //console.log(results);
        return this.processResults(output);
        //console.log("**No Rule has returned**");
    }
    processResults(output) {
        let operation = (this.hitPolicy == 'Collect+') ? '+' : '';
        output._results.forEach(result => {
            if (result.output) {
                this.actionVars.forEach(action => {
                    switch (operation) {
                        case '':
                            output[action.name] = result.output[action.name];
                            break;
                        case '+':
                            if (output[action.name])
                                output[action.name] += result.output[action.name];
                            else
                                output[action.name] = result.output[action.name];
                            break;
                    }
                });
                if (!this.processAll) {
                    return output;
                }
            }
        });
        return output;
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
//# sourceMappingURL=DecisionTable.js.map