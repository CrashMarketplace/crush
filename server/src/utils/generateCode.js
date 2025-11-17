"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNumbericCode = generateNumbericCode;
function generateNumbericCode(len = 6) {
    let s = "";
    for (let i = 0; i < len; i++)
        s += Math.floor(Math.random() * 10);
    return s;
}
