
import { logger, debug, TOKEN_GROUP, EXPRESSION_TYPE, Options } from './common';

import { Parser } from './ExpressionParser';
import { Expression, Condition } from './ExpressionNode';
import { ExecutionContext } from './Implementor';

const fs = require('fs');

Options.debugExecution = true;
Options.debugExpression = true;
var logs = [];
function log(msg) {
    logs.push(msg);
}
/*--commnent
--syntax as follows:

.Command
    ..expression
    ..mask
    ..diff or blank
        ..new mask or blank
            ..#Tree 
...t1 *
..Tree Error or blank
    ..#Test *
...[value, output, expected]
...Error or blank

#NewText#
    < expression >
    <mask>
>> diff	or blank
    >> output mask or blank
##Tree Input, output if blank
t1
t2
t3..
##Tree Output 
##Values


--commnent
-- syntax as follows:
--
--.Command
--..expression
--..mask
--..diff or blank
--..new mask or blank
--..#Tree
--...t1*
--..Tree Error or blank
--..#Test*
--...[value,output,expected]
--...Error or blank
--
--#NewText#
--<expression>
--<mask>
-->>diff	or blank
-->>output mask or blank
--##Tree Input , output if blank
--t1
--t2
--t3..
--##Tree Output
--##Values



*/

var command= {
    expr: ``,
    mask: ``,
    maskDiff: ``,
    newMask: ``,
    tree: { },
    newTree: { },
    tests: {
    }
}
class Command {
    type;
    expr;
    mask;
    newMask;
    maskDiff;
    tree=[];
    newTree=[];
    tests = [];
    errors = [];
    comments;
}
class CommandTest {
    inputValue;
    outputValue;
    expectedResult;
    error;
}

function processScenario(cmds) {

    cmds.forEach(cmd => {

        try {

            console.log('----' + cmd.type, cmd.expr);
            let expr;
            if (cmd.type == 'Condition') {
                expr = Condition.compile(cmd.expr,'value');

            }
            else
                expr = Expression.compile(cmd.expr);


            cmd.newMask = getTokensMask(cmd.expr);
            cmd.maskDiff = '';

            let i = 0;
            if (!cmd.mask || cmd.mask.length==0)
                cmd.mask = cmd.newMask;

            if (cmd.mask != cmd.newMask) {
                for (i = 0; i < cmd.newMask.length; i++) {
                    if (cmd.mask[i] == cmd.newMask[i])
                        cmd.maskDiff += ' ';
                    else
                        cmd.maskDiff += 'X';
                }
            }

            log(cmd.type + ':"' + cmd.expr + '"' + (cmd.maskDiff==''?'':' Masks are different'));

            cmd.tests.forEach(test => {
                if (cmd.type == 'Condition') {
                    let params = test.split(',');
                    if (params.length > 1) {
                        console.log('Condition', cmd.expr, params);
                        let msg = testCond(expr, trimParam(params[0]), trimParam(params[1]));
                        if (msg != '')
                            cmd.errors.push(msg);

                        log('   vs: ' + trimParam(params[0]) + ' ' + (msg==''?'passed':'Failed'));

                    }
                }
                if (cmd.type == 'Expression') {
                    let params = test.split(',');
                    if (params.length > 0) {
                        console.log('Expr:', cmd.expr, params);
                        let msg = testExp(expr, trimParam(params[0]));
                        if (msg != '')
                            cmd.errors.push(msg);

                        log('   vs: ' + trimParam(params[0]) + ' ' + (msg == '' ? 'passed' : 'Failed'));

                    }
                }
            });

            getTree(cmd,expr);

            if (cmd.tree.length == 0) {
                cmd.tree = cmd.newTree;
                cmd.newTree = [];
            }
            else {
                const old = cmd.tree.join();
                const rev = cmd.newTree.join();
/*                console.log('oldTree:' + old);
                console.log("revTree:" + rev); */
                if (old != rev) {
                    ; //console.log(old, rev);
                }
                else
                    cmd.newTree = [];
            }

            if (cmd.errors.length > 0) {
                errorCmds.push(cmd);
            }
        }
        catch (exc) {
            console.log("Tester catch "+ typeof exc);
            console.log(exc);
            log("***Error***: "+(<Error>exc).message);
            cmd.errors.push(<Error>exc.message);

        }
    });

}
function trimParam(param) {
    if (param.startsWith('"') && param.endsWith('"')) 
        return param.substring(1, param.length - 1);
    if (param.startsWith("'") && param.endsWith("'"))
        return param.substring(1, param.length - 1);
    else
        return param.trim();
}
function getTree(cmd, expr) {
    console.log("TREE ----------------");
    displayExpression(cmd,expr.rootNode);
    paintExpression(cmd, expr.rootNode);
}
function displayExpression(cmd,expr,level=0) {

    expr.loop(function (expr, level) {
        let msg = '';
        let res = (expr.result ? `result=<${expr.result}>   ` : '');
        msg = level + '-'.repeat(level + 1) + ">" + expr.type;
        msg += ' '.repeat(20 - msg.length);
        msg += " #" + expr.id;
        msg += ' '.repeat(25 - msg.length);
        msg += " " + expr.value;
        msg += ' '.repeat(60 - msg.length);
        msg += res;
        cmd.newTree.push(msg);
        console.log(msg);
    }, level);
}
function paintExpression(cmd, expr, level = 0) {
    return;
    const nodes = new Map();
    let maxLevel = 0;
    let maxWidth = 0;
    let x = 50;
    let d = 3;
    expr.loop(function (expr, level) {
        if (level > maxLevel)
            maxLevel = level;

    }, level);
    expr.loop(function (expr, level) {
        let msg = '';
        msg += ' '.repeat(x);
        msg += expr.id;
//        msg += " " + expr.value;
        console.log(msg);
    }, level);
}

