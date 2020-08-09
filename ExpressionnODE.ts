import { debug, logger, EXPRESSION_TYPE, Options } from './common';
import {  Parser } from './ExpressionParser';
import { Executor } from './Executor';


export class Expression {
    script;
    rootNode: ExpressionNode;
    constructor(script) {
        this.script = script;
    }
    get isCondition(): Boolean { return false; }

    static compile(script,variableName=''): Expression {
        const inst = new Expression(script);
        inst.compile();
        return inst;
    }
    static load(json): Expression {
        const inst = new Expression(json);
        return inst;

    }
    compile() {
        const parser = new Parser();
        this.rootNode = parser.compile(this.script, this.isCondition);
    }
    getState() {
        return this;
    }
    display() {
        this.rootNode.displayExpression();
    }
    evaluate(data) {
        const executor = new Executor(data);
        if (!this.rootNode)
            this.compile();
        return executor.evaluateCondition(this.rootNode,  null, false);
    }
}
export class Condition extends Expression {
    get isCondition(): Boolean { return true; }
    variableName;

    constructor(script, variableName) {
        super(script);
        this.variableName = variableName;
    }
    static compile(script,variableName): Condition {
        const inst = new Condition(script,variableName);
        const parser = new Parser();
        inst.rootNode = parser.compile(script, true);
        return inst;
    }
    evaluate(data) {
        const executor = new Executor(data);
        if (!this.rootNode)
            this.compile();
        const value = data[this.variableName];
        return executor.evaluateCondition(this.rootNode, value, true);
    }
}
export class TreeNode {
    parent;
    children;
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
            return this.parent.children[index + 1]
        else
            return null;
    }
    previous(withinParent = false) {
        if (!this.parent)
            return null;
        let index = this.parent.children.indexOf(this);
        if (index >= 1 && index <= this.parent.children.length - 1)
            return this.parent.children[index - 1]
        else
            return null;

    }
    loop(funct, level = 0) {
        funct(this, level);
        this.children.forEach(child => {
            if (child.parent !== this)
                console.log("ERROR parent is wrong" + child.parent)
            child.loop(funct,level + 1);
        });
    }
    loopUp(funct, level = 0) {
        let i;
        for (i = this.children.length - 1; i >= 0; i--) {
            let child = this.children[i];
            if (child.parent !== this)
                console.log("ERROR parent is wrong" + child.parent)
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

function removeFromArray(array, item) {
    const index = array.indexOf(item, 0);
    if (index > -1) {
        array.splice(index, 1);
    }
}

export class ExpressionNode extends TreeNode {
    type: EXPRESSION_TYPE;
    value;
    result;
    position;
    id;

    static id = 0;
    constructor(type, parent, value, position) {
        super(parent);
        this.type = type;
        this.parent = parent;
        this.value = value;
        this.position = position;
        this.id = ExpressionNode.id++;
    }
    static NewFromToken(token, parent, type = null): ExpressionNode {
        if (!token)
            return null;
        if (!type)
            type = ExpressionNode.calcTypeFromToken(token);
        return new ExpressionNode(type, parent, token.entry, token.index);
    }
    getState() {
        const children=[];
        this.children.forEach(child => { children.push(child.getState());});
        return { type: this.type, value: this.value, children };
    }
    displayExpression(level = 0) {

        if (!Options.debugExpression)
            return;
        this.loop(function (expr, level) {
            let res = (expr.result ? `result=<${expr.result}>   ` : '');
            const msg = level + '-'.repeat(level + 1) + ">" + expr.type + " " + expr.value + "   " + res + 'id:'+expr.id;
            debug('expression', msg);
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
            return EXPRESSION_TYPE.Number;
        else if (token.group == 'literal' || (!isNaN(token.entry)))
            return EXPRESSION_TYPE.Literal;
        else if (token.group == 'alpha' && (token.entry == 'and' || token.entry == 'or' || token.entry == 'not'))
            return EXPRESSION_TYPE.Binary;
        else if (token.group == 'alpha')
            return EXPRESSION_TYPE.Text;
        else if (token.group == 'symbol')
            return EXPRESSION_TYPE.Operator;

    }
    /*
     * 
     * handles:
     *      and/or/not
     *      ()
     *      
     *      returns a single expression of types:
     *                  expression
     *                  and-expression
     *                  or-expression
     *                  not-expression
     *                  paran-expression        ()
     *                  value-expression        comma delimited
     *                  
     *     format:  x and y
     *          and-expression
     *              expression    x
     *              expression    y
     * todo:    
     *      format: x and ( y or z )
     *          and-expression
     *              expression    x
     *              bracket-expression
     *                  expression    y
     *                  expression    z
     *
     *      format: ( a,b,c)
     *          bracket-expression
     *              value-expression    a
     *              value-expression    b
     *              value-expression    c

     *      format: fun ( a,b,c)
     *          expression  fun
     *              bracket-expression
     *                  value-expression    a
     *                  value-expression    b
     *                  value-expression    c
     *
     *
     *      format: x + y
     *          operation-expression    +
     *              value-expression    x
     *              value-expression    y
     */

}
