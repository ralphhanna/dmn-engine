import { Executor } from "./Executor";
import { ExecutionContext } from "./Addins";

class CustomFuntions extends ExecutionContext {

    fun(params, value, isCondition) {
        return true;
    }

}
export class RulesDelegate {
    executor: Executor;
    context;
    constructor() {

    }
    init(executor, data) {
        this.context= new CustomFuntions(data);
        this.executor = executor;
    }
/**
 * called if a variable request but not found in context object
 *
 * @param name
 */
    getVariable(name) {
        return 'requesting '+name+' but dont have any values';
    }
    customFunctions(funct, params,executor) {
        let obj = this.context;
        if (funct.includes('.')) {
            let path = funct.split('.');
            let i;
            for (i = 0; i < path.length; i++) {
                let name = path[i];
                if (i == path.length - 1)
                    funct = name;
                else
                    obj = obj[name];
            }
        }
        return obj[funct](params, executor);
    }
    executeFunction(funct, params, executor) {
        const value = executor.value;
        const isCondition = executor.forCondition;
        switch (funct) {
            case 'in':
                if (params.indexOf(value) != -1)
                    return true;
                else
                    return false;

                break;
            case 'startsWith':
                return value.startsWith(params[0]);
                break;
            case 'endsWith':
                return value.endsWith(params[0]);
                break;
            case 'inclues':
                return value.includes(params[0]);
                break;
            case 'between':
                return (value >= params[0] && value <= params[1]);
                break;
            default:
                return this.customFunctions(funct, params, executor);
                break;
        }


    }

}

