// app/api/suggest-titles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface RequestBody {
  trendingTitles: string[];
  videoIdea: string;
  region?: string;
  category?: string;
}

interface TitleSuggestion {
  title: string;
  reasoning: string;
  estimatedEngagement: 'high' | 'medium' | 'low';
}

interface ApiResponse {
  success: boolean;
  suggestions?: TitleSuggestion[];
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await req.json();
    const { trendingTitles, videoIdea, region = 'Global', category = 'General' } = body;

    // Validation
    if (!trendingTitles || !Array.isArray(trendingTitles) || trendingTitles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'trendingTitles array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!videoIdea || videoIdea.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'videoIdea is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini model (using Flash for speed and cost efficiency)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create the prompt
    const prompt = `You are an expert YouTube title optimizer. Analyze these trending titles and create 5 unique titles for the user's video idea.

**TRENDING TITLES (${region} - ${category}):**
${trendingTitles.slice(0, 50).map((title, idx) => `${idx + 1}. ${title}`).join('\n')}

**USER'S VIDEO IDEA:**
${videoIdea}

**INSTRUCTIONS:**
1. Analyze patterns in trending titles (hooks, keywords, emotional triggers, numbers, questions)
2. Create 5 unique titles blending these patterns with the user's idea
3. Each title should be 40-70 characters
4. DO NOT copy trending titles directly
5. Make titles specific to the user's idea for ${region}

**CRITICAL: Your response must be ONLY a valid JSON array, nothing else. No explanations, no markdown, just the JSON array.**

**REQUIRED JSON FORMAT:**
[
  {
    "title": "Your Title Here",
    "reasoning": "Brief explanation why this works",
    "estimatedEngagement": "high"
  },
  {
    "title": "Another Title",
    "reasoning": "Why this title is effective", 
    "estimatedEngagement": "medium"
  }
]

**RULES:**
- Return EXACTLY 5 title objects in a JSON array
- Use only "high", "medium", or "low" for estimatedEngagement
- No additional text before or after the JSON
- Ensure valid JSON syntax

Generate the JSON array now:`;

    // Generate content with JSON mode
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let suggestions: TitleSuggestion[];
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
      
      // Extract JSON array from response
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON array found in response:', text);
        throw new Error('No JSON array found in response');
      }
      
      suggestions = JSON.parse(jsonMatch[0]);

      // Validate we have at least 5 suggestions
      if (!Array.isArray(suggestions) || suggestions.length < 5) {
        console.error('Not enough suggestions:', suggestions);
        throw new Error('Response must contain at least 5 suggestions');
      }

      // Validate structure
      suggestions.forEach((suggestion, idx) => {
        if (!suggestion.title || !suggestion.reasoning || !suggestion.estimatedEngagement) {
          console.error(`Invalid suggestion at index ${idx}:`, suggestion);
          throw new Error(`Invalid suggestion structure at index ${idx}`);
        }
      });

    } catch (parseError: any) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI returned an invalid response format. Please try again.' 
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json<ApiResponse>({
      success: true,
      suggestions: suggestions.slice(0, 5) // Ensure exactly 5 suggestions
    });

  } catch (error: any) {
    console.error('Error in suggest-titles API:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { success: false, error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: '/api/suggest-titles',
    method: 'POST',
    requiredFields: ['trendingTitles', 'videoIdea'],
    optionalFields: ['region', 'category']
  });
}