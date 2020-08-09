import { debug, logger, EXPRESSION_TYPE, Options } from './common';

/**
 * class structure
 *      DefaultImplementor
 *          CustomImplementor
 *              DataObject  <---    custom
 *              
 * 
 * 
 * */
export class DefaultImplementor {
    Date;
    Time;
    String;
    Number;
    constructor() {
        this.Date = new ExpressionDate();
        this.String = new ExpressionString();
        //this.Time = new Time();
    }
}
export class ExecutionContext extends DefaultImplementor {
    constructor(data) {
        super();
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
    }

}

class ExpressionDate {

    now() { return new Date();}
}
class ExpressionTime {

}
class ExpressionString {
    size(values) { console.log('String.size:', values[0], values[0].length); return values[0].length; }
    /**
     * example:
     *  String.add('Hello,',' World!')   -> returns 'Hello, World!'
     * 
     * @param str1
     * @param str2
     */
    add(values) { return values[0]+ values[1]; }
    substr(values) { return values[0].substr(values[1], values[2]); }
    startsWith(str, check) { return str.startsWith(check);}
    endsWith(str, check) { return str.endsWith(check); }
    contains(str1, check) { return str1.includes(check); }
}

