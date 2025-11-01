// app/api/analyze-sentiment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Sentiment from 'sentiment';
import { Video } from '@/app/types/youtube.types'; // Adjust this path to your Video type

// Define the shape of the request body
interface RequestBody {
  videos: Video[];
}

// Define the shape of the response
interface ResponseData {
  sentimentScore: number;
  sentimentLabel: string;
}

// A helper function to turn the score into a readable label
function getSentimentLabel(score: number): string {
  if (score > 0.5) return 'Very Positive';
  if (score > 0.1) return 'Positive';
  if (score < -0.5) return 'Very Negative';
  if (score < -0.1) return 'Negative';
  return 'Neutral';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RequestBody;
    const { videos } = body;

    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json(
        { message: 'Invalid `videos` array.' },
        { status: 400 }
      );
    }

    const sentiment = new Sentiment();
    let totalComparativeScore = 0;
    const videoCount = videos.length;

    if (videoCount === 0) {
      return NextResponse.json({ 
        sentimentScore: 0, 
        sentimentLabel: 'Neutral' 
      });
    }

    videos.forEach((video) => {
      // Combine title and description for the best analysis
      // Truncate description to save processing time (first 500 chars)
      const textToAnalyze = `${video.title}. ${video.description.substring(0, 500)}`;
      
      // The 'comparative' score is a normalized score (score per word)
      // This is the best metric to average.
      const result = sentiment.analyze(textToAnalyze);
      totalComparativeScore += result.comparative;
    });

    // Calculate the average normalized score for the whole list
    const averageScore = totalComparativeScore / 50;
    const finalScore = parseFloat(averageScore.toFixed(4));
    const finalLabel = getSentimentLabel(finalScore);

    return NextResponse.json({ 
      sentimentScore: finalScore,
      sentimentLabel: finalLabel 
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error processing request' },
      { status: 500 }
    );
  }
}