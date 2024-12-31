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

export async function analyzeSentiment(content: string): Promise<{
  sentiment: {
    score: number;
    label: string;
  };
  themes: string[];
  insights: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an empathetic AI therapist analyzing journal entries. 
          Analyze the sentiment, emotional themes, and provide personalized insights.
          Respond with a JSON object containing:
          - sentiment: { score (1-5, where 1 is very negative and 5 is very positive), label (descriptive word) }
          - themes: array of emotional themes present
          - insights: a brief, personalized insight about the entry`,
        },
        {
          role: "user",
          content,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return {
      sentiment: {
        score: Math.max(1, Math.min(5, analysis.sentiment.score)),
        label: analysis.sentiment.label,
      },
      themes: analysis.themes,
      insights: analysis.insights,
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: { score: 3, label: "neutral" },
      themes: [],
      insights: "Unable to analyze the entry at this time.",
    };
  }
}