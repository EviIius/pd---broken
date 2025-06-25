#!/usr/bin/env python3
"""
Script to initialize the RAG service with banking documents from the frontend.
This extracts the document data from the Next.js app and processes it for RAG.
"""

import json
import asyncio
import httpx
from pathlib import Path
import re
import os

# Sample banking documents (extracted from your frontend)
BANKING_DOCUMENTS = [
    {
        "id": "1",
        "title": "FRY-9C Consolidated Financial Statements for Bank Holding Companies",
        "type": "Guidelines",
        "content": """The FRY-9C is a comprehensive quarterly report that bank holding companies with total consolidated assets of $1 billion or more must file with the Federal Reserve. This report provides detailed consolidated financial information including:

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

Compliance with FRY-9C requirements is essential for maintaining good standing with federal regulators and ensures transparency in financial reporting for large banking organizations.""",
        "date": "2024-12-15",
        "level": "Group",
        "business_group": "Financial Reporting",
        "region": "US",
        "risk_type": "Regulatory Risk",
        "source_link": "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDZkVjaOJDZr7Q==",
        "summary": "Quarterly consolidated financial reporting requirements for large bank holding companies, including balance sheet, income statement, and regulatory capital information."
    },
    {
        "id": "2",
        "title": "FRY-4 Annual Report of Changes in Organizational Structure",
        "type": "Desktop procedures",
        "content": """Annual report filed by bank holding companies to report changes in organizational structure, including acquisitions, divestitures, and other corporate changes.

The FRY-4 report must be filed within 120 days of the end of the calendar year and includes:

• Acquisition Activities: Details of bank and nonbank acquisitions during the year
• Divestiture Information: Sales or closures of subsidiaries and business lines
• Organizational Changes: Mergers, consolidations, and restructuring activities
• Control Changes: Changes in voting control or ownership structure

Key Reporting Elements:
- Legal entity structure charts
- Financial impact of organizational changes
- Regulatory approvals obtained
- Future planned activities

The report helps regulators monitor structural changes in banking organizations and assess compliance with bank holding company regulations. Accurate and timely filing is required to maintain regulatory compliance and avoid enforcement actions.""",
        "date": "2024-12-10",
        "level": "Business Unit",
        "business_group": "Corporate Development",
        "region": "US",
        "risk_type": "Regulatory Risk",
        "source_link": "https://www.federalreserve.gov/apps/reportforms/reportdetail.aspx?sOoYJ+5BzDbCVjaOJDZr7Q==",
        "summary": "Annual report filed by bank holding companies to report changes in organizational structure, including acquisitions, divestitures, and other corporate changes."
    },
    {
        "id": "3",
        "title": "Regulation YY - Enhanced Prudential Standards",
        "type": "Methodology",
        "content": """Regulation YY establishes enhanced prudential standards for large bank holding companies (BHCs) and foreign banking organizations (FBOs) operating in the United States. This regulation implements key provisions of the Dodd-Frank Act designed to strengthen the resilience of large financial institutions.

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

Applicability thresholds vary by asset size, with the most stringent requirements applying to globally systemically important banks (G-SIBs). Compliance is monitored through ongoing supervision and annual assessments.""",
        "date": "2024-11-20",
        "level": "Group",
        "business_group": "Risk Management",
        "region": "US",
        "risk_type": "Capital Risk",
        "source_link": "https://www.federalreserve.gov/supervisionreg/topics/large-bank-supervision/enhanced-prudential-standards.htm",
        "summary": "Enhanced prudential standards for large bank holding companies including capital planning, risk management, liquidity requirements, and resolution planning."
    },
    {
        "id": "4",
        "title": "Basel III Capital Requirements - US Implementation",
        "type": "Guidelines",
        "content": """The US implementation of Basel III capital requirements establishes enhanced capital standards for banking organizations to improve their ability to absorb losses and reduce systemic risk.

Core Capital Components:

1. Common Equity Tier 1 (CET1) Capital:
• Minimum ratio of 4.5% of risk-weighted assets
• Highest quality capital consisting of common stock and retained earnings
• Subject to regulatory adjustments and deductions

2. Tier 1 Capital:
• Minimum ratio of 6% of risk-weighted assets
• Includes CET1 plus additional Tier 1 instruments
• Must meet strict criteria for loss absorption

3. Total Capital:
• Minimum ratio of 8% of risk-weighted assets
• Includes Tier 1 plus Tier 2 capital
• Provides additional loss absorption capacity

Capital Conservation Buffer:
• Additional 2.5% CET1 requirement above minimum
• Restricts capital distributions when buffer is breached
• Designed to build capital during normal periods

Countercyclical Buffer:
• Variable buffer (0-2.5%) based on credit conditions
• Applied during periods of excessive credit growth
• Helps counter procyclical effects

For globally systemically important banks (G-SIBs), additional capital surcharges apply ranging from 1% to 3.5% based on systemic importance scores.""",
        "date": "2024-11-15",
        "level": "Group",
        "business_group": "Capital Management",
        "region": "Global",
        "risk_type": "Capital Risk",
        "source_link": "https://www.federalreserve.gov/supervisionreg/topics/capital-planning/capital-planning.htm",
        "summary": "US implementation of Basel III capital requirements including minimum ratios, capital buffers, and systemic importance surcharges."
    },
    {
        "id": "5",
        "title": "Liquidity Coverage Ratio (LCR) Requirements",
        "type": "Guidelines",
        "content": """The Liquidity Coverage Ratio (LCR) is a Basel III requirement designed to ensure that banks maintain sufficient high-quality liquid assets (HQLA) to survive a 30-day stress scenario.

LCR Calculation:
LCR = Stock of HQLA / Total Net Cash Outflows over 30 days ≥ 100%

High-Quality Liquid Assets (HQLA):

Level 1 Assets (0% haircut):
• Cash and central bank reserves
• Marketable securities backed by sovereigns, central banks, or PSEs with 0% risk weight
• Certain multilateral development bank securities

Level 2A Assets (15% haircut):
• Marketable securities backed by sovereigns, central banks, or PSEs with 20% risk weight
• Certain corporate debt securities and covered bonds rated AA- or higher

Level 2B Assets (25-50% haircuts):
• Corporate debt securities rated A+ to BBB-
• Residential mortgage-backed securities rated AA or higher
• Common equity shares meeting specific criteria

Cash Outflow Calculations:
• Retail deposits: 3-10% outflow rates depending on deposit type
• Wholesale funding: 25-100% outflow rates based on counterparty and maturity
• Secured funding: Based on asset quality and haircuts
• Contingent funding obligations: Various rates for undrawn commitments

The LCR requirement is 100% for internationally active banks and applies with modifications to other covered institutions based on asset size.""",
        "date": "2024-11-10",
        "level": "Group",
        "business_group": "Liquidity Management",
        "region": "US",
        "risk_type": "Liquidity Risk",
        "source_link": "https://www.federalreserve.gov/supervisionreg/topics/liquidity/liquidity-coverage-ratio.htm",
        "summary": "Liquidity Coverage Ratio requirements to ensure banks maintain sufficient liquid assets for 30-day stress scenarios."
    }
]

