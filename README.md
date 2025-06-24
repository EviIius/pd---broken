# Policy Q&A - Frontend Only

A Next.js frontend application for policy document Q&A with a clean three-column layout.

## 🎯 Current Status

**Frontend-Only Implementation**: All backend functionality has been removed. The application now runs purely as a Next.js frontend with mock responses for demonstration purposes.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pq
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
   - Frontend: http://localhost:3000

## 🏗️ Architecture

### Frontend (Next.js/TypeScript)
- **Framework**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI components
- **Layout**: Three-column responsive design
- **Mock API**: Built-in Next.js API routes with mock responses

### Key Components

```
frontend/
├── pages/
│   ├── index.tsx              # Main three-column layout
│   └── api/
│       └── ask.ts             # Mock chatbot API endpoint
├── components/
│   ├── ChatAssistant.tsx      # AI chat interface (right column)
│   ├── FilterPanel.tsx        # Document filtering (left column)
│   ├── DocumentList.tsx       # Document display (center column)
│   ├── PlatformHeader.tsx     # Navigation header
│   └── ui/                    # Reusable UI components
└── types/
    └── index.ts               # TypeScript interfaces
```

## 🎨 Features

### ✅ Current Features
- **Three-Column Layout**: Filter Panel, Document List, Chat Assistant
- **Responsive Design**: Works on desktop and mobile devices
- **Mock Document Database**: 8 sample federal documents with metadata
- **Smart Filtering**: Filter by level, owning business, publication date
- **Mock Chat Responses**: Keyword-based responses for common policy questions
- **Professional UI**: Modern design with Tailwind CSS and Shadcn/UI

### 📋 Sample Mock Responses
The chatbot currently provides mock responses for keywords like:
- **FRY**: Federal Reserve Y-series reporting requirements
- **Stress**: Stress testing requirements for banks
- **Risk**: Risk management requirements
- **Liquidity**: Liquidity coverage ratio requirements
- **Compliance**: Compliance standards

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Features

1. **New Components**: Add to `components/` directory
2. **New Pages**: Add to `pages/` directory
3. **API Routes**: Add to `pages/api/` directory
4. **Types**: Update `types/index.ts`

### Mock Data
- Document data is defined in `components/DocumentList.tsx`
- Chat responses are defined in `pages/api/ask.ts`

## 🔮 Future Backend Integration

When ready to add backend functionality:

1. **Choose Backend Technology**
   - Python/Flask + RAG (Retrieval Augmented Generation)
   - Node.js/Express + AI service
   - Cloud-based AI APIs (OpenAI, Google Gemini, etc.)

2. **Replace Mock API**
   - Update `pages/api/ask.ts` to call real backend
   - Add authentication if needed
   - Implement real document processing

3. **Add Real Document Database**
   - Replace mock data with real federal documents
   - Implement document upload functionality
   - Add search and indexing capabilities

## 📱 Usage

1. **Filter Documents**: Use the left panel to filter documents by:
   - Level (Federal, State, Local)
   - Owning Business Group
   - Publication Date
   - Document Type

2. **Browse Documents**: View filtered documents in the center panel

3. **Ask Questions**: Use the chat assistant on the right to ask policy questions

4. **Get Mock Responses**: Receive keyword-based responses for demonstration

## 🎯 Sample Questions to Try

- "What are the key requirements for FRY reporting?"
- "What compliance standards apply to stress testing?"
- "What are the risk management requirements for large banks?"
- "How should institutions handle liquidity coverage ratios?"

## 📄 License

This project is licensed under the MIT License.