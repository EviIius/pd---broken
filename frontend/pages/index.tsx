import { useState } from 'react';
import { AIFeedback, Document, FilterState } from '../types';
import Layout from '../components/Layout';
import FilterPanel from '../components/FilterPanel';
import DocumentList from '../components/DocumentList';
import ChatAssistant from '../components/ChatAssistant';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const sampleDocuments: Document[] = [
  {
    id: "1",
    title: "FRY-9C Consolidated Financial Statements for Bank Holding Companies",
    category: "Guidelines",
    content: "Comprehensive reporting requirements for bank holding companies with total consolidated assets of $1 billion or more. Includes instructions for quarterly consolidated financial statements.",
    publicationDate: "2024-12-15",
    level: "Group",
    owningBusinessGroup: "Financial Reporting",
    region: "US",
    riskType: "Regulatory Risk",
    topic: "Financial Reporting",
    sourceUrl: "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDZkVjaOJDZr7Q=="
  },
  {
    id: "2", 
    title: "FRY-4 Annual Report of Changes in Organizational Structure",
    category: "Desktop procedures",
    content: "Annual report filed by bank holding companies to report changes in organizational structure, including acquisitions, divestitures, and other corporate changes.",
    publicationDate: "2024-12-10",
    level: "Business Unit",
    owningBusinessGroup: "Corporate Development",
    region: "US",
    riskType: "Regulatory Risk",
    topic: "Organizational Structure",
    sourceUrl: "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDbCVjaOJDZr7Q=="
  },
  {
    id: "3",
    title: "Regulation YY - Enhanced Prudential Standards",
    category: "Methodology", 
    content: "Enhanced prudential standards for large bank holding companies and foreign banking organizations. Covers capital planning, stress testing, and risk management requirements.",
    publicationDate: "2024-11-20",
    level: "Group",
    owningBusinessGroup: "Risk Management",
    region: "US",
    riskType: "Capital Risk",
    topic: "Prudential Standards",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/large-bank-supervision/enhanced-prudential-standards.htm"
  },
  {
    id: "4",
    title: "FFIEC Cybersecurity Assessment Tool Implementation Guide",
    category: "Narrative",
    content: "Comprehensive guide for implementing the FFIEC Cybersecurity Assessment Tool to evaluate and enhance cybersecurity preparedness at financial institutions.",
    publicationDate: "2024-12-05",
    level: "Group",
    owningBusinessGroup: "Information Technology",
    region: "US",
    riskType: "Cyber Risk",
    topic: "Cybersecurity",
    sourceUrl: "https://www.ffiec.gov/cyberassessmenttool.htm"
  },
  {
    id: "5",
    title: "SR 11-7 Guidance on Model Risk Management",
    category: "Executive summary",
    content: "Federal Reserve guidance on model risk management for banks and bank holding companies. Covers model development, implementation, use, and validation processes.",
    publicationDate: "2024-12-01",
    level: "Group",
    owningBusinessGroup: "Model Risk Management",
    region: "US",
    riskType: "Model Risk",
    topic: "Model Validation",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm"
  },
  {
    id: "6",
    title: "Call Report Instructions - FFIEC 031/041",
    category: "FAQ",
    content: "Detailed instructions for completing Consolidated Reports of Condition and Income (Call Reports) for banks with domestic and foreign offices.",
    publicationDate: "2024-11-25",
    level: "Business Unit",
    owningBusinessGroup: "Financial Reporting",
    region: "US",
    riskType: "Regulatory Risk",
    topic: "Call Reports",
    sourceUrl: "https://www.ffiec.gov/ffiecinfobase/resources/call/call_main.htm"
  },
  {
    id: "7",
    title: "Basel III Capital Requirements Implementation",
    category: "Job aid",
    content: "Implementation guide for Basel III capital requirements including Common Equity Tier 1, Tier 1, and Total Capital ratios for US banking organizations.",
    publicationDate: "2024-12-18",
    level: "Group",
    owningBusinessGroup: "Capital Management",
    region: "US",
    riskType: "Capital Risk",
    topic: "Basel III Compliance",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/capital/basel3/implementation.htm"
  },
  {
    id: "8",
    title: "CCAR and DFAST Stress Testing Requirements",
    category: "Glossary",
    content: "Comprehensive overview of Comprehensive Capital Analysis and Review (CCAR) and Dodd-Frank Act Stress Test (DFAST) requirements for large banking organizations.",
    publicationDate: "2024-11-30",
    level: "Group",    owningBusinessGroup: "Capital Planning",
    region: "US",
    riskType: "Capital Risk",
    topic: "Stress Testing",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/stress-tests/ccar.htm"
  },
  {
    id: "9",
    title: "Community Reinvestment Act (CRA) Examination Procedures",
    category: "Exhibit",
    content: "Federal examination procedures for evaluating bank performance under the Community Reinvestment Act, including lending, investment, and service tests.",
    publicationDate: "2024-12-12",
    level: "Business Unit",
    owningBusinessGroup: "Community Development",
    region: "US",
    riskType: "Compliance Risk",
    topic: "CRA Compliance",
    sourceUrl: "https://www.ffiec.gov/cra/examiner.htm"
  },
  {
    id: "10",
    title: "Regulation Z - Truth in Lending Implementation Guide",
    category: "Guidelines",
    content: "Implementation guide for Regulation Z requirements covering disclosure requirements for consumer credit transactions and mortgage lending practices.",
    publicationDate: "2024-12-08",    level: "Local",
    owningBusinessGroup: "Consumer Compliance",
    region: "US",
    riskType: "Compliance Risk",
    topic: "Consumer Protection",
    sourceUrl: "https://www.consumerfinance.gov/rules-policy/regulations/1026/"
  },
  {
    id: "11",
    title: "Federal Reserve Board SR 20-3 - Remote Work Risk Management",
    category: "Guidelines",
    content: "Guidance on managing operational risks associated with remote work arrangements for financial institutions.",
    publicationDate: "2024-12-19", // Yesterday (ensuring Last 7 days coverage)
    level: "Group",
    owningBusinessGroup: "Risk Management",
    region: "US",
    riskType: "Operational Risk",
    topic: "Remote Work",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/srletters/sr2003.htm"
  },
  {
    id: "12",
    title: "Anti-Money Laundering (AML) Program Requirements",
    category: "Desktop procedures", 
    content: "Comprehensive procedures for implementing and maintaining effective anti-money laundering programs in accordance with federal requirements.",
    publicationDate: "2024-11-15", // Last month coverage
    level: "Business Unit",
    owningBusinessGroup: "Risk Management",
    region: "US",
    riskType: "Compliance Risk",
    topic: "AML Compliance",
    sourceUrl: "https://www.fincen.gov/resources/statutes-regulations/guidance/anti-money-laundering-requirements"
  },
  {
    id: "13",
    title: "Interest Rate Risk Management Guidelines",
    category: "Methodology",
    content: "Federal guidelines for managing interest rate risk in banking organizations, including measurement and monitoring requirements.",
    publicationDate: "2024-03-20", // Year to date coverage (earlier in year)
    level: "Group", 
    owningBusinessGroup: "Risk Management",
    region: "US",
    riskType: "Market Risk",
    topic: "Interest Rate Risk",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/interestrate.htm"
  },
  {
    id: "14",
    title: "Liquidity Coverage Ratio (LCR) Requirements",
    category: "Executive summary",
    content: "Summary of Liquidity Coverage Ratio requirements for large banking organizations under Basel III implementation.",
    publicationDate: "2024-01-15", // Early year to date coverage
    level: "Group",
    owningBusinessGroup: "Risk Management", 
    region: "US",
    riskType: "Liquidity Risk",
    topic: "Basel III Compliance",
    sourceUrl: "https://www.federalreserve.gov/newsevents/pressreleases/bcreg20140903a.htm"
  },
  {
    id: "15",
    title: "CECL Implementation Best Practices",
    category: "Job aid",
    content: "Best practices for implementing Current Expected Credit Loss (CECL) methodology for allowance estimation.",
    publicationDate: "2023-12-10", // Last 12 months coverage (previous year)
    level: "Business Unit",
    owningBusinessGroup: "Financial Reporting",
    region: "US", 
    riskType: "Credit Risk",
    topic: "CECL Implementation",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/cecl.htm"
  },
  {
    id: "16",
    title: "Vendor Risk Management Framework",
    category: "Narrative",
    content: "Comprehensive framework for managing third-party vendor risks in financial institutions.",
    publicationDate: "2024-02-28", // Additional year to date coverage
    level: "Group",
    owningBusinessGroup: "Risk Management",
    region: "US",
    riskType: "Operational Risk", 
    topic: "Vendor Management",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/outsourcing/oversight.htm"
  },
  {
    id: "17",
    title: "Climate Risk Management Guidance",
    category: "Guidelines",
    content: "Emerging guidance on managing climate-related financial risks for large banking organizations.",
    publicationDate: "2024-12-17", // Recent - Last 7 days coverage
    level: "Group", 
    owningBusinessGroup: "Risk Management",
    region: "US",    riskType: "Operational Risk",
    topic: "Climate Risk",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/climate-change.htm"
  },
  {
    id: "18",
    title: "Digital Banking Security Standards",
    category: "FAQ",
    content: "Frequently asked questions about implementing security standards for digital banking platforms and mobile applications.",
    publicationDate: "2023-11-25", // Last 12 months coverage
    level: "Business Unit",
    owningBusinessGroup: "Information Technology",
    region: "US",
    riskType: "Cyber Risk",
    topic: "Digital Banking",
    sourceUrl: "https://www.ffiec.gov/press/PDF/FFIEC%20Authentication%20Guidance.pdf"}
];

