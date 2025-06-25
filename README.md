# Policy Document Q&A System

A comprehensive Next.js application for policy document research and Q&A with advanced filtering, document preview, and bookmarking capabilities.

## 🎯 Current Status

**Enhanced Frontend Implementation**: A fully-featured document management and Q&A system with professional UI, advanced filtering, document preview modals, bookmarking system, and intelligent chat assistance.

## ✨ Key Features

### 📋 **Document Management**
- **35+ Federal Banking Documents** - Comprehensive collection of real regulatory documents
- **Document Preview Modal** - Full document content with metadata and summaries
- **Bookmarking System** - Save and organize important documents
- **Smart Search** - Text search across document titles and categories
- **Advanced Filtering** - Multi-level filtering by date, type, region, risk type, and bookmarks

### 🔍 **Advanced Filtering System**
- **Sidebar Filters**: Publication date, document type, region, risk type, bookmarks
- **Column Filters**: Per-column filtering with contains/starts/ends/exact matching
- **Date Filtering**: Last 7 days, last month, this month, year to date, last 12 months
- **Bookmarks Filter**: Show only bookmarked documents
- **Filter Persistence**: Maintains filter state during navigation

### 💬 **AI Chat Assistant**
- **Markdown Support** - Rich text responses with formatting
- **Loading States** - Animated loading indicators during AI response generation
- **Context Awareness** - Uses selected documents to improve answers
- **Suggested Prompts** - Dynamic suggestions based on document selection
- **Professional UI** - Expandable chat window with modern design

### 📊 **Data & Pagination**
- **35 Sample Documents** - Real federal banking regulations and guidelines
- **Smart Pagination** - Configurable page sizes (5, 10, 20, 50 items)
- **Document Metadata** - Publication dates, levels, business groups, regions, risk types
- **Source Links** - Direct links to original regulatory documents

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pd---broken
   ```

2. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   - Frontend: <http://localhost:3000>

## 🏗️ Architecture

### Frontend (Next.js/TypeScript)

- **Framework**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI components
- **Layout**: Responsive three-column design with sticky sidebar
- **State Management**: React hooks with TypeScript
- **Icons**: Lucide React icon library

### Key Components

```text
frontend/
├── components/
│   ├── ChatAssistant.tsx          # AI chat with markdown support
│   ├── DocumentList.tsx           # Document table with pagination
│   ├── DocumentPreviewModal.tsx   # Full document preview modal
│   ├── FilterPanel.tsx            # Advanced filtering sidebar
│   ├── PlatformHeader.tsx         # Navigation with API status
│   └── ui/                        # Reusable UI components
├── pages/
│   ├── index.tsx                  # Main application layout
│   └── api/
│       └── ask.ts                 # Mock chatbot API endpoint
├── types/
│   └── index.ts                   # TypeScript interfaces
└── hooks/
    └── useApiStatus.ts            # API status monitoring
```

## 🎨 Features Overview

### ✅ Document Management Features

- **Document Preview**: Click the eye icon to view full document content with metadata
- **Bookmarking**: Star documents for quick access and filter by bookmarks
- **Search**: Real-time text search across document titles and categories  
- **Pagination**: Configurable page sizes with smart navigation
- **Source Links**: Direct access to original regulatory documents

### ✅ Advanced Filtering

- **Sidebar Filters**: Publication date, document type, region, risk type, bookmarks
- **Column Filters**: Individual column filtering with multiple match types
- **Date Ranges**: Last 7 days, last month, this month, year to date, last 12 months
- **Filter Persistence**: Maintains filter state and shows active filter tags
- **Clear Filters**: Easy removal of individual or all filters

### ✅ AI Chat Assistant

- **Markdown Responses**: Rich text formatting with lists, headings, and emphasis
- **Loading States**: Animated indicators during response generation
- **Context Awareness**: Uses selected documents to improve answers
- **Suggested Prompts**: Dynamic suggestions based on current document selection
- **Expandable Interface**: Resizable chat window for better interaction

## � Sample Documents

The application includes 35+ real federal banking documents covering:

### Document Types

- **Guidelines**: Implementation guides and regulatory guidance
- **Desktop Procedures**: Step-by-step operational procedures  
- **Executive Summaries**: High-level overviews of regulations
- **Methodologies**: Technical approaches and frameworks
- **Job Aids**: Quick reference materials
- **FAQs**: Frequently asked questions and answers

### Coverage Areas

- **Federal Reserve Regulations**: FRY reporting, stress testing, capital requirements
- **FFIEC Guidance**: Cybersecurity, CRA compliance, fair lending
- **Basel III Implementation**: Capital ratios, liquidity coverage
- **Risk Management**: Model risk, operational risk, climate risk
- **Consumer Protection**: Truth in lending, fair housing compliance

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Project Structure

```text
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── *.tsx            # Feature-specific components
├── pages/               # Next.js pages and API routes
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── styles/              # Global styles and CSS
```

### Adding New Features

1. **New Components**: Add to `components/` directory with TypeScript
2. **API Routes**: Add to `pages/api/` for backend functionality
3. **Types**: Update `types/index.ts` for type safety
4. **Styling**: Use Tailwind CSS classes and shadcn/ui components

## 🎯 Usage Guide

### 1. Filtering Documents

- **Sidebar Filters**: Use left panel for broad filtering by date, type, region, risk
- **Column Filters**: Click filter icons in table headers for specific column filtering  
- **Search**: Use the search bar for text-based filtering
- **Bookmarks**: Toggle bookmark filter to show only starred documents

### 2. Document Preview

- **Eye Icon**: Click to open full document preview modal
- **Metadata**: View publication date, level, business group, region, risk type
- **Content**: Read full document text with proper formatting
- **Source Links**: Access original regulatory documents

### 3. Bookmarking

- **Star Documents**: Click bookmark icon to save important documents
- **Quick Access**: Use bookmark filter to find saved documents
- **Visual Indicators**: Filled stars show bookmarked status

### 4. AI Chat Assistant

- **Ask Questions**: Type regulatory questions in the chat interface
- **Select Documents**: Choose relevant documents for context-aware responses
- **Suggested Prompts**: Use auto-generated prompts based on document selection
- **Markdown Responses**: View formatted responses with lists and emphasis

## 🔮 Future Enhancement Ideas

### Backend Integration

- **Real AI Integration**: Connect to OpenAI, Google Gemini, or Anthropic Claude
- **RAG Implementation**: Add retrieval-augmented generation for document-specific answers
- **Vector Database**: Implement semantic search with document embeddings
- **User Authentication**: Add login and user-specific bookmarks

### Advanced Features

- **Document Upload**: Allow users to add their own regulatory documents
- **Export Functionality**: Download filtered document lists and chat conversations
- **Collaboration**: Share bookmarks and filters between team members
- **Audit Trail**: Track document access for compliance reporting

### UI/UX Improvements

- **Dark Mode**: Add theme switching capability
- **Keyboard Shortcuts**: Power user navigation shortcuts
- **Mobile App**: React Native version for mobile access
- **Print Views**: Optimized layouts for document printing

## 📄 License

This project is licensed under the MIT License.