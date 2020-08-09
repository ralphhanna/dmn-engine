import { Expression } from './ExpressionNode';
export declare class ExpressionEngine {
    evaluateCondition(string: any, value: any): any;
    evaluate(string: any): {
        result: any;
        expression: Expression;
    };
    static tokenize(string: any): any[];
    /**
     * 1,   handles function calls  looking for bracket after text
     * 2.   special sytax for condition:
     *          > 30 days
     *
     * @param expr
     */
    postParse(expr: any): void;
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
    preParse(seps: any): any[];
}
