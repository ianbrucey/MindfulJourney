import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAffirmation(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a mindfulness coach creating daily affirmations. Generate a single, powerful, and uplifting affirmation that encourages self-reflection and personal growth. The affirmation should be concise (1-2 sentences) and in the present tense. Focus on themes of gratitude, self-acceptance, or personal growth.",
        },
        {
          role: "user",
          content: "Generate an affirmation for today.",
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    return response.choices[0].message.content?.trim() || "I am worthy of peace and happiness.";
  } catch (error) {
    console.error("Error generating affirmation:", error);
    return "I am worthy of peace and happiness.";
  }
}
