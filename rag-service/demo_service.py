#!/usr/bin/env python3
"""
Minimal RAG service for demonstration
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import json

app = FastAPI(title="Banking Document RAG Service - Demo", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentQuery(BaseModel):
    query: str
    risk_type: Optional[str] = None
    document_type: Optional[str] = None
    top_k: int = 5

class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_chunks: int
    query: str

# Comprehensive banking document chunks for RAG testing
DEMO_CHUNKS = [
    # FRY-9C Reporting Document - Multiple chunks
    {
        "text": "The FRY-9C is a comprehensive quarterly report that bank holding companies with total consolidated assets of $1 billion or more must file with the Federal Reserve. This report provides detailed consolidated financial information including balance sheet information, income statement data, off-balance sheet items, and regulatory capital information. Key requirements include filing within 40 days after quarter-end, certification by the chief financial officer, and subject to Federal Reserve review.",
        "metadata": {
            "document_id": "1",
            "title": "FRY-9C Consolidated Financial Statements for Bank Holding Companies",
            "date": "2024-12-15",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Financial Reporting",
            "region": "US",
            "risk_type": "Regulatory Risk",
            "source_link": "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDZkVjaOJDZr7Q=="
        },
        "similarity_score": 0.95,
        "chunk_index": 0,
        "token_count": 128
    },
    {
        "text": "FRY-9C Schedule HC-A provides detailed information about securities holdings including available-for-sale securities, held-to-maturity securities, and trading securities. Banks must report fair values, unrealized gains and losses, and maturity distributions. Municipal securities require separate reporting by state of issuer. Government-sponsored enterprise securities must be reported separately from other government securities. All securities must be classified by remaining maturity: under 1 year, 1-5 years, 5-15 years, and over 15 years.",
        "metadata": {
            "document_id": "1",
            "title": "FRY-9C Consolidated Financial Statements for Bank Holding Companies",
            "date": "2024-12-15",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Financial Reporting",
            "region": "US",
            "risk_type": "Regulatory Risk",
            "source_link": "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDZkVjaOJDZr7Q=="
        },
        "similarity_score": 0.88,
        "chunk_index": 1,
        "token_count": 142
    },
    {
        "text": "Regulation YY establishes enhanced prudential standards for large bank holding companies (BHCs) and foreign banking organizations (FBOs). Key components include capital planning and stress testing with annual capital plans required for BHCs with $100+ billion in assets, forward-looking stress testing scenarios, and capital distribution restrictions during stress periods. Risk management requirements include independent risk management function, Chief Risk Officer reporting directly to board, and comprehensive risk appetite framework.",
        "metadata": {
            "document_id": "3",
            "title": "Regulation YY - Enhanced Prudential Standards",
            "date": "2024-11-20",
            "type": "Methodology",
            "level": "Group",
            "business_group": "Risk Management",
            "region": "US",
            "risk_type": "Capital Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/topics/large-bank-supervision/enhanced-prudential-standards.htm"
        },
        "similarity_score": 0.88,
        "chunk_index": 1,
        "token_count": 145
    },    # Basel III Capital Requirements - Multiple detailed chunks
    {
        "text": "Basel III capital requirements establish enhanced capital standards for banking organizations. Core capital components include Common Equity Tier 1 (CET1) Capital with minimum ratio of 4.5% of risk-weighted assets, Tier 1 Capital with minimum ratio of 6%, and Total Capital with minimum ratio of 8%. The capital conservation buffer provides additional 2.5% CET1 requirement above minimum and restricts capital distributions when buffer is breached.",
        "metadata": {
            "document_id": "4",
            "title": "Basel III Capital Requirements - US Implementation",
            "date": "2024-11-15",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Capital Management",
            "region": "Global",
            "risk_type": "Capital Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/topics/capital-planning/capital-planning.htm"
        },
        "similarity_score": 0.92,
        "chunk_index": 2,
        "token_count": 120
    },
    {
        "text": "Basel III leverage ratio requirements mandate that banking organizations maintain a minimum leverage ratio of 3% at the holding company level and 4% at the insured depository institution level. The leverage ratio is calculated as Tier 1 capital divided by total leverage exposure. Total leverage exposure includes on-balance sheet exposures, derivative exposures, securities financing transaction exposures, and off-balance sheet exposures. Enhanced supplementary leverage ratio applies to G-SIBs with additional 2% buffer requirement.",
        "metadata": {
            "document_id": "4",
            "title": "Basel III Capital Requirements - US Implementation", 
            "date": "2024-11-15",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Capital Management",
            "region": "Global",
            "risk_type": "Capital Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/topics/capital-planning/capital-planning.htm"
        },
        "similarity_score": 0.89,
        "chunk_index": 3,
        "token_count": 134
    },
    {
        "text": "Risk-weighted assets calculation under Basel III includes credit risk-weighted assets computed using the standardized approach or advanced internal ratings-based approach. Market risk-weighted assets are calculated using standardized measurement approach or internal models approach. Operational risk-weighted assets use standardized approach, advanced measurement approach, or basic indicator approach. Credit risk mitigation techniques include eligible financial collateral, eligible guarantees, and credit derivatives meeting specific criteria.",
        "metadata": {
            "document_id": "4",
            "title": "Basel III Capital Requirements - US Implementation",
            "date": "2024-11-15", 
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Capital Management",
            "region": "Global",
            "risk_type": "Capital Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/topics/capital-planning/capital-planning.htm"
        },
        "similarity_score": 0.86,
        "chunk_index": 4,
        "token_count": 148
    },
    {
        "text": "The Liquidity Coverage Ratio (LCR) is designed to ensure that banks maintain sufficient high-quality liquid assets (HQLA) to survive a 30-day stress scenario. LCR calculation is Stock of HQLA divided by Total Net Cash Outflows over 30 days, which must be greater than or equal to 100%. High-Quality Liquid Assets include Level 1 Assets with 0% haircut such as cash and central bank reserves, Level 2A Assets with 15% haircut, and Level 2B Assets with 25-50% haircuts.",
        "metadata": {
            "document_id": "5",
            "title": "Liquidity Coverage Ratio (LCR) Requirements",
            "date": "2024-11-10",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Liquidity Management",
            "region": "US",
            "risk_type": "Liquidity Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/topics/liquidity/liquidity-coverage-ratio.htm"
        },        "similarity_score": 0.85,
        "chunk_index": 3,
        "token_count": 156
    },
    # Anti-Money Laundering (AML) Requirements
    {
        "text": "The Bank Secrecy Act (BSA) and Anti-Money Laundering (AML) requirements mandate that financial institutions implement comprehensive compliance programs. Key components include Customer Identification Program (CIP) requiring verification of customer identity using name, address, date of birth, and identification number. Customer Due Diligence (CDD) rules require beneficial ownership identification for legal entity customers. Suspicious Activity Reports (SARs) must be filed within 30 days for transactions of $5,000 or more that are known, suspected, or have reason to suspect involve funds from illegal activity.",
        "metadata": {
            "document_id": "6",
            "title": "Bank Secrecy Act and Anti-Money Laundering Requirements",
            "date": "2024-12-10",
            "type": "Compliance",
            "level": "Entity",
            "business_group": "Compliance",
            "region": "US",
            "risk_type": "Compliance Risk",
            "source_link": "https://www.occ.gov/topics/supervision-and-examination/bank-operations/bank-secrecy-act/index-bank-secrecy-act.html"
        },
        "similarity_score": 0.91,
        "chunk_index": 0,
        "token_count": 162
    },
    {
        "text": "Currency Transaction Reports (CTRs) must be filed for cash transactions exceeding $10,000 within 15 days. Multiple cash transactions totaling more than $10,000 in a single business day require aggregated reporting. Enhanced Due Diligence (EDD) is required for correspondent accounts, private banking accounts, and accounts for politically exposed persons (PEPs). Foreign correspondent banking relationships require special attention under Section 312 of the USA PATRIOT Act with enhanced record keeping and information sharing requirements.",
        "metadata": {
            "document_id": "6",
            "title": "Bank Secrecy Act and Anti-Money Laundering Requirements",
            "date": "2024-12-10",
            "type": "Compliance",
            "level": "Entity",
            "business_group": "Compliance",
            "region": "US",
            "risk_type": "Compliance Risk",
            "source_link": "https://www.occ.gov/topics/supervision-and-examination/bank-operations/bank-secrecy-act/index-bank-secrecy-act.html"
        },
        "similarity_score": 0.87,
        "chunk_index": 1,
        "token_count": 158
    },
    # Cybersecurity Requirements
    {
        "text": "Banking organizations must maintain robust cybersecurity frameworks to protect customer information and ensure operational resilience. Multi-factor authentication (MFA) is required for all privileged access and customer-facing systems. Network segmentation must isolate critical systems from less secure environments. Incident response plans must include detection, containment, eradication, recovery, and lessons learned phases. Penetration testing and vulnerability assessments must be conducted at least annually with critical vulnerabilities remediated within 30 days.",
        "metadata": {
            "document_id": "7",
            "title": "Cybersecurity Risk Management Framework",
            "date": "2024-12-05",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Information Security",
            "region": "US",
            "risk_type": "Operational Risk",
            "source_link": "https://www.occ.gov/news-issuances/bulletins/2021/bulletin-2021-3.html"
        },
        "similarity_score": 0.89,
        "chunk_index": 0,
        "token_count": 148
    },
    {
        "text": "Third-party risk management for cybersecurity requires comprehensive vendor assessments including security questionnaires, on-site reviews, and continuous monitoring. Cloud service providers must meet specific security standards including SOC 2 Type II compliance, data encryption in transit and at rest, and geographic data residency controls. Breach notification requirements mandate customer notification within 72 hours for incidents affecting personal information. Board oversight includes quarterly cybersecurity briefings and annual review of cyber risk appetite statements.",
        "metadata": {
            "document_id": "7",
            "title": "Cybersecurity Risk Management Framework",
            "date": "2024-12-05",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Information Security",
            "region": "US",
            "risk_type": "Operational Risk",
            "source_link": "https://www.occ.gov/news-issuances/bulletins/2021/bulletin-2021-3.html"
        },
        "similarity_score": 0.86,
        "chunk_index": 1,
        "token_count": 153
    },
    # Consumer Protection - Fair Lending
    {
        "text": "Fair lending laws prohibit discriminatory lending practices based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance. The Equal Credit Opportunity Act (ECOA) requires lenders to provide adverse action notices within 30 days specifying reasons for credit denial. Fair Housing Act applies to residential real estate transactions including purchase, refinance, and home improvement loans. Pricing disparities must be supported by legitimate business justifications with documentation of risk-based pricing factors.",
        "metadata": {
            "document_id": "8",
            "title": "Fair Lending and Consumer Protection Requirements",
            "date": "2024-12-01",
            "type": "Compliance",
            "level": "Entity",
            "business_group": "Consumer Banking",
            "region": "US",
            "risk_type": "Compliance Risk",
            "source_link": "https://www.occ.gov/topics/consumers-and-communities/consumer-protection/fair-lending/index-fair-lending.html"
        },
        "similarity_score": 0.88,
        "chunk_index": 0,
        "token_count": 144
    },
    {
        "text": "Regulation B implementing ECOA requires collection of monitoring information for mortgage applications including race, ethnicity, and sex of applicants. Home Mortgage Disclosure Act (HMDA) data must be collected for covered loans and reported annually. Redlining prevention requires equitable branch locations and marketing in low-moderate income areas. Fair lending examinations include statistical analysis of loan approval rates, pricing, and terms by demographic characteristics with comparative file reviews to identify potential disparities.",
        "metadata": {
            "document_id": "8",
            "title": "Fair Lending and Consumer Protection Requirements",
            "date": "2024-12-01",
            "type": "Compliance",
            "level": "Entity",
            "business_group": "Consumer Banking",
            "region": "US",
            "risk_type": "Compliance Risk",
            "source_link": "https://www.occ.gov/topics/consumers-and-communities/consumer-protection/fair-lending/index-fair-lending.html"
        },
        "similarity_score": 0.84,
        "chunk_index": 1,
        "token_count": 149
    },
    # Operational Risk Management
    {
        "text": "Operational risk management requires identification, assessment, monitoring, and control of risks resulting from inadequate or failed internal processes, people, systems, or external events. Key Risk Indicators (KRIs) must be established with defined thresholds and escalation procedures. Business continuity planning includes backup facilities, data recovery procedures, and crisis communication protocols. Operational loss data collection requires categorization by Basel event types: internal fraud, external fraud, employment practices, clients/products/business practices, damage to physical assets, business disruption, and execution/delivery/process management.",
        "metadata": {
            "document_id": "9",
            "title": "Operational Risk Management Standards",
            "date": "2024-11-25",
            "type": "Methodology",
            "level": "Group",
            "business_group": "Risk Management",
            "region": "Global",
            "risk_type": "Operational Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/topics/operational-risk/operational-risk.htm"
        },
        "similarity_score": 0.90,
        "chunk_index": 0,
        "token_count": 167
    },
    # Model Risk Management
    {
        "text": "Model risk management framework requires governance, development, implementation, and validation of quantitative models used in business decision-making. Model inventory must catalog all models with risk ratings, business use, and validation status. Independent model validation includes conceptual soundness review, ongoing monitoring, and outcomes analysis. Model validation must be performed by qualified personnel independent of model development. High-risk models require annual validation while moderate-risk models require validation every two years.",
        "metadata": {
            "document_id": "10",
            "title": "Model Risk Management Guidance - SR 11-7",
            "date": "2024-11-20",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Risk Management",
            "region": "US",
            "risk_type": "Model Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm"
        },
        "similarity_score": 0.89,
        "chunk_index": 0,
        "token_count": 145
    },
    {
        "text": "Model documentation standards require comprehensive documentation including model purpose, design, methodology, assumptions, limitations, and appropriate use. Performance testing must include backtesting, sensitivity analysis, and stress testing. Model change management requires approval processes for modifications with impact assessment and re-validation requirements. Model performance monitoring includes regular assessment of model accuracy, stability, and ongoing appropriateness for intended use. Remediation plans must address identified model weaknesses with timelines for resolution.",
        "metadata": {
            "document_id": "10",
            "title": "Model Risk Management Guidance - SR 11-7",
            "date": "2024-11-20",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Risk Management",
            "region": "US",
            "risk_type": "Model Risk",
            "source_link": "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm"
        },
        "similarity_score": 0.86,
        "chunk_index": 1,
        "token_count": 152
    },
    # Credit Risk Management
    {
        "text": "Credit risk management requires comprehensive policies covering underwriting standards, credit approval authorities, portfolio concentration limits, and loan review procedures. Credit exposure measurement includes probability of default (PD), loss given default (LGD), and exposure at default (EAD) calculations. Portfolio management includes diversification limits by industry, geography, and borrower type. Credit risk rating systems must include pass and criticized categories with clear criteria for each grade. Criticized assets include special mention, substandard, doubtful, and loss classifications.",
        "metadata": {
            "document_id": "11",
            "title": "Credit Risk Management Guidelines",
            "date": "2024-11-18",
            "type": "Guidelines",
            "level": "Entity",
            "business_group": "Credit Risk",
            "region": "US",
            "risk_type": "Credit Risk",
            "source_link": "https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/credit-risk-management/index-credit-risk-management.html"
        },
        "similarity_score": 0.91,
        "chunk_index": 0,
        "token_count": 158
    },
    # Interest Rate Risk Management
    {
        "text": "Interest rate risk measurement requires assessment of earnings and economic value sensitivity to rate changes. Net interest income simulation models test various rate scenarios including parallel shifts, yield curve twists, and basis risk changes. Economic value of equity (EVE) analysis measures present value impact of rate changes on assets, liabilities, and off-balance sheet positions. Asset liability management includes duration gap analysis, repricing analysis, and option risk assessment. Interest rate risk limits must be established for both earnings and economic value metrics.",
        "metadata": {
            "document_id": "12",
            "title": "Interest Rate Risk Management - OCC Bulletin 2010-1",
            "date": "2024-11-15",
            "type": "Guidelines",
            "level": "Entity",
            "business_group": "Asset Liability Management",
            "region": "US",
            "risk_type": "Interest Rate Risk",
            "source_link": "https://www.occ.gov/news-issuances/bulletins/2010/bulletin-2010-1.html"
        },
        "similarity_score": 0.88,
        "chunk_index": 0,
        "token_count": 155
    },
    # Vendor Risk Management
    {
        "text": "Third-party risk management requires due diligence assessments before engagement and ongoing monitoring throughout the relationship. Vendor criticality assessment considers services provided, data access, regulatory scope, and substitution difficulty. High-risk vendors require enhanced due diligence including financial analysis, reference checks, and on-site reviews. Service level agreements must include performance standards, reporting requirements, and termination clauses. Business continuity planning must address vendor failures with contingency arrangements and alternative service providers identified.",
        "metadata": {
            "document_id": "13",
            "title": "Third-Party Risk Management - OCC Bulletin 2013-29",
            "date": "2024-11-12",
            "type": "Guidelines",
            "level": "Group",
            "business_group": "Vendor Management",
            "region": "US",
            "risk_type": "Operational Risk",
            "source_link": "https://www.occ.gov/news-issuances/bulletins/2013/bulletin-2013-29.html"
        },
        "similarity_score": 0.87,
        "chunk_index": 0,
        "token_count": 147
    }
]

def simple_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Simple keyword-based search for demonstration"""
    query_lower = query.lower()
    
    # Score chunks based on keyword matches
    scored_chunks = []
    for chunk in DEMO_CHUNKS:
        score = 0.5  # Base score
        text_lower = chunk["text"].lower()
        title_lower = chunk["metadata"]["title"].lower()
          # Keyword scoring
        keywords = {
            "capital": 0.3, "requirement": 0.3, "basel": 0.4, "tier": 0.3,
            "fry": 0.5, "report": 0.2, "liquidity": 0.4, "lcr": 0.4,
            "stress": 0.3, "test": 0.2, "regulation": 0.2, "prudential": 0.3,
            "ratio": 0.2, "asset": 0.2, "buffer": 0.3, "risk": 0.2,
            "aml": 0.5, "money": 0.3, "laundering": 0.4, "bsa": 0.4,
            "suspicious": 0.4, "activity": 0.3, "ctr": 0.4, "sar": 0.4,
            "cyber": 0.4, "security": 0.3, "authentication": 0.3, "breach": 0.4,
            "incident": 0.3, "vulnerability": 0.3, "penetration": 0.3,
            "fair": 0.3, "lending": 0.4, "discrimination": 0.4, "ecoa": 0.4,
            "hmda": 0.4, "redlining": 0.4, "consumer": 0.3, "protection": 0.3,
            "operational": 0.3, "continuity": 0.3, "model": 0.3, "validation": 0.4,
            "credit": 0.3, "underwriting": 0.4, "portfolio": 0.3, "exposure": 0.3,
            "interest": 0.3, "rate": 0.3, "duration": 0.3, "repricing": 0.3,
            "vendor": 0.3, "third": 0.3, "party": 0.3, "due": 0.3, "diligence": 0.4
        }
        
        for keyword, weight in keywords.items():
            if keyword in query_lower:
                if keyword in text_lower:
                    score += weight
                if keyword in title_lower:
                    score += weight * 0.5
        
        # Adjust similarity score
        chunk_copy = chunk.copy()
        chunk_copy["similarity_score"] = min(0.98, score)
        scored_chunks.append(chunk_copy)
    
    # Sort by score and return top_k
    scored_chunks.sort(key=lambda x: x["similarity_score"], reverse=True)
    return scored_chunks[:top_k]

