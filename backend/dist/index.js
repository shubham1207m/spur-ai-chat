"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const db_1 = require("./db");
const llm_1 = require("./llm");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const chatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1),
    sessionId: zod_1.z.string().optional(),
});
app.post("/chat/message", async (req, res) => {
    try {
        const { message, sessionId } = chatSchema.parse(req.body);
        const conversation = sessionId
            ? await db_1.prisma.conversation.findUnique({ where: { id: sessionId } })
            : await db_1.prisma.conversation.create({ data: {} });
        if (!conversation) {
            return res.status(400).json({ error: "Invalid session" });
        }
        await db_1.prisma.message.create({
            data: {
                text: message,
                sender: "user",
                conversationId: conversation.id,
            },
        });
        // Dummy reply for now
        const reply = await (0, llm_1.generateReply)(message);
        await db_1.prisma.message.create({
            data: {
                text: reply,
                sender: "ai",
                conversationId: conversation.id,
            },
        });
        res.json({ reply, sessionId: conversation.id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err?.message || String(err),
        });
    }
});
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
