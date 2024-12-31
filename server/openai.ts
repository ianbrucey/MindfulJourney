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

    return response.choices[0]?.message?.content?.trim() || "I am worthy of peace and happiness.";
  } catch (error) {
    console.error("Error generating affirmation:", error);
    return "I am worthy of peace and happiness.";
  }
}

export async function generateDailyChallenge(recentEntries: any[], activeGoals: any[]): Promise<{
  challenge: string;
  category: string;
  difficulty: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a wellness coach creating personalized daily challenges.
          Based on the user's recent journal entries and active goals, generate an engaging and achievable daily wellness challenge.
          The challenge should be specific, measurable, and aligned with their current mindset and goals.
          Respond with JSON containing:
          - challenge: clear instructions for the challenge
          - category: one of [meditation, exercise, mindfulness, gratitude, creativity, social]
          - difficulty: one of [easy, medium, hard]`,
        },
        {
          role: "user",
          content: JSON.stringify({
            recentEntries,
            activeGoals,
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    return {
      challenge: result.challenge || "Practice mindful breathing for 5 minutes",
      category: result.category || "mindfulness",
      difficulty: result.difficulty || "easy",
    };
  } catch (error) {
    console.error("Error generating daily challenge:", error);
    return {
      challenge: "Practice mindful breathing for 5 minutes",
      category: "mindfulness",
      difficulty: "easy",
    };
  }
}

export async function analyzeSentiment(content: string): Promise<{
  sentiment: {
    score: number;
    label: string;
  };
  themes: string[];
  insights: string;
  recommendations: Array<{
    activity: string;
    reason: string;
    duration: string;
    benefit: string;
  }>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an empathetic AI therapist analyzing journal entries. 
          Analyze the sentiment, emotional themes, provide personalized insights, and suggest self-care activities.
          Respond with a JSON object containing:
          - sentiment: { score (1-5, where 1 is very negative and 5 is very positive), label (descriptive word) }
          - themes: array of emotional themes present
          - insights: a brief, personalized insight about the entry
          - recommendations: array of recommended self-care activities, each containing:
            - activity: specific activity name
            - reason: why this activity would be helpful based on the entry
            - duration: suggested time commitment (e.g. "5 minutes", "30 minutes")
            - benefit: expected benefit from doing this activity`,
        },
        {
          role: "user",
          content,
        },
      ],
      response_format: { type: "json_object" },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response content received from OpenAI");
    }

    const analysis = JSON.parse(messageContent);

    return {
      sentiment: {
        score: Math.max(1, Math.min(5, analysis.sentiment?.score ?? 3)),
        label: analysis.sentiment?.label ?? "neutral",
      },
      themes: analysis.themes ?? [],
      insights: analysis.insights ?? "Unable to analyze the entry at this time.",
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: { score: 3, label: "neutral" },
      themes: [],
      insights: "Unable to analyze the entry at this time.",
      recommendations: [],
    };
  }
}