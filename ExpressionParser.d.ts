import { ExpressionNode } from './ExpressionNode';
export declare class Token {
    static groups: string[];
    index: any;
    group: any;
    entry: any;
    bracketEndToken: any;
    isOperator(): boolean;
    isLiteral(): void;
}
export declare class Parser {
    compile(string: any, forCondtion: any): ExpressionNode;
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
      * 5.  -number should be one token     like -20 NNOO
      * 6.  mark
      *
      * @param seps
      */
    preParse(seps: any): any[];
}
