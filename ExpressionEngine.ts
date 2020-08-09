import { Logger } from '..';
import { Expression, ExpressionNode, Condition } from './ExpressionNode'
import { RulesDelegate } from './RulesDelegate';

import { Executor } from './Executor';
import { logger, debug , TOKEN_GROUP ,EXPRESSION_TYPE , Options} from './common';
import { Token } from './ExpressionParser';

//var REGEX = /([a-zA-Z\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
var REGEX = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;

//var OPERATORS = `<>=!+-*/`;
export class ExpressionEngine {


    evaluateCondition(string, value) {

        const data = { value: value, caseId: 1001, customer: 'Mr. Hanna' };
        const expr = Condition.compile(string,'value');

        if (!expr)
            return null;

        const result = expr.evaluate(data);

        expr.display();
        console.log('result:' + result);
        return result;

        expr.display();
        logger.log('result:' + result);
        console.log('result:' + result);
        return result;

    }

    evaluate(string) {

        const msg = "Evaluating Expresion'" + string + "'";
        console.log(msg);
        logger.log('');
        logger.log('');
        logger.log(msg)
        logger.log('--------------------------------------');



        const data = { caseId: 1001, customer: 'Mr. Hanna' };
        const expr = Expression.compile(string);

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
            result =REGEX.exec(string)
            if (result) {
                let msg = '@' + result.index + " ";
                let g = 0;
                result.forEach(entry => {
                    if (entry && g > 0) {
                        msg += ' g#:' + g + Token.groups[g - 1] + " " + entry;
                        const token= new Token();
                        token.index = result.index;
                        token.group = Token.groups[g - 1];
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
                        (prevEntry.entry == '<' || prevEntry.entry == '>' || prevEntry.entry=='=' )) {
                //   ignore , and merge next number to previous
                prevEntry.entry += sep.entry;
            }
            //  5.  -number should be one token     like -20
            else if (prevEntry && sep.group == 'number' && prevEntry.entry == '-') {
                //   ignore , and merge next number to previous
                prevEntry.entry += sep.entry;
            }
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

