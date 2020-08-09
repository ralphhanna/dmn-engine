
import { Expression, ExpressionNode } from './ExpressionNode'
import { RulesDelegate } from './RulesDelegate';
import { TreeBuilder} from './TreeBuilder';
import { Executor } from './Executor';
import { logger, debug , TOKEN_GROUP ,EXPRESSION_TYPE , Options} from './common';

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

export class Token {
    static groups = ['number', 'alpha', 'space' , 'symbol'];

    index;
    group;
    entry;
    bracketEndToken;
    isOperator() {
        return (this.group == 'symbol' && OPERATORS.includes(this.entry));
    }
    isLiteral() {

    }
}
export class Parser {

    
    compile(string,forCondtion) {
        ExpressionNode.id = 0;
        let tokens = Parser.tokenize(string);
        tokens = this.preParse(tokens);

        const builder = new TreeBuilder(tokens);
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
            result =re.exec(string)
            if (result) {
                let msg = '@' + result.index + " ";
                let g = 0;
                result.forEach(entry => {
                    if (entry && g > 0) {
                        msg += ' g#:' + g + Token.groups[g-1] + " " + entry;
                        const token = new Token();
                        token.index = result.index;
                        token.group = Token.groups[g-1];
                        token.entry = entry;
                        //seps.push({ index: result.index, group: groups[g - 1], entry });
                        seps.push(token);
                        //console.log(msg);
                    }
                    g++;
                })

                //            console.log(msg);

            }
        } while (result != null)
        if (Options.debugTokens)
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
                        (prevEntry.entry == '<' || prevEntry.entry == '>' || prevEntry.entry=='=' )) {
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
                tokens.push(sep)

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
        if (Options.debugTokens) {
            console.log(' after cleaning..');
            console.log(tokens);
        }
        return tokens;
    }
}

