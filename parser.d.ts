export declare class Expresion {
    script: any;
    rootNode: any;
    isCondition: any;
    static compile(script: any): Expresion;
    static load(json: any): Expresion;
    display(): void;
    evaluateCondition(context: any, value: any): any;
    evaluate(context: any): any;
}
export declare class Parser {
    type: string;
    compile(string: any): any;
    evaluateCondition(string: any, value: any): any;
    evaluate(string: any): any;
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
