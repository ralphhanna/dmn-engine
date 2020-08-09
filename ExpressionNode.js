"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionNode = exports.TreeNode = exports.Condition = exports.Expression = void 0;
const common_1 = require("./common");
const ExpressionParser_1 = require("./ExpressionParser");
const Executor_1 = require("./Executor");
class Expression {
    constructor(script) {
        this.script = script;
    }
    get isCondition() { return false; }
    static compile(script, variableName = '') {
        const inst = new Expression(script);
        inst.compile();
        return inst;
    }
    static load(json) {
        const inst = new Expression(json);
        return inst;
    }
    compile() {
        const parser = new ExpressionParser_1.Parser();
        this.rootNode = parser.compile(this.script, this.isCondition);
    }
    getState() {
        return this;
    }
    display() {
        this.rootNode.displayExpression();
    }
    evaluate(data) {
        const executor = new Executor_1.Executor(data);
        if (!this.rootNode)
            this.compile();
        return executor.evaluateCondition(this.rootNode, null, false);
    }
}
exports.Expression = Expression;
class Condition extends Expression {
    constructor(script, variableName) {
        super(script);
        this.variableName = variableName;
    }
    get isCondition() { return true; }
    static compile(script, variableName) {
        const inst = new Condition(script, variableName);
        const parser = new ExpressionParser_1.Parser();
        inst.rootNode = parser.compile(script, true);
        return inst;
    }
    evaluate(data) {
        const executor = new Executor_1.Executor(data);
        if (!this.rootNode)
            this.compile();
        const value = data[this.variableName];
        return executor.evaluateCondition(this.rootNode, value, true);
    }
}
exports.Condition = Condition;
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
//# sourceMappingURL=ExpressionNode.js.map