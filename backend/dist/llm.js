"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReply = generateReply;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
async function generateReply(message) {
    const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: message }],
    });
    return completion.choices[0].message.content || "No response.";
}
