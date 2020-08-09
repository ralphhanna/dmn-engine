(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ExprEngine = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContext = void 0;
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
    add(values) { return values[0] + values[1]; }
    substr(values) { return values[0].substr(values[1], values[2]); }
    startsWith(str, check) { return str.startsWith(check); }
    endsWith(str, check) { return str.endsWith(check); }
    contains(str1, check) { return str1.includes(check); }
}

},{}],3:[function(require,module,exports){
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
        let val = this.evaluate(child);
        let v2 = parseFloat(val);
        if (!isNaN(v2))
            val = v2;
        return val;
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

},{"./Addins":2,"./Operator":7,"./common":10}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionEngine = void 0;
const ExpressionNode_1 = require("./ExpressionNode");
const common_1 = require("./common");
const ExpressionParser_1 = require("./ExpressionParser");
//var REGEX = /([a-zA-Z\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
var REGEX = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
//var OPERATORS = `<>=!+-*/`;
class ExpressionEngine {
    evaluateCondition(string, value) {
        const data = { caseId: 1001, customer: 'Mr. Hanna' };
        const expr = ExpressionNode_1.Expression.compile(string, true);
        if (!expr)
            return null;
        const result = expr.evaluateCondition(data, value);
        expr.display();
        console.log('result:' + result);
        return result;
        expr.display();
        common_1.logger.log('result:' + result);
        console.log('result:' + result);
        return result;
    }
    evaluate(string) {
        const msg = "Evaluating Expresion'" + string + "'";
        console.log(msg);
        common_1.logger.log('');
        common_1.logger.log('');
        common_1.logger.log(msg);
        common_1.logger.log('--------------------------------------');
        const data = { caseId: 1001, customer: 'Mr. Hanna' };
        const expr = ExpressionNode_1.Expression.compile(string, false);
        if (!expr)
            return null;
        const result = expr.evaluate(data);
        expr.display();
        console.log('result:' + result);
        return { result, expression: expr };
    }
    static tokenize(string) {
        /*
        Advanced Regex explanation:
        [a-zA-Z\u0080-\u00FF] instead of \w     Supports some Unicode letters instead of ASCII letters only. Find Unicode ranges here https://apps.timwhitlock.info/js/regex
        
        (\.\.\.|\.|,|!|\?)                      Identify ellipsis (...) and points as separate entities
        
        You can improve it by adding ranges for special punctuation and so on
        */
        //var advancedRegex = /([a-zA-Z\u0080-\u00FF]+)|([0-9]+)|(\.\.\.|\.|,|!|\?|\)|\(|\"|\'|<|>|-)|(\s)/g;
        console.log(string);
        console.log("-------------------------------------");
        var result = null;
        var seps = [];
        do {
            result = REGEX.exec(string);
            if (result) {
                let msg = '@' + result.index + " ";
                let g = 0;
                result.forEach(entry => {
                    if (entry && g > 0) {
                        msg += ' g#:' + g + ExpressionParser_1.Token.groups[g - 1] + " " + entry;
                        const token = new ExpressionParser_1.Token();
                        token.index = result.index;
                        token.group = ExpressionParser_1.Token.groups[g - 1];
                        token.entry = entry;
                        //seps.push({ index: result.index, group: groups[g - 1], entry });
                        seps.push(token);
                        //console.log(msg);
                    }
                    g++;
                });
                //            console.log(msg);
            }
        } while (result != null);
        if (common_1.Options.debugTokens)
            console.log(seps);
        return seps;
    }
    /**
     * 1,   handles function calls  looking for bracket after text
     * 2.   special sytax for condition:
     *          > 30 days
     *
     * @param expr
     */
    postParse(expr) {
    }
    /**
      * 1.  handles quotes  '/"
      * 2.  handles commas in numbers
      * 3.  spaces
      * 4.  double operators    >=  <=  ==
      * 5.  -number should be one token     like -20
      * 6.  mark
      *
      * @param seps
      */
    preParse(seps) {
        let i;
        let quote = null;
        let tokens = [];
        let textEntry;
        let prevEntry;
        for (i = 0; i < seps.length; i++) {
            let sep = seps[i];
            if (quote) {
                if (sep.entry == quote) {
                    textEntry.group = 'literal';
                    tokens.push(textEntry);
                    quote = null;
                    textEntry = null;
                }
                else {
                    if (textEntry)
                        textEntry.entry += sep.entry;
                    else
                        textEntry = sep;
                }
            }
            else if (sep.group == 'symbol' && (sep.entry == '\'' || sep.entry == '"')) {
                quote = sep.entry;
            }
            else if (sep.group == 'space') {
                ; // ignore
            }
            else if (prevEntry && sep.group == 'symbol' && (sep.entry == ',') && prevEntry.group == 'number') {
                //   ignore , and merge next number to previous
                sep = seps[++i];
                prevEntry.entry += sep.entry;
                sep.entry = prevEntry.entry;
            }
            else if (prevEntry && sep.group == 'symbol' && (sep.entry == '=') &&
                prevEntry.group == 'symbol' &&
                (prevEntry.entry == '<' || prevEntry.entry == '>' || prevEntry.entry == '=')) {
                //   ignore , and merge next number to previous
                prevEntry.entry += sep.entry;
            }
            //  5.  -number should be one token     like -20
            else if (prevEntry && sep.group == 'number' && prevEntry.entry == '-') {
                //   ignore , and merge next number to previous
                prevEntry.entry += sep.entry;
            }
            else {
                tokens.push(sep);
            }
            prevEntry = sep;
        }
        for (i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.group == 'symbol' && token.entry == '{') {
                let j;
                let bracketLevel = 0;
                for (j = i + 1; j < tokens.length; j++) {
                    if (tokens[j].entry == '(')
                        bracketLevel++;
                    if (tokens[j].entry == ')')
                        bracketLevel--;
                    if (bracketLevel == 0) {
                        token.bracketEndToken = j;
                        break;
                    }
                }
            }
        }
        //console.log(tokens);
        if (common_1.Options.debugTokens) {
            console.log(' after cleaning..');
            console.log(tokens);
        }
        return tokens;
    }
}
exports.ExpressionEngine = ExpressionEngine;

},{"./ExpressionNode":5,"./ExpressionParser":6,"./common":10}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionNode = exports.TreeNode = exports.Expression = void 0;
const common_1 = require("./common");
const ExpressionParser_1 = require("./ExpressionParser");
const Executor_1 = require("./Executor");
class Expression {
    static compile(script, forCondition) {
        const inst = new Expression();
        inst.script = script;
        const parser = new ExpressionParser_1.Parser();
        inst.rootNode = parser.compile(script, forCondition);
        return inst;
    }
    static load(json) {
        const inst = new Expression();
        return inst;
    }
    getState() {
        return this;
    }
    display() {
        this.rootNode.displayExpression();
    }
    evaluate(data) {
        const executor = new Executor_1.Executor(data);
        return executor.evaluateCondition(this.rootNode, null, false);
    }
    evaluateCondition(data, value) {
        const executor = new Executor_1.Executor(data);
        return executor.evaluateCondition(this.rootNode, value, true);
    }
}
exports.Expression = Expression;
class TreeNode {
    constructor(parent) {
        this.parent = parent;
        if (parent)
            parent.children.push(this);
        this.children = [];
    }
    addChild(node) {
        this.children.push(node);
    }
    root() {
        if (this.parent)
            return this.parent.root();
        else
            return this;
    }
    first(withinParent = false) {
    }
    next(withinParent = false) {
        let index = this.parent.children.indexOf(this);
        if (index >= 0 && index < this.parent.children.length - 1)
            return this.parent.children[index + 1];
        else
            return null;
    }
    previous(withinParent = false) {
        if (!this.parent)
            return null;
        let index = this.parent.children.indexOf(this);
        if (index >= 1 && index <= this.parent.children.length - 1)
            return this.parent.children[index - 1];
        else
            return null;
    }
    loop(funct, level = 0) {
        funct(this, level);
        this.children.forEach(child => {
            if (child.parent !== this)
                console.log("ERROR parent is wrong" + child.parent);
            child.loop(funct, level + 1);
        });
    }
    loopUp(funct, level = 0) {
        let i;
        for (i = this.children.length - 1; i >= 0; i--) {
            let child = this.children[i];
            if (child.parent !== this)
                console.log("ERROR parent is wrong" + child.parent);
            child.loopUp(funct, level + 1);
        }
        funct(this, level);
    }
    delete() {
        removeFromArray(this.parent.children, this);
    }
    move(newParent) {
        const oldParent = this.parent;
        if (oldParent)
            removeFromArray(this.parent.children, this);
        newParent.children.push(this);
        this.parent = newParent;
        return oldParent;
    }
}
exports.TreeNode = TreeNode;
function removeFromArray(array, item) {
    const index = array.indexOf(item, 0);
    if (index > -1) {
        array.splice(index, 1);
    }
}
class ExpressionNode extends TreeNode {
    constructor(type, parent, value, position) {
        super(parent);
        this.type = type;
        this.parent = parent;
        this.value = value;
        this.position = position;
        this.id = ExpressionNode.id++;
    }
    static NewFromToken(token, parent, type = null) {
        if (!token)
            return null;
        if (!type)
            type = ExpressionNode.calcTypeFromToken(token);
        return new ExpressionNode(type, parent, token.entry, token.index);
    }
    getState() {
        const children = [];
        this.children.forEach(child => { children.push(child.getState()); });
        return { type: this.type, value: this.value, children };
    }
    displayExpression(level = 0) {
        if (!common_1.Options.debugExpression)
            return;
        this.loop(function (expr, level) {
            let res = (expr.result ? `result=<${expr.result}>   ` : '');
            const msg = level + '-'.repeat(level + 1) + ">" + expr.type + " " + expr.value + "   " + res + 'id:' + expr.id;
            common_1.debug('expression', msg);
        }, level);
        /*
        this.children.forEach(child => {
            if (child.parent !== this)
                console.log("ERROR parent is wrong"+child.parent)
            child.displayExpression( level + 1);
        }); */
    }
    static calcTypeFromToken(token) {
        let type;
        if (token.group == 'number')
            return common_1.EXPRESSION_TYPE.Number;
        else if (token.group == 'literal' || (!isNaN(token.entry)))
            return common_1.EXPRESSION_TYPE.Literal;
        else if (token.group == 'alpha' && (token.entry == 'and' || token.entry == 'or' || token.entry == 'not'))
            return common_1.EXPRESSION_TYPE.Binary;
        else if (token.group == 'alpha')
            return common_1.EXPRESSION_TYPE.Text;
        else if (token.group == 'symbol')
            return common_1.EXPRESSION_TYPE.Operator;
    }
}
exports.ExpressionNode = ExpressionNode;
ExpressionNode.id = 0;

},{"./Executor":3,"./ExpressionParser":6,"./common":10}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.Token = void 0;
const ExpressionNode_1 = require("./ExpressionNode");
const TreeBuilder_1 = require("./TreeBuilder");
const common_1 = require("./common");
//var REGEX = /([a-zA-Z\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
// var REGEX = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
var group1 = `[0-9\.]+`;
var group2 = `[a-zA-Z0-9\u0080-\u00FF\.\_]+`;
var group3 = `[,|!|\?|\)|\(|\"|\'|<|=|>|\+|\-|\*|\/]`;
var group4 = "\\s";
var group5 = `[^A-Za-z]`;
let REGEX = '';
[group1, group2, group4, group5].forEach(gr => {
    if (REGEX == '')
        REGEX = '(' + gr + ')';
    else
        REGEX += '|(' + gr + ')';
});
var BINARY_OPERATORS = ['and', 'or', 'not', '!'];
var OPERATORS = ['*', '+', '-', , `/`,
    `<`, `>`, `>=`, `<=`];
class Token {
    isOperator() {
        return (this.group == 'symbol' && OPERATORS.includes(this.entry));
    }
    isLiteral() {
    }
}
exports.Token = Token;
Token.groups = ['number', 'alpha', 'space', 'symbol'];
class Parser {
    compile(string, forCondtion) {
        ExpressionNode_1.ExpressionNode.id = 0;
        let tokens = Parser.tokenize(string);
        tokens = this.preParse(tokens);
        const builder = new TreeBuilder_1.TreeBuilder(tokens);
        const expr = builder.build(forCondtion);
        if (!expr)
            return null;
        this.postParse(expr);
        expr.displayExpression();
        return expr;
    }
    static tokenize(string) {
        /*
        Advanced Regex explanation:
        [a-zA-Z\u0080-\u00FF] instead of \w     Supports some Unicode letters instead of ASCII letters only. Find Unicode ranges here https://apps.timwhitlock.info/js/regex
        
        (\.\.\.|\.|,|!|\?)                      Identify ellipsis (...) and points as separate entities
        
        You can improve it by adding ranges for special punctuation and so on
        */
        //var advancedRegex = /([a-zA-Z\u0080-\u00FF]+)|([0-9]+)|(\.\.\.|\.|,|!|\?|\)|\(|\"|\'|<|>|-)|(\s)/g;
        console.log(string);
        console.log("-------------------------------------");
        var result = null;
        var seps = [];
        let re = new RegExp(REGEX, "gi");
        do {
            result = re.exec(string);
            if (result) {
                let msg = '@' + result.index + " ";
                let g = 0;
                result.forEach(entry => {
                    if (entry && g > 0) {
                        msg += ' g#:' + g + Token.groups[g - 1] + " " + entry;
                        const token = new Token();
                        token.index = result.index;
                        token.group = Token.groups[g - 1];
                        token.entry = entry;
                        //seps.push({ index: result.index, group: groups[g - 1], entry });
                        seps.push(token);
                        //console.log(msg);
                    }
                    g++;
                });
                //            console.log(msg);
            }
        } while (result != null);
        if (common_1.Options.debugTokens)
            console.log(seps);
        return seps;
    }
    /**
     * 1,   handles function calls  looking for bracket after text
     * 2.   special sytax for condition:
     *          > 30 days
     *
     * @param expr
     */
    postParse(expr) {
    }
    /**
      * 1.  handles quotes  '/"
      * 2.  handles commas in numbers
      * 3.  spaces
      * 4.  double operators    >=  <=  ==
      * 5.  -number should be one token     like -20 NNOO
      * 6.  mark
      *
      * @param seps
      */
    preParse(seps) {
        let i;
        let quote = null;
        let tokens = [];
        let textEntry;
        let prevEntry;
        for (i = 0; i < seps.length; i++) {
            let sep = seps[i];
            if (quote) {
                if (sep.entry == quote) {
                    textEntry.group = 'literal';
                    tokens.push(textEntry);
                    quote = null;
                    textEntry = null;
                }
                else {
                    if (textEntry)
                        textEntry.entry += sep.entry;
                    else
                        textEntry = sep;
                }
            }
            else if (sep.group == 'symbol' && (sep.entry == '\'' || sep.entry == '"')) {
                quote = sep.entry;
            }
            else if (sep.group == 'space') {
                ; // ignore
            }
            else if (prevEntry && sep.group == 'symbol' && (sep.entry == ',') && prevEntry.group == 'number') {
                //   ignore , and merge next number to previous
                sep = seps[++i];
                prevEntry.entry += sep.entry;
                sep.entry = prevEntry.entry;
            }
            else if (prevEntry && sep.group == 'symbol' && (sep.entry == '=') &&
                prevEntry.group == 'symbol' &&
                (prevEntry.entry == '<' || prevEntry.entry == '>' || prevEntry.entry == '=')) {
                //   ignore , and merge next number to previous
                prevEntry.entry += sep.entry;
            }
            //  5.  -number should be one token     like -20
            /*
            else if (prevEntry && sep.group == 'number' && prevEntry.entry == '-') {
                //   ignore , and merge next number to previous
                prevEntry.entry += sep.entry;
            } */
            else {
                tokens.push(sep);
            }
            prevEntry = sep;
        }
        for (i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.group == 'symbol' && token.entry == '{') {
                let j;
                let bracketLevel = 0;
                for (j = i + 1; j < tokens.length; j++) {
                    if (tokens[j].entry == '(')
                        bracketLevel++;
                    if (tokens[j].entry == ')')
                        bracketLevel--;
                    if (bracketLevel == 0) {
                        token.bracketEndToken = j;
                        break;
                    }
                }
            }
        }
        //console.log(tokens);
        if (common_1.Options.debugTokens) {
            console.log(' after cleaning..');
            console.log(tokens);
        }
        return tokens;
    }
}
exports.Parser = Parser;

},{"./ExpressionNode":5,"./TreeBuilder":9,"./common":10}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operator = void 0;
const common_1 = require("./common");
const ExpressionNode_1 = require("./ExpressionNode");
const OPERATORS = [{
        name: '^', precedenceValue: 10, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return Math.pow(values[0], values[1]);
        }
    },
    {
        name: '*', precedenceValue: 20, leftOperands: 1, rightOperands: 1,
        funct: function (operator, values) {
            return values[0] * values[1];
        }
    },
    {
        name: '/', precedenceValue: 30, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] / values[1];
        }
    },
    {
        name: '-', precedenceValue: 40, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] - values[1];
        }
    },
    {
        name: '+', precedenceValue: 50, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] + values[1];
        }
    },
    {
        name: '<', precedenceValue: 60, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] < values[1];
        }
    },
    {
        name: '>', precedenceValue: 70, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return (values[0] > values[1]);
        }
    },
    {
        name: '<=', precedenceValue: 80, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] <= values[1];
        }
    },
    {
        name: '>=', precedenceValue: 90, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] >= values[1];
        }
    },
    {
        name: '==', precedenceValue: 100, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return values[0] == values[1];
        }
    },
    {
        name: 'and', precedenceValue: 110, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] && values[1];
        }
    },
    {
        name: 'or', precedenceValue: 120, leftOperands: 1, rightOperands: 1,
        funct: function (expression, values) {
            return values[0] || values[1];
        }
    },
    {
        name: 'not', precedenceValue: 130, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values) {
            return !values[0];
        }
    },
    {
        name: 'between', precedenceValue: 134, leftOperands: 1, rightOperands: 1, conditionOperand: 'L',
        funct: function (expression, values, executor) {
            /*  .left value
             *  .beteen
             *  ..and
             *  ...value1
             *  ...value2
             *
                1-->Operator         #2   between
                2--->Literal         #1   600                               result=<600>
                2--->Binary          #4   and
                3---->Literal        #3   500
                3---->Literal        #5   700
             */
            const v0 = values[0];
            const childAnd = expression.children[1];
            const child1 = childAnd.children[0];
            const child2 = childAnd.children[1];
            const v1 = executor.getValue(child1);
            const v2 = executor.getValue(child2);
            return (v0 >= v1 && v0 <= v2);
        }
    }];
