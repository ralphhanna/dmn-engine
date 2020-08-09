"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.Expresion = void 0;
const ExpressionNode_1 = require("./ExpressionNode");
const RulesDelegate_1 = require("./RulesDelegate");
const TreeBuilder_1 = require("./TreeBuilder");
const Executor_1 = require("./Executor");
const common_1 = require("./common");
//var REGEX = /([a-zA-Z\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
var REGEX = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
//var OPERATORS = `<>=!+-*/`;
class Expresion {
    static compile(script) {
        const inst = new Expresion();
        inst.script = script;
        const parser = new Parser();
        inst.rootNode = parser.compile(script);
        return inst;
    }
    static load(json) {
        const inst = new Expresion();
        return inst;
    }
    display() {
        this.rootNode.displayExpression();
    }
    evaluateCondition(context, value) {
        const msg = "Evaluating Condition '" + value + "' :  '" + this.script + "'";
        console.log(msg);
        common_1.logger.log('');
        common_1.logger.log('');
        common_1.logger.log(msg);
        common_1.logger.log('--------------------------------------');
        const executor = new Executor_1.Executor(new RulesDelegate_1.RulesDelegate(), context);
        const result = executor.evaluateCondition(this.rootNode, value);
        this.display();
        common_1.logger.log('result:' + result);
        console.log('result:' + result);
        return result;
    }
    evaluate(context) {
        const msg = "Evaluating Expresion'" + this.script + "'";
        console.log(msg);
        common_1.logger.log('');
        common_1.logger.log('');
        common_1.logger.log(msg);
        common_1.logger.log('--------------------------------------');
        const executor = new Executor_1.Executor(new RulesDelegate_1.RulesDelegate(), context);
        const result = executor.evaluateCondition(this.rootNode, null, false);
        console.log('result:' + result);
        return result;
    }
}
exports.Expresion = Expresion;
class Parser {
    constructor() {
        this.type = 'Condition';
    }
    compile(string) {
        let tokens = Parser.tokenize(string);
        tokens = this.preParse(tokens);
        const builder = new TreeBuilder_1.TreeBuilder(tokens);
        const expr = builder.build();
        this.postParse(expr);
        expr.displayExpression();
        return expr;
    }
    evaluateCondition(string, value) {
        const expr = Expresion.compile(string);
        const data = { caseId: 1001, customer: 'Mr. Hanna' };
        const executor = new Executor_1.Executor(new RulesDelegate_1.RulesDelegate(), data);
        const result = expr.evaluateCondition(data, value);
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
        const expr = this.compile(string);
        const data = { caseId: 1001, customer: 'Mr. Hanna' };
        const executor = new Executor_1.Executor(new RulesDelegate_1.RulesDelegate(), data);
        const result = executor.evaluateCondition(expr, null, false);
        console.log('result:' + result);
        return result;
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
                        msg += ' g#:' + g + ExpressionNode_1.Token.groups[g - 1] + " " + entry;
                        const token = new ExpressionNode_1.Token();
                        token.index = result.index;
                        token.group = ExpressionNode_1.Token.groups[g - 1];
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
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map