"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
router.post("/:domain", (req, res) => {
    const body = req.body;
    console.log(body);
    const reply = "working";
    res.status(200).json({
        message: "DONE",
        "reply": reply
    });
});
exports.default = router;
//# sourceMappingURL=execution.js.map