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
    title: "Corporate Data Privacy Policy",
    category: "Guidelines",
    content: "Guidelines for handling customer and employee data privacy in accordance with GDPR and CCPA regulations.",
    publicationDate: "2024-01-15",
    level: "Group",
    owningBusinessGroup: "Legal & Compliance",
    region: "Global",
    riskType: "Operational Risk",
    topic: "Data Protection"
  },
  {
    id: "2", 
    title: "Information Security Controls Standard",
    category: "Desktop procedures",
    content: "Standard security controls for protecting corporate information systems and data assets.",
    publicationDate: "2024-02-01",
    level: "Business Unit",
    owningBusinessGroup: "Information Technology",
    region: "Americas",
    riskType: "Cyber Risk",
    topic: "Information Security"
  },
  {
    id: "3",
    title: "Business Continuity Planning Guidelines",
    category: "Methodology", 
    content: "Framework for developing and maintaining business continuity plans to ensure operational resilience.",
    publicationDate: "2023-12-10",
    level: "Local",
    owningBusinessGroup: "Risk Management",
    region: "EMEA",
    riskType: "Business Continuity Risk",
    topic: "Business Resilience"
  },
  {
    id: "4",
    title: "Third-Party Risk Assessment Procedure",
    category: "Narrative",
    content: "Process for evaluating and managing risks associated with third-party vendors and suppliers.",
    publicationDate: "2024-03-05",
    level: "Group",
    owningBusinessGroup: "Procurement",
    region: "APAC",
    riskType: "Third Party Risk",
    topic: "Vendor Management"
  },
  {
    id: "5",
    title: "Employee Code of Conduct",
    category: "Executive summary",
    content: "Standards of behavior and ethical guidelines for all employees and contractors.",
    publicationDate: "2024-01-30",
    level: "Group",
    owningBusinessGroup: "Human Resources",
    region: "Global",
    riskType: "Conduct Risk",
    topic: "Ethics & Conduct"
  },
  {
    id: "6",
    title: "Anti-Money Laundering Controls FAQ",
    category: "FAQ",
    content: "Frequently asked questions about AML controls and compliance requirements.",
    publicationDate: "2024-02-20",
    level: "Business Unit",
    owningBusinessGroup: "Compliance",
    region: "Americas",
    riskType: "Financial Crime Risk",
    topic: "Anti-Money Laundering"
  },
  {
    id: "7",
    title: "Market Risk Management Job Aid",
    category: "Job aid",
    content: "Quick reference guide for market risk management procedures and calculations.",
    publicationDate: "2024-01-08",
    level: "Local",
    owningBusinessGroup: "Trading",
    region: "EMEA",
    riskType: "Market Risk",
    topic: "Trading Controls"
  },
  {
    id: "8",
    title: "Credit Risk Assessment Glossary",
    category: "Glossary",
    content: "Definitions and terms related to credit risk assessment and management.",
    publicationDate: "2023-11-25",
    level: "Group",
    owningBusinessGroup: "Credit Risk",
    region: "Global",
    riskType: "Credit Risk",
    topic: "Credit Management"
  }
];

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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Policy Library</h1>
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
            <div className="bg-white p-6 rounded-lg shadow-md">
                <ChatAssistant
                    selectedDocuments={selectedDocuments}
                    isExpanded={isChatExpanded}
                    onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
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
