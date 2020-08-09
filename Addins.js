"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionString = exports.ExpressionTime = exports.ExpressionDate = exports.ExecutionContext = void 0;
class ExecutionContext {
    constructor(data) {
        this.Date = new ExpressionDate();
        this.String = new ExpressionString();
        //this.Time = new Time();
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
    }
}
exports.ExecutionContext = ExecutionContext;
class ExpressionDate {
    now() { return new Date(); }
}
exports.ExpressionDate = ExpressionDate;
class ExpressionTime {
}
exports.ExpressionTime = ExpressionTime;
class ExpressionString {
    size(values) { console.log('String.size:', values[0], values[0].length); return values[0].length; }
    /**
     * example:
     *  String.add('Hello,',' World!')   -> returns 'Hello, World!'
     *
     * @param str1
     * @param str2
     */
    add(values) { return values[0] + values[1]; }
    substr(values) { return values[0].substr(values[1], values[2]); }
    startsWith(str, check) { return str.startsWith(check); }
    endsWith(str, check) { return str.endsWith(check); }
    contains(str1, check) { return str1.includes(check); }
}
exports.ExpressionString = ExpressionString;
//# sourceMappingURL=Addins.js.map