function writeScenario(fileName,cmds) {
    const lines = [];
    let line;


    cmds.forEach(cmd => {

        cmd.comments.forEach(comment => {
            lines.push(comment);
        });
        lines.push('$' + cmd.type);
        lines.push(cmd.expr);

        lines.push('$Tests');
        cmd.tests.forEach(test => {
            lines.push(test);
        });

        lines.push('$mask');
        lines.push(cmd.mask);
        if (cmd.maskDiff && cmd.maskDiff!='') {
            lines.push('$maskDiff');
            lines.push(cmd.maskDiff);
            lines.push('$newMask');
            lines.push(cmd.newMask);
        }
        lines.push('$Tree');
        cmd.tree.forEach(tline => {
            lines.push(tline);});

        if (cmd.newTree && cmd.newTree.length > 0) {
            lines.push('$RevisedTree');
            cmd.newTree.forEach(tline => {
                lines.push(tline);
            });
        }
        if (cmd.errors && cmd.errors.length > 0) {
            lines.push('$Errors');
            cmd.errors.forEach(error => {
                lines.push(error);
            });
        }


    });


    const contents = lines.join("\r\n");
//    console.log(contents);
    fs.writeFile(fileName, contents, function (err) {    });
}
function getScenario(fileName) {

    let contents = fs.readFileSync(fileName,
        { encoding: 'utf8', flag: 'r' });

    var lines = contents.split(/\r?\n/g); 
    var l = 0;
    let command = '';
    let mode = '';
    let till = 0;
    let cmd:Command;
    let seq;
    let cmds = [];
    let comments=[];
    lines.forEach(line => {
//        console.log(l + '>' + line);
        const start = line.substr(0, 1);
        if (start == '//' || line.length==0) {
            comments.push(line);
        }
        else {

        if (start == '$') {
            command = line.substr(1);
//            console.log("  Command: " + command);
            seq = 0;
            switch (command) {
                case 'Condition':
                case 'Expression':
                    till = l + 4;
                    mode = 'expr';
                    cmd = new Command();
                    cmd.type = command;
                    console.log(comments);
                    cmd.comments = comments;
                    comments = [];
                    cmds.push(cmd);
                    break;
                default:
                    mode = command;
                    break;
            }
        }
        else {
            switch (mode) {
                case 'expr':
                    cmd.expr = line;
                    break;
                case 'mask':
                    cmd.mask = line;
                    break;
                case 'Tree':
                case 'tree':
                    cmd.tree.push(line);
                    break;
                case 'tests':
                case 'Tests':
                     cmd.tests.push(line);
                    break;
            }
            }
        }
        l++;  
        seq++;
    });
//    console.log(cmds);
    return cmds;
}


