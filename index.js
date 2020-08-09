"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Execute = exports.WebService = void 0;
const DecisionTable_1 = require("./DecisionTable");
__exportStar(require("./common"), exports);
__exportStar(require("./DecisionTable"), exports);
__exportStar(require("./ExpressionNode"), exports);
__exportStar(require("./RulesDelegate"), exports);
function WebService(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(request);
        console.log(response);
        let { definition, data, options, loadFrom } = request.body;
        response.json(Execute(request.body));
    });
}
exports.WebService = WebService;
function Execute({ definition, data, options, loadFrom }) {
    console.log(definition);
    console.log(data);
    console.log(options);
    console.log(loadFrom);
    const dt = new DecisionTable_1.DecisionTable(definition);
    const res = dt.evaluate(data);
    return res;
}
exports.Execute = Execute;
//# sourceMappingURL=index.js.map