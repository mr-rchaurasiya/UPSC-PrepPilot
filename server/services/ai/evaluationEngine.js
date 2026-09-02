import dotenv from 'dotenv';
import { generateWithGemini } from './geminiClient.js';

dotenv.config();

export const evaluateAnswer = async (questionText, answerText) => {
  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'gemini' || process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
        You are an expert UPSC Civil Services examiner. Evaluate the following mains answer.
        
        Question: "${questionText}"
        Answer: "${answerText}"
        
        Evaluate the answer strictly based on:
        1. Introduction (20%) - Did they define terms and set the context?
        2. Body (50%) - Core content arguments, case laws, data points, structural flow.
        3. Conclusion (20%) - Way forward, summary, balanced viewpoint.
        4. Structure/Clarity (10%) - Headings, readability.
        
        Provide the response in strict JSON format. Do NOT wrap it in markdown code blocks. The JSON must have the following keys:
        {
          "score": 6.5,
          "introScore": 7,
          "bodyScore": 6,
          "conclusionScore": 7,
          "structureFeedback": "Detailed feedback on introduction and answer structure.",
          "contentFeedback": "Detailed feedback on body arguments, missing dimensions and data points.",
          "suggestions": [
            "Suggestion 1 to improve content",
            "Suggestion 2 to improve clarity"
          ],
          "strengths": ["Clear definition of core terms", "Good logical flow"],
          "weaknesses": ["Lack of data references", "Weak concluding statement"],
          "missingDimensions": ["Underlining constitutional safety nets", "Mentioning Sarkaria Commission findings"],
          "improvementSuggestions": ["Incorporate committee recommendations", "Draw flowchart maps for presentation"],
          "idealStructure": "Intro: Contextualize Article 356 -> Body: Misuse history & safeguards -> Conclusion: S.R. Bommai case way forward",
          "suggestedExamples": ["Kesavananda Bharati case 1973", "Sarkaria Commission 1988"],
          "suggestedConclusion": "In conclusion, a progressive federal union requires constructive cooperation aligning to the cooperative federalism benchmarks.",
          "estimatedWordCount": 210,
          "modelAnswerOutline": "1. Introduction mapping core constitutional article. 2. Body outlining historical safeguards vs Unitary tendencies. 3. Way forward referencing Bommai guidelines."
        }
      `;

      const text = await generateWithGemini(prompt, { jsonMode: true, timeoutMs: 12000 });
      if (text) {
        let cleanJson = text;
        if (text.includes('```json')) {
          cleanJson = text.split('```json')[1].split('```')[0].trim();
        } else if (text.includes('```')) {
          cleanJson = text.split('```')[1].split('```')[0].trim();
        }

        const report = JSON.parse(cleanJson);
        return report;
      }
    } catch (error) {
      console.warn('Gemini live evaluation failed. Falling back to mock evaluation engine:', error.message);
    }
  } else if ((provider === 'openai' || provider === 'chatgpt') && process.env.OPENAI_API_KEY) {
    try {
      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert UPSC Civil Services examiner. Evaluate the mains answer. Provide the response in strict JSON format. Do NOT wrap it in markdown code blocks. The JSON must have the following keys:
              {
                "score": 6.5,
                "introScore": 7,
                "bodyScore": 6,
                "conclusionScore": 7,
                "structureFeedback": "Detailed feedback on introduction and answer structure.",
                "contentFeedback": "Detailed feedback on body arguments, missing dimensions and data points.",
                "suggestions": ["Suggestion 1", "Suggestion 2"],
                "strengths": ["Strength 1"],
                "weaknesses": ["Weakness 1"],
                "missingDimensions": ["Missing 1"],
                "improvementSuggestions": ["Improve 1"],
                "idealStructure": "Intro: Contextualize -> Body: Details -> Conclusion: Way forward",
                "suggestedExamples": ["Example 1"],
                "suggestedConclusion": "Conclusion text",
                "estimatedWordCount": 200,
                "modelAnswerOutline": "1. Intro, 2. Body, 3. Conclusion"
              }`
            },
            {
              role: 'user',
              content: `Question: "${questionText}"\n\nAnswer: "${answerText}"`
            }
          ],
          response_format: { type: "json_object" }
        })
      });
      const openAiData = await openAiResponse.json();
      if (openAiData.choices && openAiData.choices[0]) {
        const text = openAiData.choices[0].message.content;
        let cleanJson = text.trim();
        if (cleanJson.includes('```json')) {
          cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
        } else if (cleanJson.includes('```')) {
          cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
        }
        return JSON.parse(cleanJson);
      }
    } catch (error) {
      console.warn('OpenAI live evaluation failed. Falling back to mock evaluation engine:', error.message);
    }
  }

  // Fallback Mock Evaluation Engine (High Quality)
  const wordCount = answerText.trim().split(/\s+/).length;
  
  let score = 5.5;
  let introScore = 6;
  let bodyScore = 5;
  let conclusionScore = 6;
  const suggestions = [];

  const hasArticles = /article|amendment|schedule/i.test(answerText);
  const hasCases = /court|judgment|case/i.test(answerText);
  const hasWayForward = /way forward|conclusion|summary/i.test(answerText);

  if (hasArticles) {
    bodyScore += 1.5;
  } else {
    suggestions.push('Reference specific Constitutional Articles or Constitutional Amendments to ground your arguments.');
  }

  if (hasCases) {
    bodyScore += 1.5;
  } else {
    suggestions.push('Mention landmark Supreme Court judgments (e.g. Kesavananda Bharati) relative to the topic.');
  }

  if (hasWayForward) {
    conclusionScore += 2;
  } else {
    suggestions.push('End with a progressive "Way Forward" outlining constructive suggestions or solutions.');
  }

  const weightedScore = (introScore * 0.2) + (bodyScore * 0.5) + (conclusionScore * 0.2) + (6 * 0.1);
  score = parseFloat(weightedScore.toFixed(1));

  return {
    score,
    introScore,
    bodyScore,
    conclusionScore,
    structureFeedback: 'The structure matches general essay standards. Introduction states context. Headings are legible.',
    contentFeedback: 'The response lists core points. Add historical context and Sarkaria Commission guidelines.',
    suggestions: suggestions.length > 0 ? suggestions : ['Include statistical datasets to validate statements.', 'Keep sentences crisp to improve presentation.'],
    strengths: ['Logical presentation flow', 'Legible arguments breakdown'],
    weaknesses: ['Lack of statistical data points', 'Fewer committee recommendations'],
    missingDimensions: ['Constitutional safety safeguards', 'Sarkaria commission report benchmarks'],
    improvementSuggestions: ['Reference NCRWC suggestions', 'Create point-wise list blocks'],
    idealStructure: 'Intro: Define federalism -> Body: Detail federal features vs unitary characters -> Conclusion: Way forward cooperations',
    suggestedExamples: ['Bommai Judgment 1994', 'Finance Commission report datasets'],
    suggestedConclusion: 'A strong federal union requires healthy cooperative mechanisms balancing central governance with state interests.',
    estimatedWordCount: wordCount,
    modelAnswerOutline: '1. Introduction mapping federal definition. 2. Unitary characteristics analysis. 3. Safe checks & Way Forward.'
  };
};