function testCond(expr: Expression, value, res) {

//    const engine = new ExpressionEngine();
//    const ret = engine.evaluateCondition(expr, value);


    const data = {value:value,
        caseId: 1001, customer: 'Mr. Hanna', contact: { name: 'John', id: 500 , credits: [1,2,3] } };

    const ret = expr.evaluate(data);

    expr.display();
    console.log('result:' + ret);

    let msg = '';
    if ((typeof ret === "boolean") && res== 'true' && ret) {
        return msg;
    }
    else if (typeof ret === "boolean" && res== 'false' && !ret) {
        return msg;
    }
    else if (ret != res) {
        msg = "***Error -" + expr.script + " for " + value + " result: " + ret + " expecting:<" + res +">";
        console.log(msg);
        logger.log(msg);

    }
    return msg;
}
function testExp(expr: Expression,  res) {

    console.log('expecting: '+res);
    logger.log('expecting: ' + res);

    const data = {
        caseId: 1001, customer: 'Mr. Hanna', contact: { name: 'John', id: 500, credits: [1, 2, 3] }
    };

    const ret= expr.evaluate(data);

    expr.display();
    console.log('result:' + ret);



    let msg = '';
    if ((typeof ret === "boolean") && res == 'true' && ret) {
        return msg;
    }
    else if (typeof ret === "boolean" && res == 'false' && !ret) {
        return msg;
    }
    else if (ret != res) {
        //        parser.evaluateCondition(expr, value);
        msg = "***Error -" + expr.script + " result: " + ret + " expecting:" + res;
        console.log(msg);
        logger.log(msg);
        //        throw Error("Error -" + expr + " failed for " + value);

    }
    return msg;
}
//    static groups = ['number', 'alpha', 'space', 'symbol'];

function getTokensMask(expr) {
    let tokens = Parser.tokenize(expr);
    let mask = '';
    tokens.forEach(token => {
        let groupCode = getTokenGroupCode(token);
        mask += groupCode.repeat(token.entry.length);
    });
    console.log('--------------');
    console.log(expr);
    console.log(mask);
    return mask;
}
function getTokenGroupCode(token) {
    
        let groupCode = '';
        switch (token.group) {
            case 'alpha':
                groupCode = 'a';
                break;
            case 'symbol':
                groupCode = '#';
                break;
            case 'number':
                groupCode = 'N';
                break;
            case 'space':
                groupCode = ' ';
                break;

        }
    return groupCode;
}

function runTest(list,category='') {
    console.log(list);


        list.forEach(item => {
            const cat = item.category;
            console.log("Running " + cat.name);
            if (cat.expressions) {
                cat.expressions.forEach(expr => {
                    console.log(expr);
                    try {
                    testExp(expr[0], expr[1]);
                    }
                    catch (exc) {
                        console.log(exc);
                        logger.log(exc.message);
                    }
                });
            }
            if (cat.conditions) {
                cat.conditions.forEach(expr => {
                    console.log(expr);
                    try {
                        testCond(expr[0], expr[1],expr[2]);
                    }
                    catch (exc) {
                        console.log(exc);
                        logger.log(exc.message);
                    }
                });
            }

        });

}



var errorCmds = [];
main();
function main() {
    console.log(ExecutionContext);

    console.log(process.argv);
    var args = process.argv;
    if (args.length > 4) {
        console.log('testing condition ' + args[2], args[3], args[4]);
        // testCond(args[2], args[3], args[4]);
    }
    else if (args.length > 3) {
        console.log('testing expression' + args[2], args[3]);
        // testExp(args[2], args[3]);
    }


    const fileName = args[2];

    console.log("running " + fileName);

    let cmds = getScenario(fileName);
    processScenario(cmds);
    writeScenario(fileName, cmds);

    logs.forEach(msg => {
        console.log(msg);
    });

    fs.writeFile(fileName+'.json', JSON.stringify(cmds,null,2), function (err) { });
    console.log(cmds.length + " tests conducted ");
    if (errorCmds.length > 0) {

        writeScenario(fileName + ".errors", errorCmds);
        console.log(errorCmds.length+" errors written to " + fileName + "errors");
    }


}
