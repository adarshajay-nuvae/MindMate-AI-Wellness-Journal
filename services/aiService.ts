import type { Analysis } from '../types';

const API_URL = 'https://aiapi-production-b62b.up.railway.app/query/';

export const analyzeEntry = async (text: string): Promise<Analysis> => {
  const prompt = `
    Analyze the following journal entry from a user. Based on the text, provide:
    1. 'mood': A concise, empathetic label for the user's emotional state (e.g., "Anxious but hopeful", "Reflectively calm", "Feeling overwhelmed").
    2. 'summary': A single, empathetic sentence that summarizes the key events or feelings in the entry.
    3. 'tip': A gentle, actionable piece of advice or a wellness tip related to the mood.
    4. 'reflectionPrompt': A single, meaningful and open-ended journaling question for the user to consider for their next entry, based on the themes in this entry.
    5. 'cognitiveDistortions': An array of any cognitive distortions found in the text. Common distortions include: Catastrophizing, All-or-Nothing Thinking, Overgeneralization, Mind Reading, and Personalization. For each distortion found, provide an object with 'name', 'explanation' (a brief definition), and 'example' (a direct quote from the user's text that demonstrates it). If no distortions are found, return an empty array [].

    Please return ONLY a valid JSON object with the keys "mood", "summary", "tip", "reflectionPrompt", and "cognitiveDistortions". Do not include any other text, greetings, or explanations.

    Journal Entry:
    ---
    ${text}
    ---
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // The API might return the JSON string inside markdown code blocks or with extra text.
    // This regex is more robust in extracting the JSON object.
    const jsonMatch = data.answer.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object found in the AI response.');
    }
    
    const jsonString = jsonMatch[0];
    const analysisResult: Analysis = JSON.parse(jsonString);

    if (
      !analysisResult.mood || 
      !analysisResult.summary || 
      !analysisResult.tip || 
      !analysisResult.reflectionPrompt ||
      !Array.isArray(analysisResult.cognitiveDistortions)
    ) {
      throw new Error('Invalid analysis format received from AI.');
    }

    return analysisResult;
  } catch (error) {
    console.error("Error analyzing entry:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to get analysis from AI. ${errorMessage}`);
  }
};