const operatorList = [
    ['^', 10, [1, 1], [1, 1]],
    ['*', 20, [1, 1], [1, 1]],
    ['-', 30, [1, 1], [1, 1]],
    ['+', 40, [1, 1], [1, 1]],
    ['/', 50, [1, 1], [1, 1]],
    ['<', 60, [0, 1], [1, 1]],
    ['>', 70, [0, 1], [1, 1]],
    ['<=', 80, [0, 1], [1, 1]],
    ['>=', 90, [0, 1], [1, 1]],
    ['==', 100, [0, 1], [1, 1]],
    ['and', 110, [1, 1], [1, 1]],
    ['or', 120, [1, 1], [1, 1]],
    ['not', 130, [0, 1], [0, 1]],
    ['between', 140, [0, 1], [1, 1]],
];
;
/**
 *  operator definition
 *
 *      name:
 *      precedence value
 *
 *      leftOperands
 *      rightOperands
 *      conditionOperandPosition:   left or right or none
 *
 *
 * */
// example
class Operator {
    constructor(obj) {
        this.name = obj.name;
        this.precedenceValue = obj.precedenceValue;
        this.leftOperands = obj.leftOperands;
        this.rightOperands = obj.rightOperands;
        this.conditionOperand = obj.conditionOperand;
        this.function = obj.funct;
    }
    //ret = Operator.execute(expr.value, values, value, isCondition);
    static execute(name, values, expression, executor) {
        console.log(' got it ' + name);
        console.log(values);
        const operator = Operator.operatorsMap.get(name);
        if (operator) {
            return operator.function(expression, values, executor);
        }
    }
    static parse(rootNode, parser, forCondition) {
        if (!Operator.operatorsMap) {
            Operator.operatorsMap = new Map();
            Operator.operators.forEach(operStruct => {
                const oper = new Operator(operStruct);
                Operator.operatorsMap.set(oper.name, oper);
            });
        }
        for (const entry of Operator.operatorsMap.entries()) {
            const oper = entry[1];
            oper.parseOperator(rootNode, parser, forCondition);
        }
    }
    parseOperator(rootNode, parser, forCondition) {
        let leftOperands = this.leftOperands;
        let rightOperands = this.rightOperands;
        let conditionOperand;
        if (forCondition && this.conditionOperand) {
            if (this.conditionOperand == 'L')
                conditionOperand = 'L';
            ;
            if (this.conditionOperand == 'R')
                conditionOperand = 'R';
        }
        let node = rootNode.children[0];
        let moves = [];
        const self = this;
        const list = [];
        rootNode.loopUp(function (node, level) {
            //console.log(" from looping up " + node.id);
            list.push(node);
        });
        // most operators rely on two operand however 
        list.forEach(node => {
            //            debug('tree','checking node ' + node.id + " "+node.value)
            //console.log("checking operator " + node.id + " " + node.value);
            if ((node.type == common_1.EXPRESSION_TYPE.Operator ||
                node.type == common_1.EXPRESSION_TYPE.Binary ||
                node.type == common_1.EXPRESSION_TYPE.Text) && node.value == self.name) {
                if (node.type == common_1.EXPRESSION_TYPE.Text)
                    node.type = common_1.EXPRESSION_TYPE.Operator;
                if (leftOperands == 1) {
                    if (conditionOperand == 'L') {
                        const newNode = new ExpressionNode_1.ExpressionNode(common_1.EXPRESSION_TYPE.Text, node, '$$VALUE', node.position);
                        //moves.push({ node: newNode, parent: node });
                    }
                    else {
                        const opr2 = node.previous();
                        if (!opr2)
                            return parser.error("Error Operator " + self.name + " requires a left parameter");
                        opr2.move(node);
                        console.log(' moving ' + opr2.id + ' to be a child of ' + node.id);
                        //moves.push({ node: opr2, parent: node });
                    }
                }
                if (rightOperands == 1) {
                    if (conditionOperand == 'R') {
                        new ExpressionNode_1.ExpressionNode(common_1.EXPRESSION_TYPE.Text, node, '$$VALUE', node.position);
                    }
                    else {
                        const opr1 = node.next();
                        if (!opr1)
                            return parser.error("Error Operator " + self.name + " requires a right parameter");
                        opr1.move(node);
                        console.log(' moving ' + opr1.id + ' to be a child of ' + node.id);
                        //moves.push({ node: opr1, parent: node });
                    }
                }
            }
        });
        moves.forEach(move => {
            move.node.move(move.parent);
            console.log(' moving ' + move.node.id + ' to be a child of ' + move.parent.id);
        });
        return true;
    }
}
exports.Operator = Operator;
Operator.operators = OPERATORS;

},{"./ExpressionNode":5,"./common":10}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesDelegate = void 0;
const Addins_1 = require("./Addins");
class CustomFuntions extends Addins_1.ExecutionContext {
    fun(params, value, isCondition) {
        return true;
    }
}
class RulesDelegate {
    constructor() {
    }
    init(executor, data) {
        this.context = new CustomFuntions(data);
        this.executor = executor;
    }
    /**
     * called if a variable request but not found in context object
     *
     * @param name
     */
    getVariable(name) {
        return 'requesting ' + name + ' but dont have any values';
    }
    customFunctions(funct, params, executor) {
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
exports.RulesDelegate = RulesDelegate;

},{"./Addins":2}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeBuilder = void 0;
const common_1 = require("./common");
const ExpressionNode_1 = require("./ExpressionNode");
const Operator_1 = require("./Operator");
/*
 *
 * adjust tree for simple conditions as follows:
 *
 * Simple Mode:
 * Rules:
 *  -   compare oprators (<>==) require only 1 parameter vs 2 in Script mode
 *  -
 *  -   functions first parameter is the value
 *
 *  single node ->                  add $$ ==
 *
 *  single node                     change to text to literal
 *
 *  compare operation    >=         add $$ in front
 *
 *
 *  Simple Condition                                        Script
 *  not 5                                                   $$ != 5
 *  >5                                                      $$ >5
 *  in (1,2,3)                                              in($$,1,2,3)
 *  between(a,b)                                            between($$,a,b)
 *  1+2                                                     1+2
 *
 *
 */
/* Todo:
 *
    expression
    result-expression
    handle result expressions:

    constant
        'high'
        500

    operations
        500 * 1.5

    variables
        salary * 1.5

*/
class TreeBuilder {
    constructor(tokens) {
        this.errors = [];
        this.tokens = tokens;
        this.pos = 0;
    }
    build(forCondition) {
        this.rootNode = this.newNode(null, this.tokens[0], common_1.EXPRESSION_TYPE.Root);
        this.rootNode.value = '';
        if (this.tokens.length == 1 && this.tokens[0].entry == '-') {
            this.rootNode.type = common_1.EXPRESSION_TYPE.AlwaysTrue;
            return this.rootNode;
        }
        this.tokens.forEach(token => {
            this.newNode(this.rootNode, token);
        });
        common_1.debug('tree', " before brackets ");
        this.rootNode.displayExpression();
        if (!this.buildBrackets(this.rootNode))
            return null;
        common_1.debug('tree', " after brackets ");
        this.rootNode.displayExpression();
        //  operator, ForCondition, ForExpression
        //          , left, right , left ,right
        Operator_1.Operator.parse(this.rootNode, this, forCondition);
        return this.rootNode;
    }
    newNode(parent, token, type = null) {
        return ExpressionNode_1.ExpressionNode.NewFromToken(token, parent, type);
    }
    /* check for brackets
        * before:
        *
        *   t1
        *   t2
        *   (
        *   t3
        *   t4
        *   (
        *   t5
        *   t6
        *   )
        *   )
        * after:
        *
        *   t1
        *   t2
        *   (
        *       t3
        *       t4
        *       (
        *           t5
        *           t6
        *
        *
        *   operand1
            * op
            * operand2
            * after: op
                * operand1
                * operand2
    */
    buildBrackets(rootNode) {
        let moves = [];
        let deletes = [];
        let prev = null;
        let nextNode = null;
        let node = rootNode.children[0];
        while (node) {
            common_1.debug('tree', " root checking node " + node.id);
            if (node.type == common_1.EXPRESSION_TYPE.Operator && node.value == '(') {
                this.buildBracketNodes(node);
                common_1.debug('tree', ' root got back from building bracket child' + node.id);
                node = rootNode.children[0];
            }
            else {
                node = node.next();
            }
            if (node)
                common_1.debug('tree', " root got next node" + node.id);
        }
        common_1.debug('tree', " before call fixes");
        rootNode.displayExpression();
        rootNode.loop(function (node, level) {
            common_1.debug('tree', ' loop ' + node.id);
            let prev = node.previous();
            if (prev && prev.type == common_1.EXPRESSION_TYPE.Text && node.type == common_1.EXPRESSION_TYPE.Bracket) {
                prev.type = common_1.EXPRESSION_TYPE.Call;
                common_1.debug('tree', ' moving ' + node.id + " call to " + prev.id);
                node.move(prev);
            }
        });
        rootNode.displayExpression();
        common_1.debug('tree', " after call fixes");
        return true;
    }
    error(msg) {
        console.log("**********");
        console.log(msg);
        common_1.debug('error', msg);
        this.errors.push(msg);
        console.log("**********");
        throw new Error(msg);
        return false;
    }
    buildBracketNodes(start) {
        let node = start;
        let bracketNode = null;
        let moves = [];
        let deletes = [];
        let prev = null;
        let nextNode = null;
        common_1.debug('tree', " build brackets for " + start.id);
        while (node) {
            common_1.debug('tree', " checking node " + node.id + " by " + start.id);
            if (bracketNode && node.value == '(') {
                moves.push({ node, parent: bracketNode });
                common_1.debug('tree', '  moving ' + node.id + " sub bracket  to " + bracketNode.id);
                common_1.debug('tree', '  calling sub ' + node.id);
                this.buildBracketNodes(node);
                common_1.debug('tree', ' got back from building bracket child' + node.id);
            }
            else if (node.value == '(') {
                bracketNode = node;
                node.type = common_1.EXPRESSION_TYPE.Bracket;
                /*                prev = node.previous();
                                if (prev && prev.type == EXPRESSION_TYPE.Text) {
                                    prev.type = EXPRESSION_TYPE.Call;
                //                    debug('tree',' moving ' + node.id + " call to " + prev.id);
                //                    moves.push({ node, parent: prev});
                                }
                */
            }
            else if (bracketNode && node.value == ')') {
                node.delete();
                break;
            }
            else if (bracketNode) {
                moves.push({ node, parent: bracketNode });
                common_1.debug('tree', '  moving ' + node.id + " element of ( " + bracketNode.id);
            }
            node = node.next();
        }
        moves.forEach(move => {
            move.node.move(move.parent);
        });
        start.displayExpression();
        return bracketNode;
    }
    /**
     * check for operators and move
     * before:   operand1
     *           op
     *           operand2
     * after:    op
     *              operand1
     *              operand2
     * */
    BuildOperators(operator, leftOperands, rightOperands) {
        let node = this.rootNode.children[0];
        let moves = [];
        const self = this;
        // most operators rely on two operand however 
        this.rootNode.loop(function (node, level) {
            //            debug('tree','checking node ' + node.id + " "+node.value)
            if (node.value == 'between' && node.type == 'Text') {
                console.log('between');
            }
            if ((node.type == common_1.EXPRESSION_TYPE.Operator ||
                node.type == common_1.EXPRESSION_TYPE.Binary ||
                node.type == common_1.EXPRESSION_TYPE.Text) && node.value == operator) {
                if (leftOperands == 1) {
                    const opr2 = node.previous();
                    if (!opr2)
                        return self.error("Error Operator " + operator + " requires a left parameter");
                    moves.push({ node: opr2, parent: node });
                }
                if (rightOperands == 1) {
                    const opr1 = node.next();
                    if (!opr1)
                        return self.error("Error Operator " + operator + " requires a right parameter");
                    moves.push({ node: opr1, parent: node });
                }
            }
        });
        moves.forEach(move => {
            move.node.move(move.parent);
        });
        return true;
    }
}
exports.TreeBuilder = TreeBuilder;

},{"./ExpressionNode":5,"./Operator":7,"./common":10}],10:[function(require,module,exports){
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
exports.logger = exports.Logger = exports.debug = exports.Options = exports.EXPRESSION_TYPE = exports.TOKEN_GROUP = void 0;
const RulesDelegate_1 = require("./RulesDelegate");
const FS = require('fs');
var TOKEN_GROUP;
(function (TOKEN_GROUP) {
    TOKEN_GROUP["alpha"] = "alpha";
    TOKEN_GROUP["number"] = "number";
    TOKEN_GROUP["symbol"] = "symbol";
    TOKEN_GROUP["space"] = "space";
})(TOKEN_GROUP = exports.TOKEN_GROUP || (exports.TOKEN_GROUP = {}));
//  Text    words without quote
//  string  quoted string
//  Number  numeric values
var EXPRESSION_TYPE;
(function (EXPRESSION_TYPE) {
    EXPRESSION_TYPE["Root"] = "Root";
    EXPRESSION_TYPE["Single"] = "Single";
    EXPRESSION_TYPE["Literal"] = "Literal";
    EXPRESSION_TYPE["Number"] = "Number";
    EXPRESSION_TYPE["Text"] = "Text";
    EXPRESSION_TYPE["Binary"] = "Binary";
    EXPRESSION_TYPE["Operator"] = "Operator";
    EXPRESSION_TYPE["Bracket"] = "Bracket";
    EXPRESSION_TYPE["Group"] = "Group";
    EXPRESSION_TYPE["Call"] = "Call";
    EXPRESSION_TYPE["Token"] = "";
    EXPRESSION_TYPE["AlwaysTrue"] = "True";
})(EXPRESSION_TYPE = exports.EXPRESSION_TYPE || (exports.EXPRESSION_TYPE = {}));
class Options {
}
exports.Options = Options;
Options.debugTokens = false;
Options.debugExpression = false;
Options.debugExecution = false;
Options.debugTree = false;
Options.delegate = new RulesDelegate_1.RulesDelegate();
function debug(type, title, obj = null) {
    exports.logger.log(title);
    if (type == 'execution' && !Options.debugExecution)
        return;
    if (type == 'tokens' && !Options.debugTokens)
        return;
    if (type == 'tree' && !Options.debugTree)
        return;
    console.log(title);
    if (obj) {
        console.log(obj);
        exports.logger.log(JSON.stringify(obj));
    }
}
exports.debug = debug;
class Logger {
    constructor({ toConsole = true, toFile = '', callback = null }) {
        this.debugMsgs = [];
        this.toConsole = true;
        this.toFile = null;
        this.callback = null;
        this.setOptions({ toConsole, toFile, callback });
    }
    setOptions({ toConsole, toFile, callback }) {
        this.toConsole = toConsole;
        this.toFile = toFile;
        this.callback = callback;
    }
    msg(message, type = 'log') {
        if (this.toConsole)
            console.log(message);
        if (this.callback) {
            this.callback(message, type);
        }
        this.debugMsgs.push({ message, type });
    }
    clear() {
        this.debugMsgs = [];
    }
    get() {
        return this.debugMsgs;
    }
    debug(message) {
        this.msg(message, 'debug');
    }
    warn(message) {
        this.msg(message, 'warn');
    }
    log(message) {
        this.msg(message);
    }
    error(err) {
        if (typeof err === 'object') {
            if (err.message) {
                this.msg(err.message, 'error');
                console.log('\nError Message: ' + err.message);
            }
            if (err.stack) {
                console.log('\nStacktrace:');
                console.log('====================');
                console.log(err.stack);
                this.log(err.stack);
            }
        }
        else {
            this.msg(err, 'error');
        }
        throw new Error(err);
    }
    save(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("writing to:" + filename + " " + this.debugMsgs.length);
            let id = FS.openSync(filename, 'w', 666);
            {
                FS.writeSync(id, 'Started at: ' + new Date().toISOString() + "\n", null, 'utf8');
                let l = 0;
                for (l = 0; l < this.debugMsgs.length; l++) {
                    let msg = this.debugMsgs[l];
                    if (msg.type == 'error') {
                        let line = msg.type + ": at line " + (l + 1) + " " + msg.message;
                        FS.writeSync(id, line + "\n", null, 'utf8');
                    }
                }
                for (l = 0; l < this.debugMsgs.length; l++) {
                    let msg = this.debugMsgs[l];
                    let line;
                    if (msg.type == 'eror')
                        line = msg.type + ":" + msg.message;
                    else
                        line = msg.message;
                    FS.writeSync(id, line + "\n", null, 'utf8');
                }
                FS.closeSync(id);
                this.clear();
            }
        });
    }
}
exports.Logger = Logger;
exports.logger = new Logger({ toConsole: false });

},{"./RulesDelegate":8,"fs":1}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL3JhbHBoL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkM6L1VzZXJzL3JhbHBoL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbGliL19lbXB0eS5qcyIsIkFkZGlucy5qcyIsIkV4ZWN1dG9yLmpzIiwiRXhwcmVzc2lvbkVuZ2luZS5qcyIsIkV4cHJlc3Npb25Ob2RlLmpzIiwiRXhwcmVzc2lvblBhcnNlci5qcyIsIk9wZXJhdG9yLmpzIiwiUnVsZXNEZWxlZ2F0ZS5qcyIsIlRyZWVCdWlsZGVyLmpzIiwiY29tbW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkV4ZWN1dGlvbkNvbnRleHQgPSB2b2lkIDA7XHJcbmNsYXNzIEV4ZWN1dGlvbkNvbnRleHQge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuRGF0ZSA9IG5ldyBFeHByZXNzaW9uRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuU3RyaW5nID0gbmV3IEV4cHJlc3Npb25TdHJpbmcoKTtcclxuICAgICAgICAvL3RoaXMuVGltZSA9IG5ldyBUaW1lKCk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzW2tleV0gPSBkYXRhW2tleV07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FeGVjdXRpb25Db250ZXh0ID0gRXhlY3V0aW9uQ29udGV4dDtcclxuY2xhc3MgRXhwcmVzc2lvbkRhdGUge1xyXG4gICAgbm93KCkgeyByZXR1cm4gbmV3IERhdGUoKTsgfVxyXG59XHJcbmNsYXNzIEV4cHJlc3Npb25UaW1lIHtcclxufVxyXG5jbGFzcyBFeHByZXNzaW9uU3RyaW5nIHtcclxuICAgIHNpemUodmFsdWVzKSB7IGNvbnNvbGUubG9nKCdTdHJpbmcuc2l6ZTonLCB2YWx1ZXNbMF0sIHZhbHVlc1swXS5sZW5ndGgpOyByZXR1cm4gdmFsdWVzWzBdLmxlbmd0aDsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBleGFtcGxlOlxyXG4gICAgICogIFN0cmluZy5hZGQoJ0hlbGxvLCcsJyBXb3JsZCEnKSAgIC0+IHJldHVybnMgJ0hlbGxvLCBXb3JsZCEnXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHN0cjFcclxuICAgICAqIEBwYXJhbSBzdHIyXHJcbiAgICAgKi9cclxuICAgIGFkZCh2YWx1ZXMpIHsgcmV0dXJuIHZhbHVlc1swXSArIHZhbHVlc1sxXTsgfVxyXG4gICAgc3Vic3RyKHZhbHVlcykgeyByZXR1cm4gdmFsdWVzWzBdLnN1YnN0cih2YWx1ZXNbMV0sIHZhbHVlc1syXSk7IH1cclxuICAgIHN0YXJ0c1dpdGgoc3RyLCBjaGVjaykgeyByZXR1cm4gc3RyLnN0YXJ0c1dpdGgoY2hlY2spOyB9XHJcbiAgICBlbmRzV2l0aChzdHIsIGNoZWNrKSB7IHJldHVybiBzdHIuZW5kc1dpdGgoY2hlY2spOyB9XHJcbiAgICBjb250YWlucyhzdHIxLCBjaGVjaykgeyByZXR1cm4gc3RyMS5pbmNsdWRlcyhjaGVjayk7IH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1BZGRpbnMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5FeGVjdXRvciA9IHZvaWQgMDtcclxuY29uc3QgY29tbW9uXzEgPSByZXF1aXJlKFwiLi9jb21tb25cIik7XHJcbmNvbnN0IE9wZXJhdG9yXzEgPSByZXF1aXJlKFwiLi9PcGVyYXRvclwiKTtcclxuY29uc3QgQWRkaW5zXzEgPSByZXF1aXJlKFwiLi9BZGRpbnNcIik7XHJcbmNsYXNzIEV4ZWN1dG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNvbnRleHQgPSBuZXcgQWRkaW5zXzEuRXhlY3V0aW9uQ29udGV4dChkYXRhKTtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlID0gY29tbW9uXzEuT3B0aW9ucy5kZWxlZ2F0ZTtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlLmluaXQodGhpcywgZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICogdmFsdWVzIGZyb20gYnJhY2tldCAoMSwyLDMpXHJcbiAqXHJcbiAqICovXHJcbiAgICBnZXRQYXJhbWV0ZXJWYWx1ZXMoZXhwcikge1xyXG4gICAgICAgIGNvbnN0IGJyYWNrZXQgPSBleHByLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgIGxldCBpO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBicmFja2V0LmNoaWxkcmVuLmxlbmd0aDsgaSArPSAyKSB7XHJcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKHRoaXMuZ2V0VmFsdWUoYnJhY2tldC5jaGlsZHJlbltpXSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiB2YWx1ZXMgY291bGQgYmUgY2hpbGRyZW4gbm9kZXMgb3IgZ3JvdXBcclxuICAgICAqICovXHJcbiAgICBnZXRWYWx1ZShjaGlsZCkge1xyXG4gICAgICAgIGxldCB2YWwgPSB0aGlzLmV2YWx1YXRlKGNoaWxkKTtcclxuICAgICAgICBsZXQgdjIgPSBwYXJzZUZsb2F0KHZhbCk7XHJcbiAgICAgICAgaWYgKCFpc05hTih2MikpXHJcbiAgICAgICAgICAgIHZhbCA9IHYyO1xyXG4gICAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9XHJcbiAgICBnZXRWYWx1ZXMoZXhwcikge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xyXG4gICAgICAgIGxldCB2YWw7XHJcbiAgICAgICAgaWYgKCFleHByKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgbnVsbCBleHByXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhleHByKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4cHIuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKHRoaXMuZ2V0VmFsdWUoY2hpbGQpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdmFsdWVzO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGVDb25kaXRpb24oZXhwciwgdmFsdWUsIGlzQ29uZGl0aW9uID0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuZm9yQ29uZGl0aW9uID0gaXNDb25kaXRpb247XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIGxldCByZXQgPSB0aGlzLmV2YWx1YXRlKGV4cHIpO1xyXG4gICAgICAgIGlmICh0aGlzLmZvckNvbmRpdGlvbikge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJldCA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldCA9IChyZXQgPT0gdGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuICAgIGV2YWx1YXRlKGV4cHIpIHtcclxuICAgICAgICBsZXQgcmV0O1xyXG4gICAgICAgIGNvbW1vbl8xLmRlYnVnKCdleGVjdXRpb24nLCAnZXhlY3V0aW5nOiAnICsgZXhwci50eXBlICsgJyAnICsgZXhwci52YWx1ZSk7XHJcbiAgICAgICAgc3dpdGNoIChleHByLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuQWx3YXlzVHJ1ZTpcclxuICAgICAgICAgICAgICAgIHJldCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuUm9vdDpcclxuICAgICAgICAgICAgICAgIGlmIChleHByLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXQgPSB0aGlzLmV2YWx1YXRlKGV4cHIuY2hpbGRyZW5bMF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLkdyb3VwOlxyXG4gICAgICAgICAgICBjYXNlIGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5CcmFja2V0OlxyXG4gICAgICAgICAgICAgICAgaWYgKGV4cHIuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldCA9IHRoaXMuZXZhbHVhdGUoZXhwci5jaGlsZHJlblswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuTGl0ZXJhbDpcclxuICAgICAgICAgICAgY2FzZSBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuTnVtYmVyOlxyXG4gICAgICAgICAgICAgICAgcmV0ID0gZXhwci52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5DYWxsOiAvLyBmdW5jdGlvbnMgXHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyYW1zO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZ1bmN0ID0gZXhwci52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbW1vbl8xLmRlYnVnKCdleGVjdXRpb24nLCAnZXhlY3V0aW5nIGZ1bmN0OicgKyBmdW5jdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZnVuY3QgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm8gRnVuY3Rpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhleHByKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHRoaXMuZ2V0UGFyYW1ldGVyVmFsdWVzKGV4cHIpO1xyXG4gICAgICAgICAgICAgICAgY29tbW9uXzEuZGVidWcoJ2V4ZWN1dGlvbicsICdwYXJhbWV0ZXJzJyk7XHJcbiAgICAgICAgICAgICAgICBjb21tb25fMS5kZWJ1ZygnZXhlY3V0aW9uJywgcGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIHJldCA9IHRoaXMuZGVsZWdhdGUuZXhlY3V0ZUZ1bmN0aW9uKGZ1bmN0LCBwYXJhbXMsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLlRleHQ6IC8vIHZhcmFpYmxlXHJcbiAgICAgICAgICAgICAgICBjb21tb25fMS5kZWJ1ZygnZXhlY3V0aW9uJywgJ3ZhcmlhYmxlIG5hbWU6JyArIGV4cHIudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIGlmIChleHByLnZhbHVlID09ICckJFZBTFVFJylcclxuICAgICAgICAgICAgICAgICAgICByZXQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldCA9IHRoaXMuZ2V0TmFtZWRWYXJpYWJsZSh0aGlzLmNvbnRleHQsIGV4cHIudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLkJpbmFyeTpcclxuICAgICAgICAgICAgY2FzZSBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuT3BlcmF0b3I6XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoZXhwcik7XHJcbiAgICAgICAgICAgICAgICBjb21tb25fMS5kZWJ1ZygnZXhlY3V0aW9uJywgXCIgT3BlcmF0b3JcIiArIGV4cHIudmFsdWUsIHZhbHVlcyk7XHJcbiAgICAgICAgICAgICAgICByZXQgPSBPcGVyYXRvcl8xLk9wZXJhdG9yLmV4ZWN1dGUoZXhwci52YWx1ZSwgdmFsdWVzLCBleHByLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIC8vcmV0ID0gdGhpcy5kZWxlZ2F0ZS5leGVjdXRlT3BlcmF0b3IoZXhwci52YWx1ZSwgdmFsdWVzLCB2YWx1ZSwgaXNDb25kaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbW1vbl8xLmRlYnVnKCdleGVjdXRpb24nLCBcIiBleGVjdXRpbmcgXCIgKyBleHByLnR5cGUgKyBleHByLnZhbHVlICsgXCIgcmVzdWx0OiBcIiArIHJldCk7XHJcbiAgICAgICAgZXhwci5yZXN1bHQgPSByZXQ7XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuICAgIGdldE5hbWVkVmFyaWFibGUob2JqZWN0LCBuYW1lKSB7XHJcbiAgICAgICAgbGV0IHBhdGggPSBuYW1lLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgbGV0IGk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIgY2hlY2tpbmcgdmFyIG5hbWUgXCIgKyBuYW1lICsgXCIgXCIgKyBwYXRoW2ldKTtcclxuICAgICAgICAgICAgbmFtZSA9IHBhdGhbaV07XHJcbiAgICAgICAgICAgIGlmIChvYmplY3RbbmFtZV0pXHJcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBvYmplY3RbbmFtZV07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FeGVjdXRvciA9IEV4ZWN1dG9yO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1FeGVjdXRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkV4cHJlc3Npb25FbmdpbmUgPSB2b2lkIDA7XHJcbmNvbnN0IEV4cHJlc3Npb25Ob2RlXzEgPSByZXF1aXJlKFwiLi9FeHByZXNzaW9uTm9kZVwiKTtcclxuY29uc3QgY29tbW9uXzEgPSByZXF1aXJlKFwiLi9jb21tb25cIik7XHJcbmNvbnN0IEV4cHJlc3Npb25QYXJzZXJfMSA9IHJlcXVpcmUoXCIuL0V4cHJlc3Npb25QYXJzZXJcIik7XHJcbi8vdmFyIFJFR0VYID0gLyhbYS16QS1aXFx1MDA4MC1cXHUwMEZGXFwuXSspfChbMC05XFwuXSspfCgsfCF8XFw/fFxcKXxcXCh8XFxcInxcXCd8PHw9fD58XFwrfC18XFwqfFxcLyl8KFxccykvZztcclxudmFyIFJFR0VYID0gLyhbYS16QS1aMC05XFx1MDA4MC1cXHUwMEZGXFwuXSspfChbMC05XFwuXSspfCgsfCF8XFw/fFxcKXxcXCh8XFxcInxcXCd8PHw9fD58XFwrfC18XFwqfFxcLyl8KFxccykvZztcclxuLy92YXIgT1BFUkFUT1JTID0gYDw+PSErLSovYDtcclxuY2xhc3MgRXhwcmVzc2lvbkVuZ2luZSB7XHJcbiAgICBldmFsdWF0ZUNvbmRpdGlvbihzdHJpbmcsIHZhbHVlKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHsgY2FzZUlkOiAxMDAxLCBjdXN0b21lcjogJ01yLiBIYW5uYScgfTtcclxuICAgICAgICBjb25zdCBleHByID0gRXhwcmVzc2lvbk5vZGVfMS5FeHByZXNzaW9uLmNvbXBpbGUoc3RyaW5nLCB0cnVlKTtcclxuICAgICAgICBpZiAoIWV4cHIpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGV4cHIuZXZhbHVhdGVDb25kaXRpb24oZGF0YSwgdmFsdWUpO1xyXG4gICAgICAgIGV4cHIuZGlzcGxheSgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQ6JyArIHJlc3VsdCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICBleHByLmRpc3BsYXkoKTtcclxuICAgICAgICBjb21tb25fMS5sb2dnZXIubG9nKCdyZXN1bHQ6JyArIHJlc3VsdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdDonICsgcmVzdWx0KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGUoc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbXNnID0gXCJFdmFsdWF0aW5nIEV4cHJlc2lvbidcIiArIHN0cmluZyArIFwiJ1wiO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbiAgICAgICAgY29tbW9uXzEubG9nZ2VyLmxvZygnJyk7XHJcbiAgICAgICAgY29tbW9uXzEubG9nZ2VyLmxvZygnJyk7XHJcbiAgICAgICAgY29tbW9uXzEubG9nZ2VyLmxvZyhtc2cpO1xyXG4gICAgICAgIGNvbW1vbl8xLmxvZ2dlci5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHsgY2FzZUlkOiAxMDAxLCBjdXN0b21lcjogJ01yLiBIYW5uYScgfTtcclxuICAgICAgICBjb25zdCBleHByID0gRXhwcmVzc2lvbk5vZGVfMS5FeHByZXNzaW9uLmNvbXBpbGUoc3RyaW5nLCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKCFleHByKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBleHByLmV2YWx1YXRlKGRhdGEpO1xyXG4gICAgICAgIGV4cHIuZGlzcGxheSgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQ6JyArIHJlc3VsdCk7XHJcbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0LCBleHByZXNzaW9uOiBleHByIH07XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgdG9rZW5pemUoc3RyaW5nKSB7XHJcbiAgICAgICAgLypcclxuICAgICAgICBBZHZhbmNlZCBSZWdleCBleHBsYW5hdGlvbjpcclxuICAgICAgICBbYS16QS1aXFx1MDA4MC1cXHUwMEZGXSBpbnN0ZWFkIG9mIFxcdyAgICAgU3VwcG9ydHMgc29tZSBVbmljb2RlIGxldHRlcnMgaW5zdGVhZCBvZiBBU0NJSSBsZXR0ZXJzIG9ubHkuIEZpbmQgVW5pY29kZSByYW5nZXMgaGVyZSBodHRwczovL2FwcHMudGltd2hpdGxvY2suaW5mby9qcy9yZWdleFxyXG4gICAgICAgIFxyXG4gICAgICAgIChcXC5cXC5cXC58XFwufCx8IXxcXD8pICAgICAgICAgICAgICAgICAgICAgIElkZW50aWZ5IGVsbGlwc2lzICguLi4pIGFuZCBwb2ludHMgYXMgc2VwYXJhdGUgZW50aXRpZXNcclxuICAgICAgICBcclxuICAgICAgICBZb3UgY2FuIGltcHJvdmUgaXQgYnkgYWRkaW5nIHJhbmdlcyBmb3Igc3BlY2lhbCBwdW5jdHVhdGlvbiBhbmQgc28gb25cclxuICAgICAgICAqL1xyXG4gICAgICAgIC8vdmFyIGFkdmFuY2VkUmVnZXggPSAvKFthLXpBLVpcXHUwMDgwLVxcdTAwRkZdKyl8KFswLTldKyl8KFxcLlxcLlxcLnxcXC58LHwhfFxcP3xcXCl8XFwofFxcXCJ8XFwnfDx8PnwtKXwoXFxzKS9nO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHN0cmluZyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xyXG4gICAgICAgIHZhciBzZXBzID0gW107XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBSRUdFWC5leGVjKHN0cmluZyk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtc2cgPSAnQCcgKyByZXN1bHQuaW5kZXggKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgIGxldCBnID0gMDtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkgJiYgZyA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9ICcgZyM6JyArIGcgKyBFeHByZXNzaW9uUGFyc2VyXzEuVG9rZW4uZ3JvdXBzW2cgLSAxXSArIFwiIFwiICsgZW50cnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuID0gbmV3IEV4cHJlc3Npb25QYXJzZXJfMS5Ub2tlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5pbmRleCA9IHJlc3VsdC5pbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZ3JvdXAgPSBFeHByZXNzaW9uUGFyc2VyXzEuVG9rZW4uZ3JvdXBzW2cgLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZW50cnkgPSBlbnRyeTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZXBzLnB1c2goeyBpbmRleDogcmVzdWx0LmluZGV4LCBncm91cDogZ3JvdXBzW2cgLSAxXSwgZW50cnkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcHMucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobXNnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZysrO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlIChyZXN1bHQgIT0gbnVsbCk7XHJcbiAgICAgICAgaWYgKGNvbW1vbl8xLk9wdGlvbnMuZGVidWdUb2tlbnMpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlcHMpO1xyXG4gICAgICAgIHJldHVybiBzZXBzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAxLCAgIGhhbmRsZXMgZnVuY3Rpb24gY2FsbHMgIGxvb2tpbmcgZm9yIGJyYWNrZXQgYWZ0ZXIgdGV4dFxyXG4gICAgICogMi4gICBzcGVjaWFsIHN5dGF4IGZvciBjb25kaXRpb246XHJcbiAgICAgKiAgICAgICAgICA+IDMwIGRheXNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZXhwclxyXG4gICAgICovXHJcbiAgICBwb3N0UGFyc2UoZXhwcikge1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgICogMS4gIGhhbmRsZXMgcXVvdGVzICAnL1wiXHJcbiAgICAgICogMi4gIGhhbmRsZXMgY29tbWFzIGluIG51bWJlcnNcclxuICAgICAgKiAzLiAgc3BhY2VzXHJcbiAgICAgICogNC4gIGRvdWJsZSBvcGVyYXRvcnMgICAgPj0gIDw9ICA9PVxyXG4gICAgICAqIDUuICAtbnVtYmVyIHNob3VsZCBiZSBvbmUgdG9rZW4gICAgIGxpa2UgLTIwXHJcbiAgICAgICogNi4gIG1hcmtcclxuICAgICAgKlxyXG4gICAgICAqIEBwYXJhbSBzZXBzXHJcbiAgICAgICovXHJcbiAgICBwcmVQYXJzZShzZXBzKSB7XHJcbiAgICAgICAgbGV0IGk7XHJcbiAgICAgICAgbGV0IHF1b3RlID0gbnVsbDtcclxuICAgICAgICBsZXQgdG9rZW5zID0gW107XHJcbiAgICAgICAgbGV0IHRleHRFbnRyeTtcclxuICAgICAgICBsZXQgcHJldkVudHJ5O1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzZXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzZXAgPSBzZXBzW2ldO1xyXG4gICAgICAgICAgICBpZiAocXVvdGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZXAuZW50cnkgPT0gcXVvdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0RW50cnkuZ3JvdXAgPSAnbGl0ZXJhbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godGV4dEVudHJ5KTtcclxuICAgICAgICAgICAgICAgICAgICBxdW90ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEVudHJ5ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0RW50cnkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRFbnRyeS5lbnRyeSArPSBzZXAuZW50cnk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RW50cnkgPSBzZXA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc2VwLmdyb3VwID09ICdzeW1ib2wnICYmIChzZXAuZW50cnkgPT0gJ1xcJycgfHwgc2VwLmVudHJ5ID09ICdcIicpKSB7XHJcbiAgICAgICAgICAgICAgICBxdW90ZSA9IHNlcC5lbnRyeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChzZXAuZ3JvdXAgPT0gJ3NwYWNlJykge1xyXG4gICAgICAgICAgICAgICAgOyAvLyBpZ25vcmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwcmV2RW50cnkgJiYgc2VwLmdyb3VwID09ICdzeW1ib2wnICYmIChzZXAuZW50cnkgPT0gJywnKSAmJiBwcmV2RW50cnkuZ3JvdXAgPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgaWdub3JlICwgYW5kIG1lcmdlIG5leHQgbnVtYmVyIHRvIHByZXZpb3VzXHJcbiAgICAgICAgICAgICAgICBzZXAgPSBzZXBzWysraV07XHJcbiAgICAgICAgICAgICAgICBwcmV2RW50cnkuZW50cnkgKz0gc2VwLmVudHJ5O1xyXG4gICAgICAgICAgICAgICAgc2VwLmVudHJ5ID0gcHJldkVudHJ5LmVudHJ5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHByZXZFbnRyeSAmJiBzZXAuZ3JvdXAgPT0gJ3N5bWJvbCcgJiYgKHNlcC5lbnRyeSA9PSAnPScpICYmXHJcbiAgICAgICAgICAgICAgICBwcmV2RW50cnkuZ3JvdXAgPT0gJ3N5bWJvbCcgJiZcclxuICAgICAgICAgICAgICAgIChwcmV2RW50cnkuZW50cnkgPT0gJzwnIHx8IHByZXZFbnRyeS5lbnRyeSA9PSAnPicgfHwgcHJldkVudHJ5LmVudHJ5ID09ICc9JykpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgaWdub3JlICwgYW5kIG1lcmdlIG5leHQgbnVtYmVyIHRvIHByZXZpb3VzXHJcbiAgICAgICAgICAgICAgICBwcmV2RW50cnkuZW50cnkgKz0gc2VwLmVudHJ5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vICA1LiAgLW51bWJlciBzaG91bGQgYmUgb25lIHRva2VuICAgICBsaWtlIC0yMFxyXG4gICAgICAgICAgICBlbHNlIGlmIChwcmV2RW50cnkgJiYgc2VwLmdyb3VwID09ICdudW1iZXInICYmIHByZXZFbnRyeS5lbnRyeSA9PSAnLScpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgaWdub3JlICwgYW5kIG1lcmdlIG5leHQgbnVtYmVyIHRvIHByZXZpb3VzXHJcbiAgICAgICAgICAgICAgICBwcmV2RW50cnkuZW50cnkgKz0gc2VwLmVudHJ5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goc2VwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2RW50cnkgPSBzZXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5ncm91cCA9PSAnc3ltYm9sJyAmJiB0b2tlbi5lbnRyeSA9PSAneycpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJyYWNrZXRMZXZlbCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGogPSBpICsgMTsgaiA8IHRva2Vucy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbnNbal0uZW50cnkgPT0gJygnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmFja2V0TGV2ZWwrKztcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW5zW2pdLmVudHJ5ID09ICcpJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhY2tldExldmVsLS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJyYWNrZXRMZXZlbCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmJyYWNrZXRFbmRUb2tlbiA9IGo7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRva2Vucyk7XHJcbiAgICAgICAgaWYgKGNvbW1vbl8xLk9wdGlvbnMuZGVidWdUb2tlbnMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJyBhZnRlciBjbGVhbmluZy4uJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRva2Vucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b2tlbnM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FeHByZXNzaW9uRW5naW5lID0gRXhwcmVzc2lvbkVuZ2luZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RXhwcmVzc2lvbkVuZ2luZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkV4cHJlc3Npb25Ob2RlID0gZXhwb3J0cy5UcmVlTm9kZSA9IGV4cG9ydHMuRXhwcmVzc2lvbiA9IHZvaWQgMDtcclxuY29uc3QgY29tbW9uXzEgPSByZXF1aXJlKFwiLi9jb21tb25cIik7XHJcbmNvbnN0IEV4cHJlc3Npb25QYXJzZXJfMSA9IHJlcXVpcmUoXCIuL0V4cHJlc3Npb25QYXJzZXJcIik7XHJcbmNvbnN0IEV4ZWN1dG9yXzEgPSByZXF1aXJlKFwiLi9FeGVjdXRvclwiKTtcclxuY2xhc3MgRXhwcmVzc2lvbiB7XHJcbiAgICBzdGF0aWMgY29tcGlsZShzY3JpcHQsIGZvckNvbmRpdGlvbikge1xyXG4gICAgICAgIGNvbnN0IGluc3QgPSBuZXcgRXhwcmVzc2lvbigpO1xyXG4gICAgICAgIGluc3Quc2NyaXB0ID0gc2NyaXB0O1xyXG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBFeHByZXNzaW9uUGFyc2VyXzEuUGFyc2VyKCk7XHJcbiAgICAgICAgaW5zdC5yb290Tm9kZSA9IHBhcnNlci5jb21waWxlKHNjcmlwdCwgZm9yQ29uZGl0aW9uKTtcclxuICAgICAgICByZXR1cm4gaW5zdDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBsb2FkKGpzb24pIHtcclxuICAgICAgICBjb25zdCBpbnN0ID0gbmV3IEV4cHJlc3Npb24oKTtcclxuICAgICAgICByZXR1cm4gaW5zdDtcclxuICAgIH1cclxuICAgIGdldFN0YXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZGlzcGxheSgpIHtcclxuICAgICAgICB0aGlzLnJvb3ROb2RlLmRpc3BsYXlFeHByZXNzaW9uKCk7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZShkYXRhKSB7XHJcbiAgICAgICAgY29uc3QgZXhlY3V0b3IgPSBuZXcgRXhlY3V0b3JfMS5FeGVjdXRvcihkYXRhKTtcclxuICAgICAgICByZXR1cm4gZXhlY3V0b3IuZXZhbHVhdGVDb25kaXRpb24odGhpcy5yb290Tm9kZSwgbnVsbCwgZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGVDb25kaXRpb24oZGF0YSwgdmFsdWUpIHtcclxuICAgICAgICBjb25zdCBleGVjdXRvciA9IG5ldyBFeGVjdXRvcl8xLkV4ZWN1dG9yKGRhdGEpO1xyXG4gICAgICAgIHJldHVybiBleGVjdXRvci5ldmFsdWF0ZUNvbmRpdGlvbih0aGlzLnJvb3ROb2RlLCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FeHByZXNzaW9uID0gRXhwcmVzc2lvbjtcclxuY2xhc3MgVHJlZU5vZGUge1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50KSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgaWYgKHBhcmVudClcclxuICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLnB1c2godGhpcyk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xyXG4gICAgfVxyXG4gICAgYWRkQ2hpbGQobm9kZSkge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChub2RlKTtcclxuICAgIH1cclxuICAgIHJvb3QoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQucm9vdCgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBmaXJzdCh3aXRoaW5QYXJlbnQgPSBmYWxzZSkge1xyXG4gICAgfVxyXG4gICAgbmV4dCh3aXRoaW5QYXJlbnQgPSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMucGFyZW50LmNoaWxkcmVuLmluZGV4T2YodGhpcyk7XHJcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnBhcmVudC5jaGlsZHJlbi5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuY2hpbGRyZW5baW5kZXggKyAxXTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcHJldmlvdXMod2l0aGluUGFyZW50ID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHRoaXMpO1xyXG4gICAgICAgIGlmIChpbmRleCA+PSAxICYmIGluZGV4IDw9IHRoaXMucGFyZW50LmNoaWxkcmVuLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5jaGlsZHJlbltpbmRleCAtIDFdO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBsb29wKGZ1bmN0LCBsZXZlbCA9IDApIHtcclxuICAgICAgICBmdW5jdCh0aGlzLCBsZXZlbCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLnBhcmVudCAhPT0gdGhpcylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgcGFyZW50IGlzIHdyb25nXCIgKyBjaGlsZC5wYXJlbnQpO1xyXG4gICAgICAgICAgICBjaGlsZC5sb29wKGZ1bmN0LCBsZXZlbCArIDEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgbG9vcFVwKGZ1bmN0LCBsZXZlbCA9IDApIHtcclxuICAgICAgICBsZXQgaTtcclxuICAgICAgICBmb3IgKGkgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IHRoaXMuY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5wYXJlbnQgIT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIHBhcmVudCBpcyB3cm9uZ1wiICsgY2hpbGQucGFyZW50KTtcclxuICAgICAgICAgICAgY2hpbGQubG9vcFVwKGZ1bmN0LCBsZXZlbCArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdCh0aGlzLCBsZXZlbCk7XHJcbiAgICB9XHJcbiAgICBkZWxldGUoKSB7XHJcbiAgICAgICAgcmVtb3ZlRnJvbUFycmF5KHRoaXMucGFyZW50LmNoaWxkcmVuLCB0aGlzKTtcclxuICAgIH1cclxuICAgIG1vdmUobmV3UGFyZW50KSB7XHJcbiAgICAgICAgY29uc3Qgb2xkUGFyZW50ID0gdGhpcy5wYXJlbnQ7XHJcbiAgICAgICAgaWYgKG9sZFBhcmVudClcclxuICAgICAgICAgICAgcmVtb3ZlRnJvbUFycmF5KHRoaXMucGFyZW50LmNoaWxkcmVuLCB0aGlzKTtcclxuICAgICAgICBuZXdQYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IG5ld1BhcmVudDtcclxuICAgICAgICByZXR1cm4gb2xkUGFyZW50O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuVHJlZU5vZGUgPSBUcmVlTm9kZTtcclxuZnVuY3Rpb24gcmVtb3ZlRnJvbUFycmF5KGFycmF5LCBpdGVtKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IGFycmF5LmluZGV4T2YoaXRlbSwgMCk7XHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbn1cclxuY2xhc3MgRXhwcmVzc2lvbk5vZGUgZXh0ZW5kcyBUcmVlTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlLCBwYXJlbnQsIHZhbHVlLCBwb3NpdGlvbikge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudCk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuaWQgPSBFeHByZXNzaW9uTm9kZS5pZCsrO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIE5ld0Zyb21Ub2tlbih0b2tlbiwgcGFyZW50LCB0eXBlID0gbnVsbCkge1xyXG4gICAgICAgIGlmICghdG9rZW4pXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGlmICghdHlwZSlcclxuICAgICAgICAgICAgdHlwZSA9IEV4cHJlc3Npb25Ob2RlLmNhbGNUeXBlRnJvbVRva2VuKHRva2VuKTtcclxuICAgICAgICByZXR1cm4gbmV3IEV4cHJlc3Npb25Ob2RlKHR5cGUsIHBhcmVudCwgdG9rZW4uZW50cnksIHRva2VuLmluZGV4KTtcclxuICAgIH1cclxuICAgIGdldFN0YXRlKCkge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gW107XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHsgY2hpbGRyZW4ucHVzaChjaGlsZC5nZXRTdGF0ZSgpKTsgfSk7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy50eXBlLCB2YWx1ZTogdGhpcy52YWx1ZSwgY2hpbGRyZW4gfTtcclxuICAgIH1cclxuICAgIGRpc3BsYXlFeHByZXNzaW9uKGxldmVsID0gMCkge1xyXG4gICAgICAgIGlmICghY29tbW9uXzEuT3B0aW9ucy5kZWJ1Z0V4cHJlc3Npb24pXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLmxvb3AoZnVuY3Rpb24gKGV4cHIsIGxldmVsKSB7XHJcbiAgICAgICAgICAgIGxldCByZXMgPSAoZXhwci5yZXN1bHQgPyBgcmVzdWx0PTwke2V4cHIucmVzdWx0fT4gICBgIDogJycpO1xyXG4gICAgICAgICAgICBjb25zdCBtc2cgPSBsZXZlbCArICctJy5yZXBlYXQobGV2ZWwgKyAxKSArIFwiPlwiICsgZXhwci50eXBlICsgXCIgXCIgKyBleHByLnZhbHVlICsgXCIgICBcIiArIHJlcyArICdpZDonICsgZXhwci5pZDtcclxuICAgICAgICAgICAgY29tbW9uXzEuZGVidWcoJ2V4cHJlc3Npb24nLCBtc2cpO1xyXG4gICAgICAgIH0sIGxldmVsKTtcclxuICAgICAgICAvKlxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5wYXJlbnQgIT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIHBhcmVudCBpcyB3cm9uZ1wiK2NoaWxkLnBhcmVudClcclxuICAgICAgICAgICAgY2hpbGQuZGlzcGxheUV4cHJlc3Npb24oIGxldmVsICsgMSk7XHJcbiAgICAgICAgfSk7ICovXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgY2FsY1R5cGVGcm9tVG9rZW4odG9rZW4pIHtcclxuICAgICAgICBsZXQgdHlwZTtcclxuICAgICAgICBpZiAodG9rZW4uZ3JvdXAgPT0gJ251bWJlcicpXHJcbiAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuTnVtYmVyO1xyXG4gICAgICAgIGVsc2UgaWYgKHRva2VuLmdyb3VwID09ICdsaXRlcmFsJyB8fCAoIWlzTmFOKHRva2VuLmVudHJ5KSkpXHJcbiAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuTGl0ZXJhbDtcclxuICAgICAgICBlbHNlIGlmICh0b2tlbi5ncm91cCA9PSAnYWxwaGEnICYmICh0b2tlbi5lbnRyeSA9PSAnYW5kJyB8fCB0b2tlbi5lbnRyeSA9PSAnb3InIHx8IHRva2VuLmVudHJ5ID09ICdub3QnKSlcclxuICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5CaW5hcnk7XHJcbiAgICAgICAgZWxzZSBpZiAodG9rZW4uZ3JvdXAgPT0gJ2FscGhhJylcclxuICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5UZXh0O1xyXG4gICAgICAgIGVsc2UgaWYgKHRva2VuLmdyb3VwID09ICdzeW1ib2wnKVxyXG4gICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLk9wZXJhdG9yO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRXhwcmVzc2lvbk5vZGUgPSBFeHByZXNzaW9uTm9kZTtcclxuRXhwcmVzc2lvbk5vZGUuaWQgPSAwO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1FeHByZXNzaW9uTm9kZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlBhcnNlciA9IGV4cG9ydHMuVG9rZW4gPSB2b2lkIDA7XHJcbmNvbnN0IEV4cHJlc3Npb25Ob2RlXzEgPSByZXF1aXJlKFwiLi9FeHByZXNzaW9uTm9kZVwiKTtcclxuY29uc3QgVHJlZUJ1aWxkZXJfMSA9IHJlcXVpcmUoXCIuL1RyZWVCdWlsZGVyXCIpO1xyXG5jb25zdCBjb21tb25fMSA9IHJlcXVpcmUoXCIuL2NvbW1vblwiKTtcclxuLy92YXIgUkVHRVggPSAvKFthLXpBLVpcXHUwMDgwLVxcdTAwRkZcXC5dKyl8KFswLTlcXC5dKyl8KCx8IXxcXD98XFwpfFxcKHxcXFwifFxcJ3w8fD18PnxcXCt8LXxcXCp8XFwvKXwoXFxzKS9nO1xyXG4vLyB2YXIgUkVHRVggPSAvKFthLXpBLVowLTlcXHUwMDgwLVxcdTAwRkZcXC5dKyl8KFswLTlcXC5dKyl8KCx8IXxcXD98XFwpfFxcKHxcXFwifFxcJ3w8fD18PnxcXCt8LXxcXCp8XFwvKXwoXFxzKS9nO1xyXG52YXIgZ3JvdXAxID0gYFswLTlcXC5dK2A7XHJcbnZhciBncm91cDIgPSBgW2EtekEtWjAtOVxcdTAwODAtXFx1MDBGRlxcLlxcX10rYDtcclxudmFyIGdyb3VwMyA9IGBbLHwhfFxcP3xcXCl8XFwofFxcXCJ8XFwnfDx8PXw+fFxcK3xcXC18XFwqfFxcL11gO1xyXG52YXIgZ3JvdXA0ID0gXCJcXFxcc1wiO1xyXG52YXIgZ3JvdXA1ID0gYFteQS1aYS16XWA7XHJcbmxldCBSRUdFWCA9ICcnO1xyXG5bZ3JvdXAxLCBncm91cDIsIGdyb3VwNCwgZ3JvdXA1XS5mb3JFYWNoKGdyID0+IHtcclxuICAgIGlmIChSRUdFWCA9PSAnJylcclxuICAgICAgICBSRUdFWCA9ICcoJyArIGdyICsgJyknO1xyXG4gICAgZWxzZVxyXG4gICAgICAgIFJFR0VYICs9ICd8KCcgKyBnciArICcpJztcclxufSk7XHJcbnZhciBCSU5BUllfT1BFUkFUT1JTID0gWydhbmQnLCAnb3InLCAnbm90JywgJyEnXTtcclxudmFyIE9QRVJBVE9SUyA9IFsnKicsICcrJywgJy0nLCAsIGAvYCxcclxuICAgIGA8YCwgYD5gLCBgPj1gLCBgPD1gXTtcclxuY2xhc3MgVG9rZW4ge1xyXG4gICAgaXNPcGVyYXRvcigpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuZ3JvdXAgPT0gJ3N5bWJvbCcgJiYgT1BFUkFUT1JTLmluY2x1ZGVzKHRoaXMuZW50cnkpKTtcclxuICAgIH1cclxuICAgIGlzTGl0ZXJhbCgpIHtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlRva2VuID0gVG9rZW47XHJcblRva2VuLmdyb3VwcyA9IFsnbnVtYmVyJywgJ2FscGhhJywgJ3NwYWNlJywgJ3N5bWJvbCddO1xyXG5jbGFzcyBQYXJzZXIge1xyXG4gICAgY29tcGlsZShzdHJpbmcsIGZvckNvbmR0aW9uKSB7XHJcbiAgICAgICAgRXhwcmVzc2lvbk5vZGVfMS5FeHByZXNzaW9uTm9kZS5pZCA9IDA7XHJcbiAgICAgICAgbGV0IHRva2VucyA9IFBhcnNlci50b2tlbml6ZShzdHJpbmcpO1xyXG4gICAgICAgIHRva2VucyA9IHRoaXMucHJlUGFyc2UodG9rZW5zKTtcclxuICAgICAgICBjb25zdCBidWlsZGVyID0gbmV3IFRyZWVCdWlsZGVyXzEuVHJlZUJ1aWxkZXIodG9rZW5zKTtcclxuICAgICAgICBjb25zdCBleHByID0gYnVpbGRlci5idWlsZChmb3JDb25kdGlvbik7XHJcbiAgICAgICAgaWYgKCFleHByKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB0aGlzLnBvc3RQYXJzZShleHByKTtcclxuICAgICAgICBleHByLmRpc3BsYXlFeHByZXNzaW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIGV4cHI7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgdG9rZW5pemUoc3RyaW5nKSB7XHJcbiAgICAgICAgLypcclxuICAgICAgICBBZHZhbmNlZCBSZWdleCBleHBsYW5hdGlvbjpcclxuICAgICAgICBbYS16QS1aXFx1MDA4MC1cXHUwMEZGXSBpbnN0ZWFkIG9mIFxcdyAgICAgU3VwcG9ydHMgc29tZSBVbmljb2RlIGxldHRlcnMgaW5zdGVhZCBvZiBBU0NJSSBsZXR0ZXJzIG9ubHkuIEZpbmQgVW5pY29kZSByYW5nZXMgaGVyZSBodHRwczovL2FwcHMudGltd2hpdGxvY2suaW5mby9qcy9yZWdleFxyXG4gICAgICAgIFxyXG4gICAgICAgIChcXC5cXC5cXC58XFwufCx8IXxcXD8pICAgICAgICAgICAgICAgICAgICAgIElkZW50aWZ5IGVsbGlwc2lzICguLi4pIGFuZCBwb2ludHMgYXMgc2VwYXJhdGUgZW50aXRpZXNcclxuICAgICAgICBcclxuICAgICAgICBZb3UgY2FuIGltcHJvdmUgaXQgYnkgYWRkaW5nIHJhbmdlcyBmb3Igc3BlY2lhbCBwdW5jdHVhdGlvbiBhbmQgc28gb25cclxuICAgICAgICAqL1xyXG4gICAgICAgIC8vdmFyIGFkdmFuY2VkUmVnZXggPSAvKFthLXpBLVpcXHUwMDgwLVxcdTAwRkZdKyl8KFswLTldKyl8KFxcLlxcLlxcLnxcXC58LHwhfFxcP3xcXCl8XFwofFxcXCJ8XFwnfDx8PnwtKXwoXFxzKS9nO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHN0cmluZyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xyXG4gICAgICAgIHZhciBzZXBzID0gW107XHJcbiAgICAgICAgbGV0IHJlID0gbmV3IFJlZ0V4cChSRUdFWCwgXCJnaVwiKTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlLmV4ZWMoc3RyaW5nKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1zZyA9ICdAJyArIHJlc3VsdC5pbmRleCArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IGcgPSAwO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeSAmJiBnID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJyBnIzonICsgZyArIFRva2VuLmdyb3Vwc1tnIC0gMV0gKyBcIiBcIiArIGVudHJ5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbiA9IG5ldyBUb2tlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5pbmRleCA9IHJlc3VsdC5pbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZ3JvdXAgPSBUb2tlbi5ncm91cHNbZyAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbnRyeSA9IGVudHJ5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NlcHMucHVzaCh7IGluZGV4OiByZXN1bHQuaW5kZXgsIGdyb3VwOiBncm91cHNbZyAtIDFdLCBlbnRyeSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vwcy5wdXNoKHRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhtc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBnKys7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gd2hpbGUgKHJlc3VsdCAhPSBudWxsKTtcclxuICAgICAgICBpZiAoY29tbW9uXzEuT3B0aW9ucy5kZWJ1Z1Rva2VucylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coc2Vwcyk7XHJcbiAgICAgICAgcmV0dXJuIHNlcHM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIDEsICAgaGFuZGxlcyBmdW5jdGlvbiBjYWxscyAgbG9va2luZyBmb3IgYnJhY2tldCBhZnRlciB0ZXh0XHJcbiAgICAgKiAyLiAgIHNwZWNpYWwgc3l0YXggZm9yIGNvbmRpdGlvbjpcclxuICAgICAqICAgICAgICAgID4gMzAgZGF5c1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBleHByXHJcbiAgICAgKi9cclxuICAgIHBvc3RQYXJzZShleHByKSB7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAgKiAxLiAgaGFuZGxlcyBxdW90ZXMgICcvXCJcclxuICAgICAgKiAyLiAgaGFuZGxlcyBjb21tYXMgaW4gbnVtYmVyc1xyXG4gICAgICAqIDMuICBzcGFjZXNcclxuICAgICAgKiA0LiAgZG91YmxlIG9wZXJhdG9ycyAgICA+PSAgPD0gID09XHJcbiAgICAgICogNS4gIC1udW1iZXIgc2hvdWxkIGJlIG9uZSB0b2tlbiAgICAgbGlrZSAtMjAgTk5PT1xyXG4gICAgICAqIDYuICBtYXJrXHJcbiAgICAgICpcclxuICAgICAgKiBAcGFyYW0gc2Vwc1xyXG4gICAgICAqL1xyXG4gICAgcHJlUGFyc2Uoc2Vwcykge1xyXG4gICAgICAgIGxldCBpO1xyXG4gICAgICAgIGxldCBxdW90ZSA9IG51bGw7XHJcbiAgICAgICAgbGV0IHRva2VucyA9IFtdO1xyXG4gICAgICAgIGxldCB0ZXh0RW50cnk7XHJcbiAgICAgICAgbGV0IHByZXZFbnRyeTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2Vwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgc2VwID0gc2Vwc1tpXTtcclxuICAgICAgICAgICAgaWYgKHF1b3RlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VwLmVudHJ5ID09IHF1b3RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEVudHJ5Lmdyb3VwID0gJ2xpdGVyYWwnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRleHRFbnRyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVvdGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRFbnRyeSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dEVudHJ5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RW50cnkuZW50cnkgKz0gc2VwLmVudHJ5O1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEVudHJ5ID0gc2VwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlcC5ncm91cCA9PSAnc3ltYm9sJyAmJiAoc2VwLmVudHJ5ID09ICdcXCcnIHx8IHNlcC5lbnRyeSA9PSAnXCInKSkge1xyXG4gICAgICAgICAgICAgICAgcXVvdGUgPSBzZXAuZW50cnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc2VwLmdyb3VwID09ICdzcGFjZScpIHtcclxuICAgICAgICAgICAgICAgIDsgLy8gaWdub3JlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocHJldkVudHJ5ICYmIHNlcC5ncm91cCA9PSAnc3ltYm9sJyAmJiAoc2VwLmVudHJ5ID09ICcsJykgJiYgcHJldkVudHJ5Lmdyb3VwID09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgIGlnbm9yZSAsIGFuZCBtZXJnZSBuZXh0IG51bWJlciB0byBwcmV2aW91c1xyXG4gICAgICAgICAgICAgICAgc2VwID0gc2Vwc1srK2ldO1xyXG4gICAgICAgICAgICAgICAgcHJldkVudHJ5LmVudHJ5ICs9IHNlcC5lbnRyeTtcclxuICAgICAgICAgICAgICAgIHNlcC5lbnRyeSA9IHByZXZFbnRyeS5lbnRyeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwcmV2RW50cnkgJiYgc2VwLmdyb3VwID09ICdzeW1ib2wnICYmIChzZXAuZW50cnkgPT0gJz0nKSAmJlxyXG4gICAgICAgICAgICAgICAgcHJldkVudHJ5Lmdyb3VwID09ICdzeW1ib2wnICYmXHJcbiAgICAgICAgICAgICAgICAocHJldkVudHJ5LmVudHJ5ID09ICc8JyB8fCBwcmV2RW50cnkuZW50cnkgPT0gJz4nIHx8IHByZXZFbnRyeS5lbnRyeSA9PSAnPScpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgIGlnbm9yZSAsIGFuZCBtZXJnZSBuZXh0IG51bWJlciB0byBwcmV2aW91c1xyXG4gICAgICAgICAgICAgICAgcHJldkVudHJ5LmVudHJ5ICs9IHNlcC5lbnRyeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyAgNS4gIC1udW1iZXIgc2hvdWxkIGJlIG9uZSB0b2tlbiAgICAgbGlrZSAtMjBcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgZWxzZSBpZiAocHJldkVudHJ5ICYmIHNlcC5ncm91cCA9PSAnbnVtYmVyJyAmJiBwcmV2RW50cnkuZW50cnkgPT0gJy0nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgIGlnbm9yZSAsIGFuZCBtZXJnZSBuZXh0IG51bWJlciB0byBwcmV2aW91c1xyXG4gICAgICAgICAgICAgICAgcHJldkVudHJ5LmVudHJ5ICs9IHNlcC5lbnRyeTtcclxuICAgICAgICAgICAgfSAqL1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHNlcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldkVudHJ5ID0gc2VwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4uZ3JvdXAgPT0gJ3N5bWJvbCcgJiYgdG9rZW4uZW50cnkgPT0gJ3snKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgajtcclxuICAgICAgICAgICAgICAgIGxldCBicmFja2V0TGV2ZWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChqID0gaSArIDE7IGogPCB0b2tlbnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW5zW2pdLmVudHJ5ID09ICcoJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhY2tldExldmVsKys7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2Vuc1tqXS5lbnRyeSA9PSAnKScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYWNrZXRMZXZlbC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChicmFja2V0TGV2ZWwgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5icmFja2V0RW5kVG9rZW4gPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0b2tlbnMpO1xyXG4gICAgICAgIGlmIChjb21tb25fMS5PcHRpb25zLmRlYnVnVG9rZW5zKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcgYWZ0ZXIgY2xlYW5pbmcuLicpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0b2tlbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9rZW5zO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGFyc2VyID0gUGFyc2VyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1FeHByZXNzaW9uUGFyc2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuT3BlcmF0b3IgPSB2b2lkIDA7XHJcbmNvbnN0IGNvbW1vbl8xID0gcmVxdWlyZShcIi4vY29tbW9uXCIpO1xyXG5jb25zdCBFeHByZXNzaW9uTm9kZV8xID0gcmVxdWlyZShcIi4vRXhwcmVzc2lvbk5vZGVcIik7XHJcbmNvbnN0IE9QRVJBVE9SUyA9IFt7XHJcbiAgICAgICAgbmFtZTogJ14nLCBwcmVjZWRlbmNlVmFsdWU6IDEwLCBsZWZ0T3BlcmFuZHM6IDEsIHJpZ2h0T3BlcmFuZHM6IDEsXHJcbiAgICAgICAgZnVuY3Q6IGZ1bmN0aW9uIChleHByZXNzaW9uLCB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucG93KHZhbHVlc1swXSwgdmFsdWVzWzFdKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICcqJywgcHJlY2VkZW5jZVZhbHVlOiAyMCwgbGVmdE9wZXJhbmRzOiAxLCByaWdodE9wZXJhbmRzOiAxLFxyXG4gICAgICAgIGZ1bmN0OiBmdW5jdGlvbiAob3BlcmF0b3IsIHZhbHVlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzWzBdICogdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJy8nLCBwcmVjZWRlbmNlVmFsdWU6IDMwLCBsZWZ0T3BlcmFuZHM6IDEsIHJpZ2h0T3BlcmFuZHM6IDEsXHJcbiAgICAgICAgZnVuY3Q6IGZ1bmN0aW9uIChleHByZXNzaW9uLCB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1swXSAvIHZhbHVlc1sxXTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICctJywgcHJlY2VkZW5jZVZhbHVlOiA0MCwgbGVmdE9wZXJhbmRzOiAxLCByaWdodE9wZXJhbmRzOiAxLFxyXG4gICAgICAgIGZ1bmN0OiBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXNbMF0gLSB2YWx1ZXNbMV07XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnKycsIHByZWNlZGVuY2VWYWx1ZTogNTAsIGxlZnRPcGVyYW5kczogMSwgcmlnaHRPcGVyYW5kczogMSxcclxuICAgICAgICBmdW5jdDogZnVuY3Rpb24gKGV4cHJlc3Npb24sIHZhbHVlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzWzBdICsgdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJzwnLCBwcmVjZWRlbmNlVmFsdWU6IDYwLCBsZWZ0T3BlcmFuZHM6IDEsIHJpZ2h0T3BlcmFuZHM6IDEsIGNvbmRpdGlvbk9wZXJhbmQ6ICdMJyxcclxuICAgICAgICBmdW5jdDogZnVuY3Rpb24gKGV4cHJlc3Npb24sIHZhbHVlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzWzBdIDwgdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJz4nLCBwcmVjZWRlbmNlVmFsdWU6IDcwLCBsZWZ0T3BlcmFuZHM6IDEsIHJpZ2h0T3BlcmFuZHM6IDEsIGNvbmRpdGlvbk9wZXJhbmQ6ICdMJyxcclxuICAgICAgICBmdW5jdDogZnVuY3Rpb24gKGV4cHJlc3Npb24sIHZhbHVlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gKHZhbHVlc1swXSA+IHZhbHVlc1sxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnPD0nLCBwcmVjZWRlbmNlVmFsdWU6IDgwLCBsZWZ0T3BlcmFuZHM6IDEsIHJpZ2h0T3BlcmFuZHM6IDEsIGNvbmRpdGlvbk9wZXJhbmQ6ICdMJyxcclxuICAgICAgICBmdW5jdDogZnVuY3Rpb24gKGV4cHJlc3Npb24sIHZhbHVlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzWzBdIDw9IHZhbHVlc1sxXTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICc+PScsIHByZWNlZGVuY2VWYWx1ZTogOTAsIGxlZnRPcGVyYW5kczogMSwgcmlnaHRPcGVyYW5kczogMSwgY29uZGl0aW9uT3BlcmFuZDogJ0wnLFxyXG4gICAgICAgIGZ1bmN0OiBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXNbMF0gPj0gdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJz09JywgcHJlY2VkZW5jZVZhbHVlOiAxMDAsIGxlZnRPcGVyYW5kczogMSwgcmlnaHRPcGVyYW5kczogMSwgY29uZGl0aW9uT3BlcmFuZDogJ0wnLFxyXG4gICAgICAgIGZ1bmN0OiBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2FuZCcsIHByZWNlZGVuY2VWYWx1ZTogMTEwLCBsZWZ0T3BlcmFuZHM6IDEsIHJpZ2h0T3BlcmFuZHM6IDEsXHJcbiAgICAgICAgZnVuY3Q6IGZ1bmN0aW9uIChleHByZXNzaW9uLCB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1swXSAmJiB2YWx1ZXNbMV07XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnb3InLCBwcmVjZWRlbmNlVmFsdWU6IDEyMCwgbGVmdE9wZXJhbmRzOiAxLCByaWdodE9wZXJhbmRzOiAxLFxyXG4gICAgICAgIGZ1bmN0OiBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXNbMF0gfHwgdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ25vdCcsIHByZWNlZGVuY2VWYWx1ZTogMTMwLCBsZWZ0T3BlcmFuZHM6IDEsIHJpZ2h0T3BlcmFuZHM6IDEsIGNvbmRpdGlvbk9wZXJhbmQ6ICdMJyxcclxuICAgICAgICBmdW5jdDogZnVuY3Rpb24gKGV4cHJlc3Npb24sIHZhbHVlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gIXZhbHVlc1swXTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdiZXR3ZWVuJywgcHJlY2VkZW5jZVZhbHVlOiAxMzQsIGxlZnRPcGVyYW5kczogMSwgcmlnaHRPcGVyYW5kczogMSwgY29uZGl0aW9uT3BlcmFuZDogJ0wnLFxyXG4gICAgICAgIGZ1bmN0OiBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgdmFsdWVzLCBleGVjdXRvcikge1xyXG4gICAgICAgICAgICAvKiAgLmxlZnQgdmFsdWVcclxuICAgICAgICAgICAgICogIC5iZXRlZW5cclxuICAgICAgICAgICAgICogIC4uYW5kXHJcbiAgICAgICAgICAgICAqICAuLi52YWx1ZTFcclxuICAgICAgICAgICAgICogIC4uLnZhbHVlMlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICAgMS0tPk9wZXJhdG9yICAgICAgICAgIzIgICBiZXR3ZWVuXHJcbiAgICAgICAgICAgICAgICAyLS0tPkxpdGVyYWwgICAgICAgICAjMSAgIDYwMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ9PDYwMD5cclxuICAgICAgICAgICAgICAgIDItLS0+QmluYXJ5ICAgICAgICAgICM0ICAgYW5kXHJcbiAgICAgICAgICAgICAgICAzLS0tLT5MaXRlcmFsICAgICAgICAjMyAgIDUwMFxyXG4gICAgICAgICAgICAgICAgMy0tLS0+TGl0ZXJhbCAgICAgICAgIzUgICA3MDBcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGNvbnN0IHYwID0gdmFsdWVzWzBdO1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZEFuZCA9IGV4cHJlc3Npb24uY2hpbGRyZW5bMV07XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkMSA9IGNoaWxkQW5kLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZDIgPSBjaGlsZEFuZC5jaGlsZHJlblsxXTtcclxuICAgICAgICAgICAgY29uc3QgdjEgPSBleGVjdXRvci5nZXRWYWx1ZShjaGlsZDEpO1xyXG4gICAgICAgICAgICBjb25zdCB2MiA9IGV4ZWN1dG9yLmdldFZhbHVlKGNoaWxkMik7XHJcbiAgICAgICAgICAgIHJldHVybiAodjAgPj0gdjEgJiYgdjAgPD0gdjIpO1xyXG4gICAgICAgIH1cclxuICAgIH1dO1xyXG5jb25zdCBvcGVyYXRvckxpc3QgPSBbXHJcbiAgICBbJ14nLCAxMCwgWzEsIDFdLCBbMSwgMV1dLFxyXG4gICAgWycqJywgMjAsIFsxLCAxXSwgWzEsIDFdXSxcclxuICAgIFsnLScsIDMwLCBbMSwgMV0sIFsxLCAxXV0sXHJcbiAgICBbJysnLCA0MCwgWzEsIDFdLCBbMSwgMV1dLFxyXG4gICAgWycvJywgNTAsIFsxLCAxXSwgWzEsIDFdXSxcclxuICAgIFsnPCcsIDYwLCBbMCwgMV0sIFsxLCAxXV0sXHJcbiAgICBbJz4nLCA3MCwgWzAsIDFdLCBbMSwgMV1dLFxyXG4gICAgWyc8PScsIDgwLCBbMCwgMV0sIFsxLCAxXV0sXHJcbiAgICBbJz49JywgOTAsIFswLCAxXSwgWzEsIDFdXSxcclxuICAgIFsnPT0nLCAxMDAsIFswLCAxXSwgWzEsIDFdXSxcclxuICAgIFsnYW5kJywgMTEwLCBbMSwgMV0sIFsxLCAxXV0sXHJcbiAgICBbJ29yJywgMTIwLCBbMSwgMV0sIFsxLCAxXV0sXHJcbiAgICBbJ25vdCcsIDEzMCwgWzAsIDFdLCBbMCwgMV1dLFxyXG4gICAgWydiZXR3ZWVuJywgMTQwLCBbMCwgMV0sIFsxLCAxXV0sXHJcbl07XHJcbjtcclxuLyoqXHJcbiAqICBvcGVyYXRvciBkZWZpbml0aW9uXHJcbiAqXHJcbiAqICAgICAgbmFtZTpcclxuICogICAgICBwcmVjZWRlbmNlIHZhbHVlXHJcbiAqXHJcbiAqICAgICAgbGVmdE9wZXJhbmRzXHJcbiAqICAgICAgcmlnaHRPcGVyYW5kc1xyXG4gKiAgICAgIGNvbmRpdGlvbk9wZXJhbmRQb3NpdGlvbjogICBsZWZ0IG9yIHJpZ2h0IG9yIG5vbmVcclxuICpcclxuICpcclxuICogKi9cclxuLy8gZXhhbXBsZVxyXG5jbGFzcyBPcGVyYXRvciB7XHJcbiAgICBjb25zdHJ1Y3RvcihvYmopIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBvYmoubmFtZTtcclxuICAgICAgICB0aGlzLnByZWNlZGVuY2VWYWx1ZSA9IG9iai5wcmVjZWRlbmNlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5sZWZ0T3BlcmFuZHMgPSBvYmoubGVmdE9wZXJhbmRzO1xyXG4gICAgICAgIHRoaXMucmlnaHRPcGVyYW5kcyA9IG9iai5yaWdodE9wZXJhbmRzO1xyXG4gICAgICAgIHRoaXMuY29uZGl0aW9uT3BlcmFuZCA9IG9iai5jb25kaXRpb25PcGVyYW5kO1xyXG4gICAgICAgIHRoaXMuZnVuY3Rpb24gPSBvYmouZnVuY3Q7XHJcbiAgICB9XHJcbiAgICAvL3JldCA9IE9wZXJhdG9yLmV4ZWN1dGUoZXhwci52YWx1ZSwgdmFsdWVzLCB2YWx1ZSwgaXNDb25kaXRpb24pO1xyXG4gICAgc3RhdGljIGV4ZWN1dGUobmFtZSwgdmFsdWVzLCBleHByZXNzaW9uLCBleGVjdXRvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCcgZ290IGl0ICcgKyBuYW1lKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZXMpO1xyXG4gICAgICAgIGNvbnN0IG9wZXJhdG9yID0gT3BlcmF0b3Iub3BlcmF0b3JzTWFwLmdldChuYW1lKTtcclxuICAgICAgICBpZiAob3BlcmF0b3IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wZXJhdG9yLmZ1bmN0aW9uKGV4cHJlc3Npb24sIHZhbHVlcywgZXhlY3V0b3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBwYXJzZShyb290Tm9kZSwgcGFyc2VyLCBmb3JDb25kaXRpb24pIHtcclxuICAgICAgICBpZiAoIU9wZXJhdG9yLm9wZXJhdG9yc01hcCkge1xyXG4gICAgICAgICAgICBPcGVyYXRvci5vcGVyYXRvcnNNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIE9wZXJhdG9yLm9wZXJhdG9ycy5mb3JFYWNoKG9wZXJTdHJ1Y3QgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3BlciA9IG5ldyBPcGVyYXRvcihvcGVyU3RydWN0KTtcclxuICAgICAgICAgICAgICAgIE9wZXJhdG9yLm9wZXJhdG9yc01hcC5zZXQob3Blci5uYW1lLCBvcGVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgT3BlcmF0b3Iub3BlcmF0b3JzTWFwLmVudHJpZXMoKSkge1xyXG4gICAgICAgICAgICBjb25zdCBvcGVyID0gZW50cnlbMV07XHJcbiAgICAgICAgICAgIG9wZXIucGFyc2VPcGVyYXRvcihyb290Tm9kZSwgcGFyc2VyLCBmb3JDb25kaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHBhcnNlT3BlcmF0b3Iocm9vdE5vZGUsIHBhcnNlciwgZm9yQ29uZGl0aW9uKSB7XHJcbiAgICAgICAgbGV0IGxlZnRPcGVyYW5kcyA9IHRoaXMubGVmdE9wZXJhbmRzO1xyXG4gICAgICAgIGxldCByaWdodE9wZXJhbmRzID0gdGhpcy5yaWdodE9wZXJhbmRzO1xyXG4gICAgICAgIGxldCBjb25kaXRpb25PcGVyYW5kO1xyXG4gICAgICAgIGlmIChmb3JDb25kaXRpb24gJiYgdGhpcy5jb25kaXRpb25PcGVyYW5kKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmRpdGlvbk9wZXJhbmQgPT0gJ0wnKVxyXG4gICAgICAgICAgICAgICAgY29uZGl0aW9uT3BlcmFuZCA9ICdMJztcclxuICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb25kaXRpb25PcGVyYW5kID09ICdSJylcclxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbk9wZXJhbmQgPSAnUic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBub2RlID0gcm9vdE5vZGUuY2hpbGRyZW5bMF07XHJcbiAgICAgICAgbGV0IG1vdmVzID0gW107XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IFtdO1xyXG4gICAgICAgIHJvb3ROb2RlLmxvb3BVcChmdW5jdGlvbiAobm9kZSwgbGV2ZWwpIHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIiBmcm9tIGxvb3BpbmcgdXAgXCIgKyBub2RlLmlkKTtcclxuICAgICAgICAgICAgbGlzdC5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIG1vc3Qgb3BlcmF0b3JzIHJlbHkgb24gdHdvIG9wZXJhbmQgaG93ZXZlciBcclxuICAgICAgICBsaXN0LmZvckVhY2gobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgZGVidWcoJ3RyZWUnLCdjaGVja2luZyBub2RlICcgKyBub2RlLmlkICsgXCIgXCIrbm9kZS52YWx1ZSlcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImNoZWNraW5nIG9wZXJhdG9yIFwiICsgbm9kZS5pZCArIFwiIFwiICsgbm9kZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICgobm9kZS50eXBlID09IGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5PcGVyYXRvciB8fFxyXG4gICAgICAgICAgICAgICAgbm9kZS50eXBlID09IGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5CaW5hcnkgfHxcclxuICAgICAgICAgICAgICAgIG5vZGUudHlwZSA9PSBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuVGV4dCkgJiYgbm9kZS52YWx1ZSA9PSBzZWxmLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT0gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLlRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS50eXBlID0gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLk9wZXJhdG9yO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlZnRPcGVyYW5kcyA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmRpdGlvbk9wZXJhbmQgPT0gJ0wnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRXhwcmVzc2lvbk5vZGVfMS5FeHByZXNzaW9uTm9kZShjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuVGV4dCwgbm9kZSwgJyQkVkFMVUUnLCBub2RlLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tb3Zlcy5wdXNoKHsgbm9kZTogbmV3Tm9kZSwgcGFyZW50OiBub2RlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3ByMiA9IG5vZGUucHJldmlvdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHIyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlci5lcnJvcihcIkVycm9yIE9wZXJhdG9yIFwiICsgc2VsZi5uYW1lICsgXCIgcmVxdWlyZXMgYSBsZWZ0IHBhcmFtZXRlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3ByMi5tb3ZlKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnIG1vdmluZyAnICsgb3ByMi5pZCArICcgdG8gYmUgYSBjaGlsZCBvZiAnICsgbm9kZS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbW92ZXMucHVzaCh7IG5vZGU6IG9wcjIsIHBhcmVudDogbm9kZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocmlnaHRPcGVyYW5kcyA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmRpdGlvbk9wZXJhbmQgPT0gJ1InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFeHByZXNzaW9uTm9kZV8xLkV4cHJlc3Npb25Ob2RlKGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5UZXh0LCBub2RlLCAnJCRWQUxVRScsIG5vZGUucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3ByMSA9IG5vZGUubmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wcjEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VyLmVycm9yKFwiRXJyb3IgT3BlcmF0b3IgXCIgKyBzZWxmLm5hbWUgKyBcIiByZXF1aXJlcyBhIHJpZ2h0IHBhcmFtZXRlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3ByMS5tb3ZlKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnIG1vdmluZyAnICsgb3ByMS5pZCArICcgdG8gYmUgYSBjaGlsZCBvZiAnICsgbm9kZS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbW92ZXMucHVzaCh7IG5vZGU6IG9wcjEsIHBhcmVudDogbm9kZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xyXG4gICAgICAgICAgICBtb3ZlLm5vZGUubW92ZShtb3ZlLnBhcmVudCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcgbW92aW5nICcgKyBtb3ZlLm5vZGUuaWQgKyAnIHRvIGJlIGEgY2hpbGQgb2YgJyArIG1vdmUucGFyZW50LmlkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLk9wZXJhdG9yID0gT3BlcmF0b3I7XHJcbk9wZXJhdG9yLm9wZXJhdG9ycyA9IE9QRVJBVE9SUztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9T3BlcmF0b3IuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5SdWxlc0RlbGVnYXRlID0gdm9pZCAwO1xyXG5jb25zdCBBZGRpbnNfMSA9IHJlcXVpcmUoXCIuL0FkZGluc1wiKTtcclxuY2xhc3MgQ3VzdG9tRnVudGlvbnMgZXh0ZW5kcyBBZGRpbnNfMS5FeGVjdXRpb25Db250ZXh0IHtcclxuICAgIGZ1bihwYXJhbXMsIHZhbHVlLCBpc0NvbmRpdGlvbikge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbmNsYXNzIFJ1bGVzRGVsZWdhdGUge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB9XHJcbiAgICBpbml0KGV4ZWN1dG9yLCBkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gbmV3IEN1c3RvbUZ1bnRpb25zKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZXhlY3V0b3IgPSBleGVjdXRvcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIGlmIGEgdmFyaWFibGUgcmVxdWVzdCBidXQgbm90IGZvdW5kIGluIGNvbnRleHQgb2JqZWN0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWVcclxuICAgICAqL1xyXG4gICAgZ2V0VmFyaWFibGUobmFtZSkge1xyXG4gICAgICAgIHJldHVybiAncmVxdWVzdGluZyAnICsgbmFtZSArICcgYnV0IGRvbnQgaGF2ZSBhbnkgdmFsdWVzJztcclxuICAgIH1cclxuICAgIGN1c3RvbUZ1bmN0aW9ucyhmdW5jdCwgcGFyYW1zLCBleGVjdXRvcikge1xyXG4gICAgICAgIGxldCBvYmogPSB0aGlzLmNvbnRleHQ7XHJcbiAgICAgICAgaWYgKGZ1bmN0LmluY2x1ZGVzKCcuJykpIHtcclxuICAgICAgICAgICAgbGV0IHBhdGggPSBmdW5jdC5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICBsZXQgaTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gcGF0aFtpXTtcclxuICAgICAgICAgICAgICAgIGlmIChpID09IHBhdGgubGVuZ3RoIC0gMSlcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdCA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gb2JqW25hbWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmpbZnVuY3RdKHBhcmFtcywgZXhlY3V0b3IpO1xyXG4gICAgfVxyXG4gICAgZXhlY3V0ZUZ1bmN0aW9uKGZ1bmN0LCBwYXJhbXMsIGV4ZWN1dG9yKSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBleGVjdXRvci52YWx1ZTtcclxuICAgICAgICBjb25zdCBpc0NvbmRpdGlvbiA9IGV4ZWN1dG9yLmZvckNvbmRpdGlvbjtcclxuICAgICAgICBzd2l0Y2ggKGZ1bmN0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2luJzpcclxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMuaW5kZXhPZih2YWx1ZSkgIT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0c1dpdGgnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnN0YXJ0c1dpdGgocGFyYW1zWzBdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdlbmRzV2l0aCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuZW5kc1dpdGgocGFyYW1zWzBdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdpbmNsdWVzJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5pbmNsdWRlcyhwYXJhbXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2JldHdlZW4nOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSA+PSBwYXJhbXNbMF0gJiYgdmFsdWUgPD0gcGFyYW1zWzFdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VzdG9tRnVuY3Rpb25zKGZ1bmN0LCBwYXJhbXMsIGV4ZWN1dG9yKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlJ1bGVzRGVsZWdhdGUgPSBSdWxlc0RlbGVnYXRlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1SdWxlc0RlbGVnYXRlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuVHJlZUJ1aWxkZXIgPSB2b2lkIDA7XHJcbmNvbnN0IGNvbW1vbl8xID0gcmVxdWlyZShcIi4vY29tbW9uXCIpO1xyXG5jb25zdCBFeHByZXNzaW9uTm9kZV8xID0gcmVxdWlyZShcIi4vRXhwcmVzc2lvbk5vZGVcIik7XHJcbmNvbnN0IE9wZXJhdG9yXzEgPSByZXF1aXJlKFwiLi9PcGVyYXRvclwiKTtcclxuLypcclxuICpcclxuICogYWRqdXN0IHRyZWUgZm9yIHNpbXBsZSBjb25kaXRpb25zIGFzIGZvbGxvd3M6XHJcbiAqXHJcbiAqIFNpbXBsZSBNb2RlOlxyXG4gKiBSdWxlczpcclxuICogIC0gICBjb21wYXJlIG9wcmF0b3JzICg8Pj09KSByZXF1aXJlIG9ubHkgMSBwYXJhbWV0ZXIgdnMgMiBpbiBTY3JpcHQgbW9kZVxyXG4gKiAgLVxyXG4gKiAgLSAgIGZ1bmN0aW9ucyBmaXJzdCBwYXJhbWV0ZXIgaXMgdGhlIHZhbHVlXHJcbiAqXHJcbiAqICBzaW5nbGUgbm9kZSAtPiAgICAgICAgICAgICAgICAgIGFkZCAkJCA9PVxyXG4gKlxyXG4gKiAgc2luZ2xlIG5vZGUgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UgdG8gdGV4dCB0byBsaXRlcmFsXHJcbiAqXHJcbiAqICBjb21wYXJlIG9wZXJhdGlvbiAgICA+PSAgICAgICAgIGFkZCAkJCBpbiBmcm9udFxyXG4gKlxyXG4gKlxyXG4gKiAgU2ltcGxlIENvbmRpdGlvbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTY3JpcHRcclxuICogIG5vdCA1ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgIT0gNVxyXG4gKiAgPjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCA+NVxyXG4gKiAgaW4gKDEsMiwzKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbigkJCwxLDIsMylcclxuICogIGJldHdlZW4oYSxiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmV0d2VlbigkJCxhLGIpXHJcbiAqICAxKzIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDErMlxyXG4gKlxyXG4gKlxyXG4gKi9cclxuLyogVG9kbzpcclxuICpcclxuICAgIGV4cHJlc3Npb25cclxuICAgIHJlc3VsdC1leHByZXNzaW9uXHJcbiAgICBoYW5kbGUgcmVzdWx0IGV4cHJlc3Npb25zOlxyXG5cclxuICAgIGNvbnN0YW50XHJcbiAgICAgICAgJ2hpZ2gnXHJcbiAgICAgICAgNTAwXHJcblxyXG4gICAgb3BlcmF0aW9uc1xyXG4gICAgICAgIDUwMCAqIDEuNVxyXG5cclxuICAgIHZhcmlhYmxlc1xyXG4gICAgICAgIHNhbGFyeSAqIDEuNVxyXG5cclxuKi9cclxuY2xhc3MgVHJlZUJ1aWxkZXIge1xyXG4gICAgY29uc3RydWN0b3IodG9rZW5zKSB7XHJcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcclxuICAgICAgICB0aGlzLnRva2VucyA9IHRva2VucztcclxuICAgICAgICB0aGlzLnBvcyA9IDA7XHJcbiAgICB9XHJcbiAgICBidWlsZChmb3JDb25kaXRpb24pIHtcclxuICAgICAgICB0aGlzLnJvb3ROb2RlID0gdGhpcy5uZXdOb2RlKG51bGwsIHRoaXMudG9rZW5zWzBdLCBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuUm9vdCk7XHJcbiAgICAgICAgdGhpcy5yb290Tm9kZS52YWx1ZSA9ICcnO1xyXG4gICAgICAgIGlmICh0aGlzLnRva2Vucy5sZW5ndGggPT0gMSAmJiB0aGlzLnRva2Vuc1swXS5lbnRyeSA9PSAnLScpIHtcclxuICAgICAgICAgICAgdGhpcy5yb290Tm9kZS50eXBlID0gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLkFsd2F5c1RydWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvb3ROb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRva2Vucy5mb3JFYWNoKHRva2VuID0+IHtcclxuICAgICAgICAgICAgdGhpcy5uZXdOb2RlKHRoaXMucm9vdE5vZGUsIHRva2VuKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsIFwiIGJlZm9yZSBicmFja2V0cyBcIik7XHJcbiAgICAgICAgdGhpcy5yb290Tm9kZS5kaXNwbGF5RXhwcmVzc2lvbigpO1xyXG4gICAgICAgIGlmICghdGhpcy5idWlsZEJyYWNrZXRzKHRoaXMucm9vdE5vZGUpKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsIFwiIGFmdGVyIGJyYWNrZXRzIFwiKTtcclxuICAgICAgICB0aGlzLnJvb3ROb2RlLmRpc3BsYXlFeHByZXNzaW9uKCk7XHJcbiAgICAgICAgLy8gIG9wZXJhdG9yLCBGb3JDb25kaXRpb24sIEZvckV4cHJlc3Npb25cclxuICAgICAgICAvLyAgICAgICAgICAsIGxlZnQsIHJpZ2h0ICwgbGVmdCAscmlnaHRcclxuICAgICAgICBPcGVyYXRvcl8xLk9wZXJhdG9yLnBhcnNlKHRoaXMucm9vdE5vZGUsIHRoaXMsIGZvckNvbmRpdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdE5vZGU7XHJcbiAgICB9XHJcbiAgICBuZXdOb2RlKHBhcmVudCwgdG9rZW4sIHR5cGUgPSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIEV4cHJlc3Npb25Ob2RlXzEuRXhwcmVzc2lvbk5vZGUuTmV3RnJvbVRva2VuKHRva2VuLCBwYXJlbnQsIHR5cGUpO1xyXG4gICAgfVxyXG4gICAgLyogY2hlY2sgZm9yIGJyYWNrZXRzXHJcbiAgICAgICAgKiBiZWZvcmU6XHJcbiAgICAgICAgKlxyXG4gICAgICAgICogICB0MVxyXG4gICAgICAgICogICB0MlxyXG4gICAgICAgICogICAoXHJcbiAgICAgICAgKiAgIHQzXHJcbiAgICAgICAgKiAgIHQ0XHJcbiAgICAgICAgKiAgIChcclxuICAgICAgICAqICAgdDVcclxuICAgICAgICAqICAgdDZcclxuICAgICAgICAqICAgKVxyXG4gICAgICAgICogICApXHJcbiAgICAgICAgKiBhZnRlcjpcclxuICAgICAgICAqXHJcbiAgICAgICAgKiAgIHQxXHJcbiAgICAgICAgKiAgIHQyXHJcbiAgICAgICAgKiAgIChcclxuICAgICAgICAqICAgICAgIHQzXHJcbiAgICAgICAgKiAgICAgICB0NFxyXG4gICAgICAgICogICAgICAgKFxyXG4gICAgICAgICogICAgICAgICAgIHQ1XHJcbiAgICAgICAgKiAgICAgICAgICAgdDZcclxuICAgICAgICAqXHJcbiAgICAgICAgKlxyXG4gICAgICAgICogICBvcGVyYW5kMVxyXG4gICAgICAgICAgICAqIG9wXHJcbiAgICAgICAgICAgICogb3BlcmFuZDJcclxuICAgICAgICAgICAgKiBhZnRlcjogb3BcclxuICAgICAgICAgICAgICAgICogb3BlcmFuZDFcclxuICAgICAgICAgICAgICAgICogb3BlcmFuZDJcclxuICAgICovXHJcbiAgICBidWlsZEJyYWNrZXRzKHJvb3ROb2RlKSB7XHJcbiAgICAgICAgbGV0IG1vdmVzID0gW107XHJcbiAgICAgICAgbGV0IGRlbGV0ZXMgPSBbXTtcclxuICAgICAgICBsZXQgcHJldiA9IG51bGw7XHJcbiAgICAgICAgbGV0IG5leHROb2RlID0gbnVsbDtcclxuICAgICAgICBsZXQgbm9kZSA9IHJvb3ROb2RlLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgIHdoaWxlIChub2RlKSB7XHJcbiAgICAgICAgICAgIGNvbW1vbl8xLmRlYnVnKCd0cmVlJywgXCIgcm9vdCBjaGVja2luZyBub2RlIFwiICsgbm9kZS5pZCk7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT0gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLk9wZXJhdG9yICYmIG5vZGUudmFsdWUgPT0gJygnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkQnJhY2tldE5vZGVzKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgY29tbW9uXzEuZGVidWcoJ3RyZWUnLCAnIHJvb3QgZ290IGJhY2sgZnJvbSBidWlsZGluZyBicmFja2V0IGNoaWxkJyArIG5vZGUuaWQpO1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHJvb3ROb2RlLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChub2RlKVxyXG4gICAgICAgICAgICAgICAgY29tbW9uXzEuZGVidWcoJ3RyZWUnLCBcIiByb290IGdvdCBuZXh0IG5vZGVcIiArIG5vZGUuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsIFwiIGJlZm9yZSBjYWxsIGZpeGVzXCIpO1xyXG4gICAgICAgIHJvb3ROb2RlLmRpc3BsYXlFeHByZXNzaW9uKCk7XHJcbiAgICAgICAgcm9vdE5vZGUubG9vcChmdW5jdGlvbiAobm9kZSwgbGV2ZWwpIHtcclxuICAgICAgICAgICAgY29tbW9uXzEuZGVidWcoJ3RyZWUnLCAnIGxvb3AgJyArIG5vZGUuaWQpO1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IG5vZGUucHJldmlvdXMoKTtcclxuICAgICAgICAgICAgaWYgKHByZXYgJiYgcHJldi50eXBlID09IGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5UZXh0ICYmIG5vZGUudHlwZSA9PSBjb21tb25fMS5FWFBSRVNTSU9OX1RZUEUuQnJhY2tldCkge1xyXG4gICAgICAgICAgICAgICAgcHJldi50eXBlID0gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLkNhbGw7XHJcbiAgICAgICAgICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsICcgbW92aW5nICcgKyBub2RlLmlkICsgXCIgY2FsbCB0byBcIiArIHByZXYuaWQpO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5tb3ZlKHByZXYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcm9vdE5vZGUuZGlzcGxheUV4cHJlc3Npb24oKTtcclxuICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsIFwiIGFmdGVyIGNhbGwgZml4ZXNcIik7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBlcnJvcihtc2cpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIioqKioqKioqKipcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2cobXNnKTtcclxuICAgICAgICBjb21tb25fMS5kZWJ1ZygnZXJyb3InLCBtc2cpO1xyXG4gICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobXNnKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIioqKioqKioqKipcIik7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgYnVpbGRCcmFja2V0Tm9kZXMoc3RhcnQpIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHN0YXJ0O1xyXG4gICAgICAgIGxldCBicmFja2V0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgbGV0IG1vdmVzID0gW107XHJcbiAgICAgICAgbGV0IGRlbGV0ZXMgPSBbXTtcclxuICAgICAgICBsZXQgcHJldiA9IG51bGw7XHJcbiAgICAgICAgbGV0IG5leHROb2RlID0gbnVsbDtcclxuICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsIFwiIGJ1aWxkIGJyYWNrZXRzIGZvciBcIiArIHN0YXJ0LmlkKTtcclxuICAgICAgICB3aGlsZSAobm9kZSkge1xyXG4gICAgICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsIFwiIGNoZWNraW5nIG5vZGUgXCIgKyBub2RlLmlkICsgXCIgYnkgXCIgKyBzdGFydC5pZCk7XHJcbiAgICAgICAgICAgIGlmIChicmFja2V0Tm9kZSAmJiBub2RlLnZhbHVlID09ICcoJykge1xyXG4gICAgICAgICAgICAgICAgbW92ZXMucHVzaCh7IG5vZGUsIHBhcmVudDogYnJhY2tldE5vZGUgfSk7XHJcbiAgICAgICAgICAgICAgICBjb21tb25fMS5kZWJ1ZygndHJlZScsICcgIG1vdmluZyAnICsgbm9kZS5pZCArIFwiIHN1YiBicmFja2V0ICB0byBcIiArIGJyYWNrZXROb2RlLmlkKTtcclxuICAgICAgICAgICAgICAgIGNvbW1vbl8xLmRlYnVnKCd0cmVlJywgJyAgY2FsbGluZyBzdWIgJyArIG5vZGUuaWQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWlsZEJyYWNrZXROb2Rlcyhub2RlKTtcclxuICAgICAgICAgICAgICAgIGNvbW1vbl8xLmRlYnVnKCd0cmVlJywgJyBnb3QgYmFjayBmcm9tIGJ1aWxkaW5nIGJyYWNrZXQgY2hpbGQnICsgbm9kZS5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS52YWx1ZSA9PSAnKCcpIHtcclxuICAgICAgICAgICAgICAgIGJyYWNrZXROb2RlID0gbm9kZTtcclxuICAgICAgICAgICAgICAgIG5vZGUudHlwZSA9IGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5CcmFja2V0O1xyXG4gICAgICAgICAgICAgICAgLyogICAgICAgICAgICAgICAgcHJldiA9IG5vZGUucHJldmlvdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldiAmJiBwcmV2LnR5cGUgPT0gRVhQUkVTU0lPTl9UWVBFLlRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldi50eXBlID0gRVhQUkVTU0lPTl9UWVBFLkNhbGw7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgZGVidWcoJ3RyZWUnLCcgbW92aW5nICcgKyBub2RlLmlkICsgXCIgY2FsbCB0byBcIiArIHByZXYuaWQpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIG1vdmVzLnB1c2goeyBub2RlLCBwYXJlbnQ6IHByZXZ9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGJyYWNrZXROb2RlICYmIG5vZGUudmFsdWUgPT0gJyknKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmRlbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoYnJhY2tldE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIG1vdmVzLnB1c2goeyBub2RlLCBwYXJlbnQ6IGJyYWNrZXROb2RlIH0pO1xyXG4gICAgICAgICAgICAgICAgY29tbW9uXzEuZGVidWcoJ3RyZWUnLCAnICBtb3ZpbmcgJyArIG5vZGUuaWQgKyBcIiBlbGVtZW50IG9mICggXCIgKyBicmFja2V0Tm9kZS5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xyXG4gICAgICAgICAgICBtb3ZlLm5vZGUubW92ZShtb3ZlLnBhcmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc3RhcnQuZGlzcGxheUV4cHJlc3Npb24oKTtcclxuICAgICAgICByZXR1cm4gYnJhY2tldE5vZGU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNoZWNrIGZvciBvcGVyYXRvcnMgYW5kIG1vdmVcclxuICAgICAqIGJlZm9yZTogICBvcGVyYW5kMVxyXG4gICAgICogICAgICAgICAgIG9wXHJcbiAgICAgKiAgICAgICAgICAgb3BlcmFuZDJcclxuICAgICAqIGFmdGVyOiAgICBvcFxyXG4gICAgICogICAgICAgICAgICAgIG9wZXJhbmQxXHJcbiAgICAgKiAgICAgICAgICAgICAgb3BlcmFuZDJcclxuICAgICAqICovXHJcbiAgICBCdWlsZE9wZXJhdG9ycyhvcGVyYXRvciwgbGVmdE9wZXJhbmRzLCByaWdodE9wZXJhbmRzKSB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLnJvb3ROb2RlLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgIGxldCBtb3ZlcyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIC8vIG1vc3Qgb3BlcmF0b3JzIHJlbHkgb24gdHdvIG9wZXJhbmQgaG93ZXZlciBcclxuICAgICAgICB0aGlzLnJvb3ROb2RlLmxvb3AoZnVuY3Rpb24gKG5vZGUsIGxldmVsKSB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgZGVidWcoJ3RyZWUnLCdjaGVja2luZyBub2RlICcgKyBub2RlLmlkICsgXCIgXCIrbm9kZS52YWx1ZSlcclxuICAgICAgICAgICAgaWYgKG5vZGUudmFsdWUgPT0gJ2JldHdlZW4nICYmIG5vZGUudHlwZSA9PSAnVGV4dCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZXR3ZWVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKChub2RlLnR5cGUgPT0gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLk9wZXJhdG9yIHx8XHJcbiAgICAgICAgICAgICAgICBub2RlLnR5cGUgPT0gY29tbW9uXzEuRVhQUkVTU0lPTl9UWVBFLkJpbmFyeSB8fFxyXG4gICAgICAgICAgICAgICAgbm9kZS50eXBlID09IGNvbW1vbl8xLkVYUFJFU1NJT05fVFlQRS5UZXh0KSAmJiBub2RlLnZhbHVlID09IG9wZXJhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGVmdE9wZXJhbmRzID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHIyID0gbm9kZS5wcmV2aW91cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghb3ByMilcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZXJyb3IoXCJFcnJvciBPcGVyYXRvciBcIiArIG9wZXJhdG9yICsgXCIgcmVxdWlyZXMgYSBsZWZ0IHBhcmFtZXRlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICBtb3Zlcy5wdXNoKHsgbm9kZTogb3ByMiwgcGFyZW50OiBub2RlIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHJpZ2h0T3BlcmFuZHMgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wcjEgPSBub2RlLm5leHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wcjEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmVycm9yKFwiRXJyb3IgT3BlcmF0b3IgXCIgKyBvcGVyYXRvciArIFwiIHJlcXVpcmVzIGEgcmlnaHQgcGFyYW1ldGVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdmVzLnB1c2goeyBub2RlOiBvcHIxLCBwYXJlbnQ6IG5vZGUgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xyXG4gICAgICAgICAgICBtb3ZlLm5vZGUubW92ZShtb3ZlLnBhcmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5UcmVlQnVpbGRlciA9IFRyZWVCdWlsZGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1UcmVlQnVpbGRlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMubG9nZ2VyID0gZXhwb3J0cy5Mb2dnZXIgPSBleHBvcnRzLmRlYnVnID0gZXhwb3J0cy5PcHRpb25zID0gZXhwb3J0cy5FWFBSRVNTSU9OX1RZUEUgPSBleHBvcnRzLlRPS0VOX0dST1VQID0gdm9pZCAwO1xyXG5jb25zdCBSdWxlc0RlbGVnYXRlXzEgPSByZXF1aXJlKFwiLi9SdWxlc0RlbGVnYXRlXCIpO1xyXG5jb25zdCBGUyA9IHJlcXVpcmUoJ2ZzJyk7XHJcbnZhciBUT0tFTl9HUk9VUDtcclxuKGZ1bmN0aW9uIChUT0tFTl9HUk9VUCkge1xyXG4gICAgVE9LRU5fR1JPVVBbXCJhbHBoYVwiXSA9IFwiYWxwaGFcIjtcclxuICAgIFRPS0VOX0dST1VQW1wibnVtYmVyXCJdID0gXCJudW1iZXJcIjtcclxuICAgIFRPS0VOX0dST1VQW1wic3ltYm9sXCJdID0gXCJzeW1ib2xcIjtcclxuICAgIFRPS0VOX0dST1VQW1wic3BhY2VcIl0gPSBcInNwYWNlXCI7XHJcbn0pKFRPS0VOX0dST1VQID0gZXhwb3J0cy5UT0tFTl9HUk9VUCB8fCAoZXhwb3J0cy5UT0tFTl9HUk9VUCA9IHt9KSk7XHJcbi8vICBUZXh0ICAgIHdvcmRzIHdpdGhvdXQgcXVvdGVcclxuLy8gIHN0cmluZyAgcXVvdGVkIHN0cmluZ1xyXG4vLyAgTnVtYmVyICBudW1lcmljIHZhbHVlc1xyXG52YXIgRVhQUkVTU0lPTl9UWVBFO1xyXG4oZnVuY3Rpb24gKEVYUFJFU1NJT05fVFlQRSkge1xyXG4gICAgRVhQUkVTU0lPTl9UWVBFW1wiUm9vdFwiXSA9IFwiUm9vdFwiO1xyXG4gICAgRVhQUkVTU0lPTl9UWVBFW1wiU2luZ2xlXCJdID0gXCJTaW5nbGVcIjtcclxuICAgIEVYUFJFU1NJT05fVFlQRVtcIkxpdGVyYWxcIl0gPSBcIkxpdGVyYWxcIjtcclxuICAgIEVYUFJFU1NJT05fVFlQRVtcIk51bWJlclwiXSA9IFwiTnVtYmVyXCI7XHJcbiAgICBFWFBSRVNTSU9OX1RZUEVbXCJUZXh0XCJdID0gXCJUZXh0XCI7XHJcbiAgICBFWFBSRVNTSU9OX1RZUEVbXCJCaW5hcnlcIl0gPSBcIkJpbmFyeVwiO1xyXG4gICAgRVhQUkVTU0lPTl9UWVBFW1wiT3BlcmF0b3JcIl0gPSBcIk9wZXJhdG9yXCI7XHJcbiAgICBFWFBSRVNTSU9OX1RZUEVbXCJCcmFja2V0XCJdID0gXCJCcmFja2V0XCI7XHJcbiAgICBFWFBSRVNTSU9OX1RZUEVbXCJHcm91cFwiXSA9IFwiR3JvdXBcIjtcclxuICAgIEVYUFJFU1NJT05fVFlQRVtcIkNhbGxcIl0gPSBcIkNhbGxcIjtcclxuICAgIEVYUFJFU1NJT05fVFlQRVtcIlRva2VuXCJdID0gXCJcIjtcclxuICAgIEVYUFJFU1NJT05fVFlQRVtcIkFsd2F5c1RydWVcIl0gPSBcIlRydWVcIjtcclxufSkoRVhQUkVTU0lPTl9UWVBFID0gZXhwb3J0cy5FWFBSRVNTSU9OX1RZUEUgfHwgKGV4cG9ydHMuRVhQUkVTU0lPTl9UWVBFID0ge30pKTtcclxuY2xhc3MgT3B0aW9ucyB7XHJcbn1cclxuZXhwb3J0cy5PcHRpb25zID0gT3B0aW9ucztcclxuT3B0aW9ucy5kZWJ1Z1Rva2VucyA9IGZhbHNlO1xyXG5PcHRpb25zLmRlYnVnRXhwcmVzc2lvbiA9IGZhbHNlO1xyXG5PcHRpb25zLmRlYnVnRXhlY3V0aW9uID0gZmFsc2U7XHJcbk9wdGlvbnMuZGVidWdUcmVlID0gZmFsc2U7XHJcbk9wdGlvbnMuZGVsZWdhdGUgPSBuZXcgUnVsZXNEZWxlZ2F0ZV8xLlJ1bGVzRGVsZWdhdGUoKTtcclxuZnVuY3Rpb24gZGVidWcodHlwZSwgdGl0bGUsIG9iaiA9IG51bGwpIHtcclxuICAgIGV4cG9ydHMubG9nZ2VyLmxvZyh0aXRsZSk7XHJcbiAgICBpZiAodHlwZSA9PSAnZXhlY3V0aW9uJyAmJiAhT3B0aW9ucy5kZWJ1Z0V4ZWN1dGlvbilcclxuICAgICAgICByZXR1cm47XHJcbiAgICBpZiAodHlwZSA9PSAndG9rZW5zJyAmJiAhT3B0aW9ucy5kZWJ1Z1Rva2VucylcclxuICAgICAgICByZXR1cm47XHJcbiAgICBpZiAodHlwZSA9PSAndHJlZScgJiYgIU9wdGlvbnMuZGVidWdUcmVlKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIGNvbnNvbGUubG9nKHRpdGxlKTtcclxuICAgIGlmIChvYmopIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhvYmopO1xyXG4gICAgICAgIGV4cG9ydHMubG9nZ2VyLmxvZyhKU09OLnN0cmluZ2lmeShvYmopKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmRlYnVnID0gZGVidWc7XHJcbmNsYXNzIExvZ2dlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih7IHRvQ29uc29sZSA9IHRydWUsIHRvRmlsZSA9ICcnLCBjYWxsYmFjayA9IG51bGwgfSkge1xyXG4gICAgICAgIHRoaXMuZGVidWdNc2dzID0gW107XHJcbiAgICAgICAgdGhpcy50b0NvbnNvbGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudG9GaWxlID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNldE9wdGlvbnMoeyB0b0NvbnNvbGUsIHRvRmlsZSwgY2FsbGJhY2sgfSk7XHJcbiAgICB9XHJcbiAgICBzZXRPcHRpb25zKHsgdG9Db25zb2xlLCB0b0ZpbGUsIGNhbGxiYWNrIH0pIHtcclxuICAgICAgICB0aGlzLnRvQ29uc29sZSA9IHRvQ29uc29sZTtcclxuICAgICAgICB0aGlzLnRvRmlsZSA9IHRvRmlsZTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB9XHJcbiAgICBtc2cobWVzc2FnZSwgdHlwZSA9ICdsb2cnKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudG9Db25zb2xlKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcclxuICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKG1lc3NhZ2UsIHR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlYnVnTXNncy5wdXNoKHsgbWVzc2FnZSwgdHlwZSB9KTtcclxuICAgIH1cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuZGVidWdNc2dzID0gW107XHJcbiAgICB9XHJcbiAgICBnZXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVidWdNc2dzO1xyXG4gICAgfVxyXG4gICAgZGVidWcobWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMubXNnKG1lc3NhZ2UsICdkZWJ1ZycpO1xyXG4gICAgfVxyXG4gICAgd2FybihtZXNzYWdlKSB7XHJcbiAgICAgICAgdGhpcy5tc2cobWVzc2FnZSwgJ3dhcm4nKTtcclxuICAgIH1cclxuICAgIGxvZyhtZXNzYWdlKSB7XHJcbiAgICAgICAgdGhpcy5tc2cobWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICBlcnJvcihlcnIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgaWYgKGVyci5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1zZyhlcnIubWVzc2FnZSwgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXFxuRXJyb3IgTWVzc2FnZTogJyArIGVyci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZXJyLnN0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXFxuU3RhY2t0cmFjZTonKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCc9PT09PT09PT09PT09PT09PT09PScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nKGVyci5zdGFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXNnKGVyciwgJ2Vycm9yJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgfVxyXG4gICAgc2F2ZShmaWxlbmFtZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwid3JpdGluZyB0bzpcIiArIGZpbGVuYW1lICsgXCIgXCIgKyB0aGlzLmRlYnVnTXNncy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBsZXQgaWQgPSBGUy5vcGVuU3luYyhmaWxlbmFtZSwgJ3cnLCA2NjYpO1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBGUy53cml0ZVN5bmMoaWQsICdTdGFydGVkIGF0OiAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpICsgXCJcXG5cIiwgbnVsbCwgJ3V0ZjgnKTtcclxuICAgICAgICAgICAgICAgIGxldCBsID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobCA9IDA7IGwgPCB0aGlzLmRlYnVnTXNncy5sZW5ndGg7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtc2cgPSB0aGlzLmRlYnVnTXNnc1tsXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobXNnLnR5cGUgPT0gJ2Vycm9yJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGluZSA9IG1zZy50eXBlICsgXCI6IGF0IGxpbmUgXCIgKyAobCArIDEpICsgXCIgXCIgKyBtc2cubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgRlMud3JpdGVTeW5jKGlkLCBsaW5lICsgXCJcXG5cIiwgbnVsbCwgJ3V0ZjgnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGwgPSAwOyBsIDwgdGhpcy5kZWJ1Z01zZ3MubGVuZ3RoOyBsKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbXNnID0gdGhpcy5kZWJ1Z01zZ3NbbF07XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1zZy50eXBlID09ICdlcm9yJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZSA9IG1zZy50eXBlICsgXCI6XCIgKyBtc2cubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUgPSBtc2cubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICBGUy53cml0ZVN5bmMoaWQsIGxpbmUgKyBcIlxcblwiLCBudWxsLCAndXRmOCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgRlMuY2xvc2VTeW5jKGlkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuTG9nZ2VyID0gTG9nZ2VyO1xyXG5leHBvcnRzLmxvZ2dlciA9IG5ldyBMb2dnZXIoeyB0b0NvbnNvbGU6IGZhbHNlIH0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21tb24uanMubWFwIl19
