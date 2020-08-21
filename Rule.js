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
exports.Rule = void 0;
const Expression_1 = require("./Expression");
class Rule {
    constructor(id, conditions, actions, conditionVars, actionVars) {
        this.conditionVars = conditionVars;
        this.actionVars = actionVars;
        this.id = id;
        let i;
        this.conditions = [];
        this.actions = [];
        for (i = 0; i < conditions.length; i++) {
            const cond = conditions[i];
            const varName = this.conditionVars[i].name;
            this.conditions.push(new Expression_1.Condition(cond, varName));
        }
        for (i = 0; i < this.actionVars.length; i++) {
            const action = actions[i];
            this.actions.push(new Expression_1.Expression(action));
        }
    }
    asJson() {
        const list = [];
        list.push(this.id);
        this.conditions.forEach(cond => { list.push(cond.script); });
        this.actions.forEach(action => { list.push(action.script); });
        return list;
    }
    compile() {
        this.conditions.forEach(cond => { cond.compile(); });
        this.actions.forEach(action => { action.compile(); });
        return null;
    }
    evaluate(data, result) {
        return __awaiter(this, void 0, void 0, function* () {
            let values = data;
            var allTrue = true;
            var c;
            for (c = 0; c < this.conditions.length; c++) {
                const cond = this.conditions[c];
                const varName = cond.variableName;
                const val = data[varName];
                const ret = yield cond.evaluate(data);
                if (!ret) {
                    //                console.log('condition:' + varName + " " + cond.script + "vs: " + val + ' not true .. skipping');
                    allTrue = false;
                    result.failedCondition = c;
                    break;
                }
                //            else
                //                console.log('condition:' + varName + " " + cond.script+ "vs: " + val + ' true');
            }
            if (allTrue) {
                result.output = {};
                for (c = 0; c < this.actions.length; c++) {
                    const action = this.actions[c];
                    const outVar = this.actionVars[c];
                    const ret = yield action.evaluate(data);
                    result.output[outVar.name] = ret;
                }
                return true;
            }
            else
                return false;
        });
    }
}
exports.Rule = Rule;
//# sourceMappingURL=Rule.js.map