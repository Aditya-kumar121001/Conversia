"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
router.post("/chat/:domain", (req, res) => {
    //parse the user input
    const { message } = req.body;
    //make query to embedding 
    //reterive search results
    //make model call
    //return results to the widget
    res.status(200).json({
        success: true,
        message: "Done"
    });
});
exports.default = router;
//# sourceMappingURL=execution.js.map