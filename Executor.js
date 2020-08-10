"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const common_1 = require("./common");
const Operator_1 = require("./Operator");
const Addins_1 = require("./Addins");
class Executor {
    constructor(data) {
        this.context = new Addins_1.ExecutionContext(data);
        this.delegate = common_1.Options.delegate;
        this.delegate.init(this, data);
    }
    /**
 * values from bracket (1,2,3)
 *
 * */
    getParameterValues(expr) {
        const bracket = expr.children[0];
        let i;
        const values = [];
        for (i = 0; i < bracket.children.length; i += 2) {
            values.push(this.getValue(bracket.children[i]));
        }
        return values;
    }
    /**
     * values could be children nodes or group
     * */
    getValue(child) {
        return this.evaluate(child);
        /*        let v2 = parseFloat(val);
                if (!isNaN(v2))
                    val = v2;
        
                return val; */
    }
    getValues(expr) {
        const values = [];
        let val;
        if (!expr) {
            console.log("ERROR null expr");
            console.log(expr);
            return null;
        }
        expr.children.forEach(child => {
            values.push(this.getValue(child));
        });
        return values;
    }
    evaluateCondition(expr, value, isCondition = true) {
        if (!expr) {
            console.log("Error null expression");
            return false;
        }
        this.forCondition = isCondition;
        this.value = value;
        let ret = this.evaluate(expr);
        if (this.forCondition) {
            if (typeof ret === "boolean") {
            }
            else {
                ret = (ret == this.value);
            }
        }
        return ret;
    }
    evaluate(expr) {
        let ret;
        common_1.debug('execution', 'executing: ' + expr.type + ' ' + expr.value);
        switch (expr.type) {
            case common_1.EXPRESSION_TYPE.AlwaysTrue:
                ret = true;
                break;
            case common_1.EXPRESSION_TYPE.Root:
                if (expr.children.length > 0) {
                    ret = this.evaluate(expr.children[0]);
                }
                break;
            case common_1.EXPRESSION_TYPE.Group:
            case common_1.EXPRESSION_TYPE.Bracket:
                if (expr.children.length > 0) {
                    ret = this.evaluate(expr.children[0]);
                }
                break;
            case common_1.EXPRESSION_TYPE.Literal:
            case common_1.EXPRESSION_TYPE.Number:
                ret = expr.value;
                break;
            case common_1.EXPRESSION_TYPE.Call: // functions 
                let params;
                let funct = expr.value;
                common_1.debug('execution', 'executing funct:' + funct);
                if (funct == '') {
                    console.log('No Function');
                    console.log(expr);
                }
                params = this.getParameterValues(expr);
                common_1.debug('execution', 'parameters');
                common_1.debug('execution', params);
                ret = this.delegate.executeFunction(funct, params, this);
                break;
            case common_1.EXPRESSION_TYPE.Text: // varaible
                common_1.debug('execution', 'variable name:' + expr.value);
                console.log(this.context);
                if (expr.value == '$$VALUE')
                    ret = this.value;
                else
                    ret = this.getNamedVariable(this.context, expr.value);
                break;
            case common_1.EXPRESSION_TYPE.Binary:
            case common_1.EXPRESSION_TYPE.Operator:
                let values = this.getValues(expr);
                common_1.debug('execution', " Operator" + expr.value, values);
                ret = Operator_1.Operator.execute(expr.value, values, expr, this);
                //ret = this.delegate.executeOperator(expr.value, values, value, isCondition);
                break;
        }
        let val = parseFloat(ret);
        if (!isNaN(val))
            ret = val;
        common_1.debug('execution', " executing " + expr.type + expr.value + " result: " + ret);
        expr.result = ret;
        return ret;
    }
    getNamedVariable(object, name) {
        let path = name.split('.');
        let i;
        for (i = 0; i < path.length; i++) {
            console.log(" checking var name " + name + " " + path[i]);
            name = path[i];
            if (object[name])
                object = object[name];
            else
                return undefined;
        }
        return object;
    }
}
exports.Executor = Executor;
//# sourceMappingURL=Executor.js.map