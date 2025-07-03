import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      uploadDir: './tmp/uploads',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filter: ({ mimetype }) => {
        return mimetype?.includes('pdf') || 
               mimetype?.includes('msword') || 
               mimetype?.includes('wordprocessingml') ||
               false;
      }
    });

    // Ensure upload directory exists
    const uploadDir = './tmp/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    
    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];
    
    for (const file of uploadedFiles) {
      if (!file) continue;
      
      try {
        // Process each file
        const fileInfo = {
          id: Math.random().toString(36).substr(2, 9),
          originalName: file.originalFilename || 'unknown',
          size: file.size || 0,
          type: file.mimetype || 'unknown',
          path: file.filepath
        };

        // Mock document analysis (in real implementation, you would use libraries like pdf-parse, mammoth, etc.)
        const analysis = await mockDocumentAnalysis(fileInfo);
        
        results.push({
          ...fileInfo,
          analysis,
          status: 'completed'
        });

        // Clean up temporary file
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        
      } catch (error) {
        console.error('Error processing file:', error);
        results.push({
          id: Math.random().toString(36).substr(2, 9),
          originalName: file?.originalFilename || 'unknown',
          size: file?.size || 0,
          type: file?.mimetype || 'unknown',
          status: 'error',
          error: 'Failed to process file'
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      files: results 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Mock document analysis function
async function mockDocumentAnalysis(fileInfo: any) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const isPdf = fileInfo.type.includes('pdf');
  const isWord = fileInfo.type.includes('word') || fileInfo.type.includes('wordprocessingml');
  
  return {
    title: generateMockTitle(fileInfo.originalName),
    summary: generateMockSummary(),
    subheaders: generateMockSubheaders(),
    metadata: {
      pageCount: Math.floor(Math.random() * 20) + 5,
      wordCount: Math.floor(Math.random() * 5000) + 1000,
      language: 'English',
      fileType: isPdf ? 'PDF' : isWord ? 'Word' : 'Unknown',
      lastModified: new Date().toISOString().split('T')[0]
    },
    keyTopics: generateMockTopics(),
    documentStructure: generateMockStructure()
  };
}

function generateMockTitle(filename: string): string {
  const baseName = filename.replace(/\.(pdf|docx?|txt)$/i, '');
  const titles = [
    `${baseName} - Analysis Report`,
    `${baseName} Framework`,
    `${baseName} Guidelines`,
    `${baseName} Policy Document`,
    `${baseName} Compliance Manual`
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateMockSummary(): string {
  const summaries = [
    "This document provides comprehensive guidelines for regulatory compliance in the banking sector. It covers risk assessment methodologies, implementation strategies, and reporting requirements essential for maintaining regulatory standards.",
    "An extensive framework outlining operational procedures and best practices for financial institutions. The document emphasizes risk management, compliance protocols, and strategic implementation across various business units.",
    "This policy document establishes the foundational principles for regulatory adherence and risk mitigation. It includes detailed procedures, assessment criteria, and monitoring frameworks for effective compliance management.",
    "A detailed analysis of regulatory requirements with practical implementation guidance. The document covers assessment methodologies, control frameworks, and reporting standards necessary for regulatory compliance."
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

function generateMockSubheaders() {
  const headers = [
    { level: 1, text: "Executive Summary", page: 1, content: "Overview of key findings and recommendations" },
    { level: 1, text: "Introduction", page: 2, content: "Document purpose and scope definition" },
    { level: 2, text: "Background and Context", page: 3, content: "Historical context and regulatory environment" },
    { level: 2, text: "Objectives and Goals", page: 4, content: "Primary objectives and expected outcomes" },
    { level: 1, text: "Regulatory Framework", page: 5, content: "Comprehensive regulatory requirements overview" },
    { level: 2, text: "Risk Assessment Methods", page: 7, content: "Methodologies for identifying and assessing risks" },
    { level: 2, text: "Compliance Standards", page: 10, content: "Required compliance standards and benchmarks" },
    { level: 3, text: "Monitoring Procedures", page: 12, content: "Ongoing monitoring and evaluation processes" },
    { level: 3, text: "Reporting Requirements", page: 14, content: "Mandatory reporting standards and timelines" },
    { level: 1, text: "Implementation Guidelines", page: 16, content: "Step-by-step implementation procedures" },
    { level: 2, text: "Resource Allocation", page: 18, content: "Required resources and budget considerations" },
    { level: 2, text: "Timeline and Milestones", page: 20, content: "Implementation timeline with key milestones" },
    { level: 1, text: "Conclusion and Recommendations", page: 22, content: "Summary of recommendations and next steps" }
  ];
  
  // Return a random subset of headers
  const numHeaders = Math.floor(Math.random() * 5) + 7; // 7-12 headers
  return headers.slice(0, numHeaders);
}

function generateMockTopics(): string[] {
  const allTopics = [
    "Risk Management", "Regulatory Compliance", "Financial Analysis", "Operational Controls",
    "Audit Procedures", "Policy Framework", "Risk Assessment", "Compliance Monitoring",
    "Financial Reporting", "Internal Controls", "Regulatory Standards", "Best Practices",
    "Quality Assurance", "Performance Metrics", "Strategic Planning", "Change Management"
  ];
  
  // Return 4-8 random topics
  const numTopics = Math.floor(Math.random() * 5) + 4;
  const shuffled = allTopics.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTopics);
}

function generateMockStructure() {
  const structures = [
    {
      section: "Introduction and Overview",
      pages: "1-4",
      description: "Document introduction, objectives, and scope definition"
    },
    {
      section: "Regulatory Framework",
      pages: "5-12",
      description: "Comprehensive regulatory requirements and compliance standards"
    },
    {
      section: "Implementation Guidelines",
      pages: "13-18",
      description: "Practical implementation procedures and best practices"
    },
    {
      section: "Monitoring and Reporting",
      pages: "19-22",
      description: "Ongoing monitoring procedures and reporting requirements"
    }
  ];
  
  return structures;
}
