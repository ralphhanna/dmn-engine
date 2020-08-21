const feel = require('js-feel/dist/feel');


const FEEL = feel;

export class Expression {
    script;
    ast; // ExpressionNode;
    constructor(script) {
        this.script = script;
    }
    get isCondition(): Boolean { return false; }

    static load(json): Expression {
        const inst = new Expression(json);
        return inst;

    }
    async compile() {

        this.ast = await parse(this.script);
      
        // this.ast = parser.compile(this.script, this.isCondition);
    }
    getState() {
        return this;
    }
    display() {
        // this.rootNode.displayExpression();
    }
    async evaluate(data) {
        if (!this.ast)
            await this.compile();
        if (this.ast) {
            const result = await this.ast.build(data);
            return result;
        }
        return null;
        // const executor = new Executor(data);
        //return executor.evaluateCondition(this.rootNode, null, false);
    }
}
async function parse(script, options = {}) {

    try {
        const ast = await FEEL.parse(script, options);
        return ast;
    }
    catch (exc) {
        console.log("Error in parsing " + script);
        console.log(exc.message);
        return null;
    }

}
export class Condition extends Expression {
    get isCondition(): Boolean { return true; }
    variableName;

    constructor(script, variableName) {
        super(script);
        this.variableName = variableName;
    }
    async compile() {

         this.ast = await parse(this.script, { startRule: 'SimpleUnaryTests' });
        // this.ast = parser.compile(this.script, this.isCondition);
    }
    /*
    const condition = await feel.parse(conditionScript, { startRule: 'SimpleUnaryTests' });
    const funct = await condition.build(context, {}, 'input');
    const out = funct(inputValue);
    */
    async evaluate(data) {

        let value, funct, out;
        if (!this.ast)
            await this.compile();

        if (!this.ast)
            return null;

        try {
            funct = await this.ast.build(data, {}, 'input');
            value = getValue(data[this.variableName]);
            out = funct(value);
            return out;
        }
        catch (exc) {
            console.log(`Error in evaluating '${this.script}' for value: '${value}'`);
            console.log(`--- generated function  '${funct.toString()}'`);
            console.log(data);
            console.log(exc.message);
            return out;
        }
        //return executor.evaluateCondition(this.rootNode, value, true);
    }
}
function getValue(value) {
    let val = parseFloat(value);
    if (!isNaN(val))
        return val;
    else
        return value;
}