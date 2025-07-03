import { useState, useEffect } from 'react';
import { AIFeedback, Document, FilterState } from '../types';
import Layout from '../components/Layout';
import FilterPanel from '../components/FilterPanel';
import DocumentList from '../components/DocumentList';
import ChatAssistant from '../components/ChatAssistant';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { fetchDocumentsFromRAG } from '../lib/rag-api';

const sampleDocuments: Document[] = [  {
    id: "1",
    title: "FRY-9C Consolidated Financial Statements for Bank Holding Companies",
    category: "Guidelines",
    content: "The FRY-9C is a comprehensive quarterly report that bank holding companies with total consolidated assets of $1 billion or more must file with the Federal Reserve. This report provides detailed consolidated financial information including:\n\n• Balance Sheet Information: Assets, liabilities, and equity components\n• Income Statement Data: Revenue, expenses, and net income details\n• Off-Balance Sheet Items: Commitments, guarantees, and derivatives\n• Regulatory Capital Information: Tier 1 and Tier 2 capital calculations\n\nKey Requirements:\n- Filed within 40 days after quarter-end\n- Must be certified by the chief financial officer\n- Subject to Federal Reserve review and examination\n- Used for supervisory monitoring and regulatory analysis\n\nThe report includes detailed schedules covering:\n- Loan and lease portfolios by type and geographic distribution\n- Securities holdings and their fair values\n- Trading assets and liabilities\n- Allowance for credit losses calculations\n- Regulatory capital components and ratios\n\nCompliance with FRY-9C requirements is essential for maintaining good standing with federal regulators and ensures transparency in financial reporting for large banking organizations.",
    publicationDate: "2024-12-15",
    level: "Group",
    owningBusinessGroup: "Financial Reporting",
    region: "US",
    riskType: "Regulatory Risk",
    topic: "Financial Reporting",
    sourceUrl: "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDZkVjaOJDZr7Q==",
    summary: "Quarterly consolidated financial reporting requirements for large bank holding companies, including balance sheet, income statement, and regulatory capital information.",
    isBookmarked: false
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
    sourceUrl: "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDbCVjaOJDZr7Q==",
    isBookmarked: false
  },  {
    id: "3",
    title: "Regulation YY - Enhanced Prudential Standards",
    category: "Methodology", 
    content: "Regulation YY establishes enhanced prudential standards for large bank holding companies (BHCs) and foreign banking organizations (FBOs) operating in the United States. This regulation implements key provisions of the Dodd-Frank Act designed to strengthen the resilience of large financial institutions.\n\nKey Components:\n\n1. Capital Planning and Stress Testing:\n• Annual capital plans required for BHCs with $100+ billion in assets\n• Forward-looking stress testing scenarios\n• Capital distribution restrictions during stress periods\n\n2. Risk Management Requirements:\n• Independent risk management function\n• Chief Risk Officer reporting directly to board\n• Comprehensive risk appetite framework\n• Regular risk assessments and reporting\n\n3. Liquidity Requirements:\n• Liquidity buffer requirements\n• Contingency funding plans\n• Liquidity stress testing\n• Internal liquidity risk limits\n\n4. Single-Counterparty Credit Limits:\n• Exposure limits to prevent concentration risk\n• Aggregate exposure calculations\n• Board-approved credit policies\n\n5. Recovery and Resolution Planning:\n• 'Living wills' for orderly resolution\n• Critical operations identification\n• Resolution strategies and capabilities\n\nApplicability thresholds vary by asset size, with the most stringent requirements applying to globally systemically important banks (G-SIBs). Compliance is monitored through ongoing supervision and annual assessments.",
    publicationDate: "2024-11-20",
    level: "Group",
    owningBusinessGroup: "Risk Management",
    region: "US",
    riskType: "Capital Risk",
    topic: "Prudential Standards",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/large-bank-supervision/enhanced-prudential-standards.htm",
    summary: "Enhanced prudential standards for large bank holding companies including capital planning, risk management, liquidity requirements, and resolution planning.",
    isBookmarked: true
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
    topic: "Cybersecurity",    sourceUrl: "https://www.ffiec.gov/cyberassessmenttool.htm",
    isBookmarked: true
  },  {
    id: "5",
    title: "SR 11-7 Guidance on Model Risk Management",
    category: "Executive summary",
    content: "SR 11-7 provides comprehensive guidance on model risk management for banking organizations. Model risk arises from the potential for adverse consequences from decisions based on incorrect or misused model outputs.\n\nKey Principles:\n\n1. Model Risk Management Framework:\n• Comprehensive policies and procedures\n• Clear model governance structure\n• Risk appetite and tolerance levels\n• Regular framework assessment and updates\n\n2. Model Development Standards:\n• Rigorous development and testing processes\n• Comprehensive documentation requirements\n• Validation during development phase\n• Independent review and approval\n\n3. Model Implementation Controls:\n• Proper implementation testing\n• User training and procedures\n• Change management processes\n• Ongoing monitoring requirements\n\n4. Model Validation Requirements:\n• Independent validation function\n• Ongoing performance monitoring\n• Back-testing and benchmarking\n• Regular validation reports to senior management\n\n5. Model Inventory and Documentation:\n• Complete model inventory maintenance\n• Detailed model documentation\n• Risk rating and classification\n• Regular inventory updates\n\nSupervisory Expectations:\n• Board and senior management oversight\n• Three lines of defense implementation\n• Regular independent reviews\n• Remediation of identified deficiencies\n\nThe guidance applies to all models used in business processes, including credit risk, market risk, operational risk, and financial reporting models.",
    publicationDate: "2024-12-01",
    level: "Group",
    owningBusinessGroup: "Model Risk Management",
    region: "US",
    riskType: "Model Risk",
    topic: "Model Validation",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm",
    summary: "Federal Reserve guidance on comprehensive model risk management covering development, implementation, validation, and governance of models used in banking.",
    isBookmarked: false
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
    sourceUrl: "https://www.ffiec.gov/ffiecinfobase/resources/call/call_main.htm",
    isBookmarked: false
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
    topic: "Basel III Compliance",    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/capital/basel3/implementation.htm",
    isBookmarked: false
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
    topic: "Stress Testing",    sourceUrl: "https://www.federalreserve.gov/supervisionreg/stress-tests/ccar.htm",
    isBookmarked: false
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
    topic: "CRA Compliance",    sourceUrl: "https://www.ffiec.gov/cra/examiner.htm",
    isBookmarked: false
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
    topic: "Consumer Protection",    sourceUrl: "https://www.consumerfinance.gov/rules-policy/regulations/1026/",
    isBookmarked: true
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
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/srletters/sr2003.htm",
    isBookmarked: false
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
    sourceUrl: "https://www.fincen.gov/resources/statutes-regulations/guidance/anti-money-laundering-requirements",
    isBookmarked: false
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
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/interestrate.htm",
    isBookmarked: false
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
    sourceUrl: "https://www.federalreserve.gov/newsevents/pressreleases/bcreg20140903a.htm",
    isBookmarked: false
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
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/cecl.htm",
    isBookmarked: false
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
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/outsourcing/oversight.htm",
    isBookmarked: false
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
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/climate-change.htm",
    isBookmarked: false
  },
  {
    id: "18",    title: "Digital Banking Security Standards",
    category: "FAQ",
    content: "Frequently asked questions about implementing security standards for digital banking platforms and mobile applications.",
    publicationDate: "2023-11-25", // Last 12 months coverage
    level: "Business Unit",
    owningBusinessGroup: "Information Technology",
    region: "US",
    riskType: "Cyber Risk",
    topic: "Digital Banking",
    sourceUrl: "https://www.ffiec.gov/press/PDF/FFIEC%20Authentication%20Guidance.pdf",
    isBookmarked: false
  },
  {
    id: "19",
    title: "Fair Lending Examination Procedures",
    category: "Exhibit",
    content: "Examination procedures for evaluating compliance with fair lending laws including ECOA and Fair Housing Act requirements.",
    publicationDate: "2024-12-14",
    level: "Local",
    owningBusinessGroup: "Consumer Compliance",
    region: "US",
    riskType: "Compliance Risk",
    topic: "Fair Lending",
    sourceUrl: "https://www.ffiec.gov/pdf/fairlend.pdf",
    isBookmarked: false
  },
  {
    id: "20",
    title: "Operational Risk Management Framework",
    category: "Methodology",
    content: "Comprehensive framework for identifying, measuring, monitoring, and controlling operational risk in banking organizations.",
    publicationDate: "2024-10-05", // Last 3 months coverage
    level: "Group",
    owningBusinessGroup: "Risk Management",
    region: "US",
    riskType: "Operational Risk",
    topic: "Risk Framework",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/operational-risk.htm",
    isBookmarked: false
  },
  {
    id: "21",
    title: "European Banking Authority Capital Guidelines",
    category: "Guidelines",
    content: "EBA guidelines on capital management and supervision for European banking institutions under CRD V framework.",
    publicationDate: "2024-11-18",
    level: "Group",
    owningBusinessGroup: "Capital Management",
    region: "EU",
    riskType: "Capital Risk",
    topic: "European Regulation",
    sourceUrl: "https://www.eba.europa.eu/regulation-and-policy/capital",
    isBookmarked: false
  },
  {
    id: "22",
    title: "UK PRA Stress Testing Requirements",
    category: "Desktop procedures",
    content: "Procedures for conducting stress tests under UK Prudential Regulation Authority requirements for major UK banks.",
    publicationDate: "2024-09-12", // Last 3 months coverage
    level: "Group",
    owningBusinessGroup: "Capital Planning",
    region: "UK",
    riskType: "Capital Risk",
    topic: "UK Stress Testing",
    sourceUrl: "https://www.bankofengland.co.uk/prudential-regulation/key-initiatives/stress-testing",
    isBookmarked: false
  },
  {
    id: "23",
    title: "APAC Market Risk Management Standards",
    category: "Job aid",
    content: "Market risk management standards and best practices for Asia-Pacific banking operations.",
    publicationDate: "2024-08-20", // Last 6 months coverage
    level: "Business Unit",
    owningBusinessGroup: "Trading",
    region: "APAC",
    riskType: "Market Risk",
    topic: "Trading Risk",
    sourceUrl: "https://www.bis.org/bcbs/publ/d457.htm",
    isBookmarked: false
  },
  {
    id: "24",
    title: "Canadian OSFI Regulatory Framework",
    category: "Narrative",
    content: "Overview of Office of the Superintendent of Financial Institutions regulatory framework for Canadian banking operations.",
    publicationDate: "2024-07-15", // Last 6 months coverage
    level: "Group",
    owningBusinessGroup: "Legal",
    region: "Canada",
    riskType: "Regulatory Risk",
    topic: "Canadian Regulation",
    sourceUrl: "https://www.osfi-bsif.gc.ca/Eng/fi-if/rg-ro/gdn-ort/gl-ld/Pages/default.aspx",
    isBookmarked: false
  },
  {
    id: "25",
    title: "Treasury Operations Manual",
    category: "Glossary",
    content: "Comprehensive glossary of treasury operations terms and procedures for liquidity and funding management.",
    publicationDate: "2024-06-10", // Last 6 months coverage
    level: "Business Unit",
    owningBusinessGroup: "Treasury",
    region: "Global",
    riskType: "Liquidity Risk",
    topic: "Treasury Operations",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/liquidity.htm",
    isBookmarked: false
  },
  {
    id: "26",
    title: "Consumer Protection Act Implementation",
    category: "Executive summary",
    content: "Executive summary of Consumer Financial Protection Bureau regulations and implementation requirements.",
    publicationDate: "2024-05-22", // Last 6 months coverage
    level: "Local",
    owningBusinessGroup: "Consumer Compliance",
    region: "US",
    riskType: "Compliance Risk",
    topic: "Consumer Protection",
    sourceUrl: "https://www.consumerfinance.gov/rules-policy/",
    isBookmarked: false
  },
  {
    id: "27",
    title: "Internal Audit Program Standards",
    category: "Methodology",
    content: "Standards and procedures for conducting internal audits of banking operations and risk management processes.",
    publicationDate: "2024-04-18", // Year to date coverage
    level: "Group",
    owningBusinessGroup: "Internal Audit",
    region: "Global",
    riskType: "Operational Risk",
    topic: "Internal Audit",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/internal-audit.htm",
    isBookmarked: false
  },
  {
    id: "28",
    title: "Latin America Regulatory Updates",
    category: "FAQ",
    content: "Frequently asked questions about regulatory changes and compliance requirements in Latin American markets.",
    publicationDate: "2023-10-30", // Last 12 months coverage
    level: "Business Unit",
    owningBusinessGroup: "Legal",
    region: "LATAM",
    riskType: "Regulatory Risk",
    topic: "Regional Compliance",
    sourceUrl: "https://www.bis.org/about/factbcbs.htm",
    isBookmarked: false
  },
  {
    id: "29",
    title: "Investment Management Risk Controls",
    category: "Desktop procedures",
    content: "Risk control procedures for investment management activities including portfolio limits and monitoring requirements.",
    publicationDate: "2024-03-25", // Year to date coverage
    level: "Business Unit",
    owningBusinessGroup: "Investment Management",
    region: "US",
    riskType: "Market Risk",
    topic: "Investment Risk",
    sourceUrl: "https://www.sec.gov/investment/investment-advisers",
    isBookmarked: false
  },
  {
    id: "30",
    title: "Human Resources Policy Framework",
    category: "Guidelines",
    content: "Framework for human resources policies including hiring, compensation, performance management, and compliance training.",
    publicationDate: "2024-02-14", // Year to date coverage
    level: "Local",
    owningBusinessGroup: "Human Resources",
    region: "Global",
    riskType: "Operational Risk",
    topic: "HR Policies",
    sourceUrl: "https://www.federalreserve.gov/aboutthefed/files/pf_3.pdf",
    isBookmarked: false
  },
  {
    id: "31",
    title: "ESG Risk Assessment Guidelines",
    category: "Job aid",
    content: "Environmental, Social, and Governance risk assessment guidelines for sustainable banking practices.",
    publicationDate: "2024-01-08", // Year to date coverage
    level: "Group",
    owningBusinessGroup: "Sustainability",
    region: "Global",
    riskType: "ESG Risk",
    topic: "ESG Compliance",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/climate-change.htm",
    isBookmarked: false
  },
  {
    id: "32",
    title: "Corporate Banking Credit Policies",
    category: "Exhibit",
    content: "Credit policies and procedures for corporate banking including underwriting standards and portfolio management.",
    publicationDate: "2023-12-22", // Last 12 months coverage
    level: "Business Unit",
    owningBusinessGroup: "Corporate Banking",
    region: "US",
    riskType: "Credit Risk",
    topic: "Corporate Credit",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/credit-risk.htm",
    isBookmarked: false
  },
  {
    id: "33",
    title: "Retail Banking Operations Manual",
    category: "Narrative",
    content: "Comprehensive manual covering retail banking operations including branch management, customer service, and product delivery.",
    publicationDate: "2023-09-15", // Older than 12 months
    level: "Local",
    owningBusinessGroup: "Retail Banking",
    region: "US",
    riskType: "Operational Risk",
    topic: "Retail Operations",
    sourceUrl: "https://www.fdic.gov/resources/bankers/retail-payment-systems/",
    isBookmarked: false
  },
  {
    id: "34",
    title: "Private Banking Compliance Standards",
    category: "Glossary",
    content: "Compliance standards and terminology for private banking services including wealth management and fiduciary responsibilities.",
    publicationDate: "2023-08-01", // Older than 12 months
    level: "Business Unit",
    owningBusinessGroup: "Private Banking",
    region: "Global",
    riskType: "Compliance Risk",
    topic: "Private Banking",
    sourceUrl: "https://www.occ.treas.gov/topics/supervision-and-examination/bank-operations/fiduciary-activities/index-fiduciary-activities.html",
    isBookmarked: false
  },
  {
    id: "35",
    title: "Technology Risk Management Framework",
    category: "Executive summary",
    content: "Executive summary of technology risk management framework including cybersecurity, data governance, and system reliability.",
    publicationDate: "2024-12-16", // Recent for Last 7 days
    level: "Group",
    owningBusinessGroup: "Information Technology",
    region: "Global",
    riskType: "Technology Risk",
    topic: "Technology Governance",
    sourceUrl: "https://www.federalreserve.gov/supervisionreg/topics/technology-risk.htm",
    isBookmarked: false
  }
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
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Load documents from RAG service on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoadingDocuments(true);
      try {
        const ragDocuments = await fetchDocumentsFromRAG();
        if (ragDocuments.length > 0) {
          console.log(`Loaded ${ragDocuments.length} documents from RAG service`);
          setDocuments(ragDocuments);
        } else {
          console.log('Using fallback sample documents');
          // Keep the existing sampleDocuments as fallback
        }
      } catch (error) {
        console.error('Failed to load documents from RAG service:', error);
        // Keep using sampleDocuments as fallback
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    loadDocuments();
  }, []);

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
  const handleToggleBookmark = (doc: Document) => {
    setDocuments(prevDocuments => 
      prevDocuments.map(document => 
        document.id === doc.id 
          ? { ...document, isBookmarked: !document.isBookmarked }
          : document
      )
    );
  };

  const handleToggleBookmarksOnly = () => {
    setShowBookmarksOnly(prev => !prev);
  };

  const handleFeedback = (feedback: AIFeedback) => {
    // Handle feedback logic
    console.log(feedback);
  };

  return (
    <Layout>
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Policy Q&A Assistant</h1>
                  <p className="text-gray-600">Ask questions about banking regulations and get AI-powered answers with source citations from our comprehensive policy database.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Filter Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <FilterPanel 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                  onClearFilter={handleClearFilter}
                  onClearAllFilters={handleClearAllFilters}
                  showBookmarksOnly={showBookmarksOnly}
                  onToggleBookmarksOnly={handleToggleBookmarksOnly}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-6">
              {/* Chat Assistant */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <ChatAssistant
                  selectedDocuments={selectedDocuments}
                  isExpanded={isChatExpanded}
                  onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
                  suggestedPrompts={generateSuggestedPrompts(selectedDocuments)}
                />
              </div>

              {/* Document List */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <DocumentList
                  documents={documents}
                  selectedDocuments={selectedDocuments}
                  onSelectDocument={handleDocumentSelectionChange}
                  onToggleBookmark={handleToggleBookmark}
                  filters={filters}
                  showBookmarksOnly={showBookmarksOnly}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