// Function to generate suggested prompts based on selected documents
const generateSuggestedPrompts = (selectedDocuments: Document[]): string[] => {
  if (selectedDocuments.length === 0) {
    return [
      "What is FRY?",
      "Explain Basel III capital requirements",
      "What are CCAR stress testing requirements?",
      "How does the CECL methodology work?",
      "What is the purpose of Call Reports?"
    ];
  }

  const prompts: string[] = [];
  const topics = new Set(selectedDocuments.map(doc => doc.topic).filter(Boolean));
  const categories = new Set(selectedDocuments.map(doc => doc.category));
  const riskTypes = new Set(selectedDocuments.map(doc => doc.riskType).filter(Boolean));

  // Add document-specific prompts based on selection
  selectedDocuments.forEach(doc => {
    if (doc.title.includes("FRY")) {
      prompts.push("What is FRY and what are the differences between FRY-9C and FRY-4?");
    }
    if (doc.title.includes("Basel III")) {
      prompts.push("What are the key Basel III capital ratio requirements?");
    }
    if (doc.title.includes("CCAR") || doc.title.includes("DFAST")) {
      prompts.push("How do CCAR and DFAST stress tests differ?");
    }
    if (doc.title.includes("CECL")) {
      prompts.push("How should banks implement CECL methodology?");
    }
    if (doc.title.includes("Regulation YY")) {
      prompts.push("What are the enhanced prudential standards under Regulation YY?");
    }
    if (doc.title.includes("Model Risk")) {
      prompts.push("What are the key components of model risk management?");
    }
    if (doc.title.includes("Cybersecurity")) {
      prompts.push("What are the FFIEC cybersecurity assessment requirements?");
    }
    if (doc.title.includes("Call Report")) {
      prompts.push("What are the key Call Report filing requirements for banks?");
    }
    if (doc.title.includes("AML")) {
      prompts.push("What are the essential components of an AML program?");
    }
    if (doc.title.includes("CRA")) {
      prompts.push("How are banks evaluated under the Community Reinvestment Act?");
    }
  });

  // Add topic-based prompts
  if (topics.has("Financial Reporting")) {
    prompts.push("What are the key financial reporting requirements for bank holding companies?");
  }
  if (topics.has("Basel III Compliance")) {
    prompts.push("How do banks ensure compliance with Basel III requirements?");
  }
  if (riskTypes.has("Compliance Risk")) {
    prompts.push("What are the main compliance risks banks need to manage?");
  }

  // Remove duplicates and limit to 5 prompts
  return Array.from(new Set(prompts)).slice(0, 5);
};

const HomePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    publicationDate: null,
    documentType: [],
    level: [],
    owningBusinessGroup: [],
    region: [],
    riskType: [],
    topic: [],
    controlProcedure: null,
    policyCategory: null,
    policySubCategory: null,
    controlCategory: null,
    controlSubCategory: null,
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  const handleClearFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [filterKey]: null }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      publicationDate: null,
      documentType: [],
      level: [],
      owningBusinessGroup: [],
      region: [],
      riskType: [],
      topic: [],
      controlProcedure: null,
      policyCategory: null,
      policySubCategory: null,
      controlCategory: null,
      controlSubCategory: null,
    });
  };

  const handleDocumentSelectionChange = (doc: Document) => {
    setSelectedDocuments(prevSelectedDocs => {
        const isSelected = prevSelectedDocs.some(d => d.id === doc.id);
        if (isSelected) {
            return prevSelectedDocs.filter(d => d.id !== doc.id);
        } else {
            return [...prevSelectedDocs, doc];
        }
    });
  };

  const handleFeedback = (feedback: AIFeedback) => {
    // Handle feedback logic
    console.log(feedback);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-lg shadow-md">                <FilterPanel 
                    filters={filters} 
                    onFilterChange={handleFilterChange} 
                    onClearFilter={handleClearFilter}
                    onClearAllFilters={handleClearAllFilters}
                />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">                <ChatAssistant
                    selectedDocuments={selectedDocuments}
                    isExpanded={isChatExpanded}
                    onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
                    suggestedPrompts={generateSuggestedPrompts(selectedDocuments)}
                />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">                <DocumentList
                    documents={documents}
                    selectedDocuments={selectedDocuments}
                    onSelectDocument={handleDocumentSelectionChange}
                    filters={filters}
                />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
