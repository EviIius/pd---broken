import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

type HealthResponse = {
  status: 'healthy' | 'error';
  message: string;
  timestamp: string;
  gemini_configured: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method === 'GET') {
    try {
      const timestamp = new Date().toISOString();
      
      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          status: 'error',
          message: 'Gemini API key not configured',
          timestamp,
          gemini_configured: false,
          error: 'GEMINI_API_KEY environment variable is missing. Please add it to your .env.local file.'
        });
      }

      // Quick test of Gemini API with quota-aware error handling
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Simple test prompt
        const result = await model.generateContent("Hello");
        await result.response;
        
        return res.status(200).json({
          status: 'healthy',
          message: 'All systems operational',
          timestamp,
          gemini_configured: true
        });
        
      } catch (geminiError: any) {
        // Handle quota exceeded specifically
        if (geminiError?.message?.includes('quota') || geminiError?.message?.includes('429')) {
          return res.status(200).json({
            status: 'error',
            message: 'API quota exceeded - Using mock mode',
            timestamp,
            gemini_configured: true,
            error: 'Gemini API quota exceeded. The application will use mock responses until quota resets. You can still test all features with simulated AI responses.'
          });
        }
        
        return res.status(200).json({
          status: 'error',
          message: 'Gemini API connection failed',
          timestamp,
          gemini_configured: true,
          error: geminiError instanceof Error ? geminiError.message : 'Unknown Gemini API error'
        });
      }
      
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        gemini_configured: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  } else {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
      gemini_configured: false,
      error: 'Only GET requests are supported'
    });
  }
}
