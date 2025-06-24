# Google Gemini API Setup Guide

## Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign in**: Use your Google account to sign in

3. **Create API Key**: 
   - Click "Create API Key"
   - Select "Create API key in new project" (or use an existing project)
   - Copy the generated API key

## Step 2: Configure Your Environment

1. **Add API Key to .env.local**:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

2. **Replace** `your_actual_api_key_here` with the API key you copied from Google AI Studio

## Step 3: Test the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the application**: Navigate to [http://localhost:3000](http://localhost:3000)

3. **Test the chat**: Ask questions like:
   - "What are FRY reporting requirements?"
   - "Explain stress testing for banks"
   - "What are liquidity coverage ratio requirements?"

## Features

### ✅ Current Gemini Integration
- **AI-Powered Responses**: Real AI responses instead of mock data
- **Banking Regulation Specialization**: Prompts optimized for regulatory questions
- **Context Awareness**: Uses selected documents to improve answers
- **Error Handling**: Graceful fallbacks if API key is missing
- **Source Attribution**: Relevant regulatory documents linked to responses

### 🎯 Specialized Banking Prompts
The system uses specialized prompts that focus on:
- Federal Reserve regulations
- FDIC requirements
- FinCEN compliance
- Banking risk management
- Regulatory reporting standards

## API Usage & Costs

- **Free Tier**: Gemini offers generous free usage limits
- **Pay-as-you-go**: Only pay for what you use beyond free tier
- **Current Model**: Using `gemini-1.5-flash` for fast, cost-effective responses

## Security Notes

- ✅ API key stored in `.env.local` (not committed to git)
- ✅ Server-side API calls only
- ✅ Error handling for missing/invalid keys
- ✅ No sensitive data logged

## Next Steps

After setting up Gemini, you can:
1. **Add RAG (Retrieval Augmented Generation)** for document-specific answers
2. **Fine-tune prompts** for better regulatory responses
3. **Add conversation memory** for multi-turn discussions
4. **Implement document embedding** for semantic search

## Troubleshooting

**Q: Getting "API key not configured" error?**
A: Make sure your `.env.local` file has the correct API key and restart the dev server.

**Q: Getting rate limit errors?**
A: Check your API usage in Google AI Studio and consider upgrading if needed.

**Q: Responses seem generic?**
A: The system will provide better responses once RAG is implemented with your document database.
