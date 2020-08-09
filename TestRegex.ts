
import { logger, debug, TOKEN_GROUP, EXPRESSION_TYPE, Options } from './common';

import { Parser } from './ExpressionParser';
import { ExpressionEngine } from './ExpressionEngine';

testRegex();
function testRegex() {

var regex;
//regex = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|(\s)/g;
regex = /([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|([^A-Za-z])|(\s)/g;
//regex = "([a-zA-Z0-9\u0080-\u00FF\.]+)|([0-9\.]+)|(,|!|\?|\)|\(|\"|\'|<|=|>|\+|-|\*|\/)|([^A-Za-z])|(\s)";

//1  N:  number
//4  #   symbol
//2  S
var string1 = `(1>$obj.v_1)  and -20.5 2+3-1 funt(v1,303)StartsWith "abc-_ 12$@!3z"`;
var matchg1 = `#N##SSSSSSS#  SSS #NNNN N#N#N SSSS#SS#NNN#SSSSSSSSSS #SSS#S NN###NS#`;
var string2 = `(1>$obj.v_1) and -20.5 2+3-1 funt(v1,303)StartsWith "abc-_ 12$@!3z"`;
var string = `$v1 &`;
console.log(regex);

//var group1 = `[0-9\.]+|-[0-9\.]+`;
var group1 = `[0-9\.]+`;
var group2 = `[a-zA-Z0-9\u0080-\u00FF\.\_]+`;
var group3 = `[,|!|\?|\)|\(|\"|\'|<|=|>|\+|\-|\*|\/]`;
var group4 = "\\s";
var group5 = `[^A-Za-z]`;

let re = '';
[group1, group2, group4 , group5].forEach(gr => {
    if (re == '')
        re = '('+gr +')';
    else
        re += '|(' + gr + ')';
});

console.log(re);
let seps = testRegexExp(re, string1);

    checkResults(string1, seps, matchg1);
}
function checkResults(string, seps, matching) {

    seps.forEach(sep => {
        let p = sep.index;
        let l = sep.entry.length;
        let text = string.substring(p, p + l);
        let code = matching.substring(p, p + l);
        let groups = '0NS #';
        let groupCode = groups[sep.g];
        if (sep.entry != text)
            console.log("Error-Text--- " + sep.entry + " vs " + text + " " + p);
        if (groupCode.repeat(l) != code)
            console.log("Error-Code--- " + code + " vs " + groupCode + " " + p + ":"+ text);
    });
}


function testRegexExp(regex, string) {

    let re = new RegExp(regex,"gi");
    console.log(regex);
    console.log("-------------------------------------");
    console.log(string);
    console.log("-------------------------------------");
    var result = null;
    var seps = [];
    do {
        result = re.exec(string)
        if (result) {
            var msg= '@' + result.index + " ";
            //console.log(result);
            let g = 0;
            result.forEach(entry => {
                if (entry && g>0) {
                    msg += entry + ' g#:' + g;
                    seps.push({index:result.index, entry, g});
                }
                g++;
            })
            console.log(msg);

            //            console.log(msg);

        }
    } while (result != null)
    console.log(string.length);
    return seps;
}

