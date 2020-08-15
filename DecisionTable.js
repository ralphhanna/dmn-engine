"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionTable = exports.DTVariable = exports.DTOutput = exports.HIT_POLICY = void 0;
const Rule_1 = require("./Rule");
const fs = require('fs');
var HIT_POLICY;
(function (HIT_POLICY) {
    HIT_POLICY["Unique"] = "Unique";
    HIT_POLICY["Any"] = "Any";
    HIT_POLICY["First"] = "First";
    HIT_POLICY["RuleOrder"] = "Order";
    HIT_POLICY["Collect"] = "Collect+";
})(HIT_POLICY = exports.HIT_POLICY || (exports.HIT_POLICY = {}));
class DTOutput {
    constructor() {
        this.input = {};
        this.rules = [];
        this.successCount = 0;
        this.actions = {};
    }
}
exports.DTOutput = DTOutput;
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
        return { decisionTable: dt, results: response };
    }
    compile() {
        const image = { rules: [] };
        this.rules.forEach(rule => {
            image.rules.push(rule.compile());
        });
        return image;
    }
    evaluate(data) {
        const output = new DTOutput(); //= { _results: [], _success: 0 };
        var r = 0;
        output.input = data;
        const rules = this.rules;
        let ret;
        for (r = 0; r < rules.length; r++) {
            let rule = rules[r];
            const result = { ruleId: rule.id };
            ret = rule.evaluate(data, result);
            if (ret) {
                console.log(" Rule #" + rule.id + " has returned");
                output.successCount++;
                output.rules.push(result);
                if (!this.processAll)
                    break;
            }
            else {
                console.log(" Rule #" + rule.id + " has failed on " + result['failedCondition'] + " condition");
                output.rules.push(result);
            }
        }
        //console.log(results);
        return this.processResults(output);
        //console.log("**No Rule has returned**");
    }
    processResults(output) {
        let operation = (this.hitPolicy == 'Collect+') ? '+' : '';
        output.rules.forEach(result => {
            if (result.output) {
                console.log("output:");
                console.log(result.output);
                this.actionVars.forEach(action => {
                    switch (operation) {
                        case '':
                            output[action.name] = result.output[action.name];
                            break;
                        case '+':
                            if (output.actions[action.name])
                                output.actions[action.name] += result.output[action.name];
                            else
                                output.actions[action.name] = result.output[action.name];
                            break;
                    }
                });
                if (!this.processAll) {
                    return output;
                }
            }
        });
        console.log(output);
        return output;
    }
    save(fileName) {
        fs.writeFileSync(fileName, this.asJson(), function (err) { });
    }
    static load(fileName) {
        const json = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' });
        console.log(json);
        return new DecisionTable(JSON.parse(json));
    }
    asJson() {
        const rules = [];
        this.rules.forEach(rule => {
            console.log(rule.asJson());
            rules.push(rule.asJson());
        });
        const obj = {
            name: this.name,
            hitPolicy: this.hitPolicy,
            conditionVars: this.conditionVars,
            actionVars: this.actionVars,
            rules: rules
        };
        console.log(obj);
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