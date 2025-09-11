"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
//Create new agent
router.post("/new", (req, res) => {
    const data = req.body;
    console.log(data);
});
//get all agents based on user id
router.get("/:agnetId", (req, res) => {
});
exports.default = router;
//# sourceMappingURL=agents.js.map