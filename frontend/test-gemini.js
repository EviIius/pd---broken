// Test script to verify Gemini API integration
// Run with: node test-gemini.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
  try {
    console.log('Testing Gemini API integration...');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in .env.local');
      console.log('Please add your API key to .env.local file');
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a specialized AI assistant for federal banking regulations. 
    
Question: What are the key requirements for FRY-9C reporting?

Please provide a brief, professional response about this Federal Reserve form.`;

    console.log('🚀 Sending test query to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API working successfully!');
    console.log('\n📝 Test Response:');
    console.log(text);
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
    if (error.message.includes('API key')) {
      console.log('Please check your GEMINI_API_KEY in .env.local');
    }
  }
}

testGemini();
