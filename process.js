"use strict";
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
const configuration_1 = require("../configuration");
const __1 = require("..");
const logger = new __1.Logger({ toConsole: true });
let name = 'ds';
let process;
let needsRepairs = true;
let needsCleaning = true;
let response;
let items;
let item;
let query, query1;
let server;
let instanceId;
load('Buy Used Car');
// importAll();
//importModel('multiStart');
//build();
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        let events = yield findEvents({ "events.subType": 'Timer' });
    });
}
function build() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = new __1.BPMNServer(configuration_1.configuration, logger);
        const mds = server.definitions;
        mds.install();
    });
}
function load(name) {
    return __awaiter(this, void 0, void 0, function* () {
        // called from Execution
        const server = new __1.BPMNServer(configuration_1.configuration, logger);
        const mds = server.definitions;
        const list = yield mds.getList();
        // two objects are needed here:
        //1
        let definition; // this definition holds nodes and flows, fundemental to execution
        let bpmnModelData; // name,source and so one
        definition = yield mds.load(name);
        bpmnModelData = yield mds.loadModel(name);
        let source = yield mds.getSource(name);
        let svg = yield mds.getSVG(name);
        yield mds.save(name, source, svg);
        mds.saveModel(bpmnModelData);
        console.log(bpmnModelData.name);
        //    definition = new Definition(BpmnModelData.name, bpmnModelData.source, logger);
        console.log(definition);
        return definition;
    });
}
function importAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = new __1.BPMNServer(configuration_1.configuration, logger);
        const defs = server.definitions;
        const list = yield defs.getList();
        list.forEach(model => {
            importModel(model);
        });
    });
}
function importModel(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = new __1.BPMNServer(configuration_1.configuration, logger);
        const defs = server.definitions;
        const source = yield defs.getSource(name);
        const svg = yield defs.getSVG(name);
        const mds = server.definitions;
        mds.save(name, source, svg);
    });
}
function findEvents(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = new __1.BPMNServer(configuration_1.configuration, logger);
        const mds = server.definitions;
        const list = yield mds.findEvents(query);
        console.log(list);
        return list;
    });
}
//# sourceMappingURL=process.js.map