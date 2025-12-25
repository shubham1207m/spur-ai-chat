import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { prisma } from "./db";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

app.post("/chat/message", async (req, res) => {
  try {
    const { message, sessionId } = chatSchema.parse(req.body);

    const conversation = sessionId
      ? await prisma.conversation.findUnique({ where: { id: sessionId } })
      : await prisma.conversation.create({ data: {} });

    if (!conversation) {
      return res.status(400).json({ error: "Invalid session" });
    }

    await prisma.message.create({
      data: {
        text: message,
        sender: "user",
        conversationId: conversation.id,
      },
    });

    // Dummy reply for now
    const reply = "Thanks! Your message has been received.";

    await prisma.message.create({
      data: {
        text: reply,
        sender: "ai",
        conversationId: conversation.id,
      },
    });

    res.json({ reply, sessionId: conversation.id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});

