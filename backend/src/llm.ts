import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateReply(message: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",

    messages: [{ role: "user", content: message }],
  });

  return completion.choices[0].message.content || "No response.";
}