async def check_rag_service():
    """Check if RAG service is running."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/health")
            return response.status_code == 200
    except Exception:
        return False

async def initialize_rag_documents():
    """Initialize RAG service with banking documents."""
    print("🏦 Banking Document RAG Initialization")
    print("=====================================")
    
    # Check if RAG service is running
    print("📡 Checking RAG service status...")
    if not await check_rag_service():
        print("❌ RAG service is not running!")
        print("\nPlease start the RAG service first:")
        print("1. cd rag-service")
        print("2. python main.py")
        print("\nThen run this script again.")
        return False
    
    print("✅ RAG service is running")
    
    # Process documents
    print(f"📄 Processing {len(BANKING_DOCUMENTS)} banking documents...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8000/process_documents",
                json={"documents": BANKING_DOCUMENTS},
                timeout=120.0  # Long timeout for processing
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Successfully processed {result['documents_processed']} documents")
                print(f"📊 Created {result['total_chunks']} searchable chunks")
                
                # Test search functionality
                print("\n🔍 Testing search functionality...")
                search_response = await client.post(
                    "http://localhost:8000/search",
                    json={
                        "query": "What are the capital requirements for banks?",
                        "top_k": 3
                    }
                )
                
                if search_response.status_code == 200:
                    search_result = search_response.json()
                    print(f"✅ Search test successful - found {len(search_result['results'])} relevant chunks")
                    
                    # Show top result
                    if search_result['results']:
                        top_result = search_result['results'][0]
                        print(f"📖 Top result: {top_result['metadata']['title']}")
                        print(f"🎯 Similarity: {top_result['similarity_score']:.1%}")
                else:
                    print("⚠️ Search test failed")
                
                # Get statistics
                stats_response = await client.get("http://localhost:8000/stats")
                if stats_response.status_code == 200:
                    stats = stats_response.json()
                    print(f"\n📈 RAG Service Statistics:")
                    print(f"   • Total chunks: {stats['total_chunks']}")
                    print(f"   • Unique documents: {stats['unique_documents']}")
                    print(f"   • Document types: {', '.join(stats['document_types'])}")
                    print(f"   • Risk types: {', '.join(stats['risk_types'])}")
                
                print("\n🎉 RAG initialization complete!")
                print("\nYour Next.js app can now use enhanced AI responses with document context.")
                print("Make sure to set 'use_rag: true' in your chat requests to enable RAG.")
                
                return True
                
            else:
                print(f"❌ Failed to process documents: {response.status_code}")
                print(response.text)
                return False
                
        except Exception as e:
            print(f"❌ Error processing documents: {e}")
            return False

async def main():
    """Main initialization function."""
    success = await initialize_rag_documents()
    
    if success:
        print("\n🚀 Next Steps:")
        print("1. Your RAG service is now ready with banking documents")
        print("2. Start your Next.js frontend: cd frontend && npm run dev")
        print("3. Test the enhanced AI chat with document-based responses")
        print("4. The AI will now use actual document content for answers!")
    else:
        print("\n⚠️ Initialization failed. Please check the error messages above.")

if __name__ == "__main__":
    asyncio.run(main())