@app.get("/")
async def root():
    return {"message": "Banking Document RAG Service - Demo Mode", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mode": "demo",
        "total_chunks": len(DEMO_CHUNKS)
    }

@app.post("/search", response_model=SearchResponse)
async def search_documents(query: DocumentQuery):
    """Search for relevant document chunks using demo data"""
    try:
        results = simple_search(query.query, query.top_k)
        
        # Return enhanced results with document navigation
        enhanced_results = []
        for result in results:
            enhanced_result = {
                **result,
                "document_link": f"#document-{result['metadata']['document_id']}",  # Frontend anchor link
                "view_in_documents": True,  # Flag to show "View in Documents" link
                "document_preview": result["text"][:200] + "..." if len(result["text"]) > 200 else result["text"]
            }
            enhanced_results.append(enhanced_result)
        
        return SearchResponse(
            results=enhanced_results,
            total_chunks=len(DEMO_CHUNKS),
            query=query.query
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get statistics about the demo data"""
    doc_types = set()
    risk_types = set()
    
    for chunk in DEMO_CHUNKS:
        metadata = chunk["metadata"]
        doc_types.add(metadata["type"])
        risk_types.add(metadata["risk_type"])
    
    return {
        "total_chunks": len(DEMO_CHUNKS),
        "unique_documents": len(set(chunk["metadata"]["document_id"] for chunk in DEMO_CHUNKS)),
        "document_types": sorted(list(doc_types)),
        "risk_types": sorted(list(risk_types)),
        "mode": "demo"
    }

@app.get("/documents")
async def get_documents():
    """Get all available documents for the frontend document list"""
    
    # Convert demo chunks to frontend document format
    documents = {}
    
    for chunk in DEMO_CHUNKS:
        doc_id = chunk["metadata"]["document_id"]
        if doc_id not in documents:
            metadata = chunk["metadata"]
            
            # Read the actual document content from dummy documents
            content = ""
            if doc_id == "1":
                content = """The FRY-9C is a comprehensive quarterly report that bank holding companies with total consolidated assets of $1 billion or more must file with the Federal Reserve. This report provides detailed consolidated financial information including:

• Balance Sheet Information: Assets, liabilities, and equity components
• Income Statement Data: Revenue, expenses, and net income details  
• Off-Balance Sheet Items: Commitments, guarantees, and derivatives
• Regulatory Capital Information: Tier 1 and Tier 2 capital calculations

Key Requirements:
- Filed within 40 days after quarter-end
- Must be certified by the chief financial officer
- Subject to Federal Reserve review and examination
- Used for supervisory monitoring and regulatory analysis

The report includes detailed schedules covering:
- Loan and lease portfolios by type and geographic distribution
- Securities holdings and their fair values
- Trading assets and liabilities
- Allowance for credit losses calculations
- Regulatory capital components and ratios

Schedule HC-A provides detailed information about securities holdings including available-for-sale securities, held-to-maturity securities, and trading securities. Banks must report fair values, unrealized gains and losses, and maturity distributions. Municipal securities require separate reporting by state of issuer.

Compliance with FRY-9C requirements is essential for maintaining good standing with federal regulators and ensures transparency in financial reporting for large banking organizations."""

            elif doc_id == "2":
                content = """Annual report filed by bank holding companies to report changes in organizational structure, including acquisitions, divestitures, and other corporate changes. This report captures significant organizational events and helps regulators track the evolution of banking organizations.

Key Components:
- Acquisition and merger activities
- Subsidiary formations and dissolutions
- Changes in ownership structure
- Regulatory approvals and notifications

Filing requirements include detailed documentation of all organizational changes, their regulatory impact, and compliance with applicable banking laws and regulations."""

            elif doc_id == "3":
                content = """Regulation YY establishes enhanced prudential standards for large bank holding companies (BHCs) and foreign banking organizations (FBOs) operating in the United States. This regulation implements key provisions of the Dodd-Frank Act designed to strengthen the resilience of large financial institutions.

Key Components:

1. Capital Planning and Stress Testing:
• Annual capital plans required for BHCs with $100+ billion in assets
• Forward-looking stress testing scenarios
• Capital distribution restrictions during stress periods

2. Risk Management Requirements:
• Independent risk management function
• Chief Risk Officer reporting directly to board
• Comprehensive risk appetite framework
• Regular risk assessments and reporting

3. Liquidity Requirements:
• Liquidity buffer requirements
• Contingency funding plans
• Liquidity stress testing
• Internal liquidity risk limits

4. Single-Counterparty Credit Limits:
• Exposure limits to prevent concentration risk
• Aggregate exposure calculations
• Board-approved credit policies

5. Recovery and Resolution Planning:
• 'Living wills' for orderly resolution
• Critical operations identification
• Resolution strategies and capabilities

Applicability thresholds vary by asset size, with the most stringent requirements applying to globally systemically important banks (G-SIBs). Compliance is monitored through ongoing supervision and annual assessments."""

            elif doc_id == "4":
                content = """Basel III capital requirements establish enhanced capital standards for banking organizations. The framework introduces more stringent capital requirements, better risk coverage, and enhanced supervision and market discipline.

Core Capital Components:
• Common Equity Tier 1 (CET1) Capital: Minimum ratio of 4.5% of risk-weighted assets
• Tier 1 Capital: Minimum ratio of 6% of risk-weighted assets  
• Total Capital: Minimum ratio of 8% of risk-weighted assets

Capital Conservation Buffer:
• Additional 2.5% CET1 requirement above minimum ratios
• Restricts capital distributions when buffer is breached
• Designed to ensure banks maintain capital above regulatory minimums

Countercyclical Capital Buffer:
• Variable buffer of 0-2.5% based on economic conditions
• Applied to domestic credit exposures
• Helps reduce systemic risk during credit booms

The implementation includes phase-in periods and transition arrangements to ensure smooth adoption while maintaining lending capacity to support economic growth."""

            elif doc_id == "5":
                content = """Bank Secrecy Act (BSA) and Anti-Money Laundering (AML) compliance requirements establish comprehensive frameworks for detecting and preventing money laundering and terrorist financing. Financial institutions must implement robust compliance programs.

Key Requirements:

1. Customer Identification Program (CIP):
• Verify customer identity using documents, non-documentary methods, or both
• Maintain records of verification methods used
• Check customer names against government watch lists

2. Customer Due Diligence (CDD):
• Understand the nature and purpose of customer relationships
• Conduct ongoing monitoring for suspicious activities
• Enhanced due diligence for higher-risk customers

3. Suspicious Activity Reporting (SAR):
• File reports for transactions of $5,000 or more that appear suspicious
• Report within 30 days of initial detection
• Maintain confidentiality of SAR filings

4. Currency Transaction Reporting (CTR):
• Report cash transactions over $10,000
• File within 15 days of transaction
• Include complete customer information

The program must include ongoing employee training, independent testing, and designation of a BSA compliance officer. Regular risk assessments help ensure the program remains effective against evolving threats."""

            else:
                content = f"Content for document {doc_id} - Banking document with regulatory information."
            
            documents[doc_id] = {
                "id": doc_id,
                "title": metadata["title"],
                "category": metadata["type"],
                "content": content,
                "publicationDate": metadata["date"],
                "level": metadata["level"],
                "owningBusinessGroup": metadata["business_group"],
                "region": metadata["region"],
                "riskType": metadata["risk_type"],
                "sourceUrl": metadata["source_link"],
                "summary": f"Banking regulatory document covering {metadata['risk_type'].lower()} requirements and compliance procedures.",
                "isBookmarked": False
            }
    
    return {"documents": list(documents.values())}

if __name__ == "__main__":
    print("🏦 Starting Banking Document RAG Service - Demo Mode")
    print("📄 Using sample document chunks for demonstration")
    print("🌐 Service will be available at http://localhost:8000")
    print("✅ CORS enabled for http://localhost:3000")
    print("")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
