"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conn = () => {
    try {
        mongoose_1.default.connect(`${process.env.DATABASE_URL}`, {
            dbName: "Conversia"
        }).then(() => {
            console.log("Database is connected");
        });
    }
    catch (e) {
        console.log(`${e}, Database is not connected`);
    }
};
exports.conn = conn;
//# sourceMappingURL=conn.js.map