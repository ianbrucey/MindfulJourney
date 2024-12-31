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

// New function for focus motivation chat
export async function getFocusMotivation(
  message: string,
  context: {
    currentTask: string;
    sessionDuration: number;
    elapsedTime: number;
    previousMessages: Array<{ role: string; content: string }>;
  }
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI focus coach specializing in deep work and productivity. 
          Your role is to provide motivation, guidance, and practical advice to help users stay focused and productive.
          Consider the user's current task, session duration, and progress when giving advice.
          Be concise, encouraging, and practical. Aim to boost motivation while providing actionable tips.
          Maintain a supportive and professional tone.`,
        },
        ...context.previousMessages,
        {
          role: "user",
          content: `Current Task: ${context.currentTask}
Session Duration: ${context.sessionDuration} minutes
Time Elapsed: ${Math.floor(context.elapsedTime / 60)} minutes
          
${message}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content?.trim() ||
      "Stay focused and take one step at a time. You're making progress!";
  } catch (error) {
    console.error("Error getting focus motivation:", error);
    return "Stay focused and take one step at a time. You're making progress!";
  }
}

export async function analyzeEmotionalIntelligence(
  content: string,
  previousEntries: Array<{ content: string; createdAt: string }> = []
): Promise<{
  emotionalPatterns: Array<{
    emotion: string;
    frequency: number;
    triggers: string[];
  }>;
  insights: {
    strengths: string[];
    growthAreas: string[];
    recommendations: string[];
  };
  coaching: {
    observation: string;
    guidance: string;
    exercises: Array<{
      name: string;
      description: string;
      duration: string;
      benefit: string;
    }>;
  };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert emotional intelligence coach with deep expertise in psychology and mindfulness.
          Analyze the user's journal entries to identify emotional patterns, provide insights, and offer personalized coaching.
          Focus on emotional awareness, regulation, and growth.
          Consider both the current entry and previous entries to identify patterns over time.
          Provide actionable guidance and specific exercises for emotional development.`,
        },
        {
          role: "user",
          content: `Current Entry: ${content}
Previous Entries: ${previousEntries.map(entry =>
            `[${entry.createdAt}] ${entry.content}`).join('\n')}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    return {
      emotionalPatterns: result.emotionalPatterns || [],
      insights: {
        strengths: result.insights?.strengths || [],
        growthAreas: result.insights?.growthAreas || [],
        recommendations: result.insights?.recommendations || [],
      },
      coaching: {
        observation: result.coaching?.observation || "Unable to provide observation",
        guidance: result.coaching?.guidance || "Unable to provide guidance",
        exercises: result.coaching?.exercises || [],
      },
    };
  } catch (error) {
    console.error("Error analyzing emotional intelligence:", error);
    return {
      emotionalPatterns: [],
      insights: {
        strengths: [],
        growthAreas: [],
        recommendations: [],
      },
      coaching: {
        observation: "Unable to analyze at this time",
        guidance: "Please try again later",
        exercises: [],
      },
    };
  }
}