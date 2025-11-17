"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB(uri) {
    await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("MongoDB connected");
}
