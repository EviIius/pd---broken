# Date Filter Test Guide

This guide documents the test documents added to ensure comprehensive coverage of all date filter options.

## Date Filter Options
- **All**: Shows all documents (default)
- **Last 7 days**: Documents published in the last 7 days
- **Last month**: Documents published in the previous calendar month  
- **This month**: Documents published in the current calendar month
- **Year to date**: Documents published from January 1st to today
- **Last 12 months**: Documents published in the last 12 months

## Test Documents by Date Filter

### Last 7 days Test Coverage
- **Document ID 11**: "Federal Reserve Board SR 20-3 - Remote Work Risk Management" (2024-12-19)
- **Document ID 17**: "Climate Risk Management Guidance" (2024-12-17)
- **Document ID 1**: "FRY-9C Consolidated Financial Statements" (2024-12-15)
- **Document ID 9**: "Community Reinvestment Act (CRA) Examination Procedures" (2024-12-12)
- **Document ID 2**: "FRY-4 Annual Report of Changes" (2024-12-10)
- **Document ID 10**: "Regulation Z - Truth in Lending Implementation Guide" (2024-12-08)

### Last Month (November 2024) Test Coverage
- **Document ID 3**: "Regulation YY - Enhanced Prudential Standards" (2024-11-20)
- **Document ID 8**: "CCAR and DFAST Stress Testing Requirements" (2024-11-30)
- **Document ID 6**: "Call Report Instructions - FFIEC 031/041" (2024-11-25)
- **Document ID 12**: "Anti-Money Laundering (AML) Program Requirements" (2024-11-15)

### This Month (December 2024) Test Coverage
- All documents with 2024-12-XX dates (Documents 1, 2, 4, 5, 7, 8, 9, 10, 11, 17)

### Year to Date (2024) Test Coverage
- **Document ID 13**: "Interest Rate Risk Management Guidelines" (2024-03-20)
- **Document ID 14**: "Liquidity Coverage Ratio (LCR) Requirements" (2024-01-15)
- **Document ID 16**: "Vendor Risk Management Framework" (2024-02-28)
- Plus all other 2024 documents

### Last 12 Months Test Coverage
- **Document ID 15**: "CECL Implementation Best Practices" (2023-12-10)
- **Document ID 18**: "Digital Banking Security Standards" (2023-11-25)
- Plus all 2024 documents

## Test Scenarios

1. **Default State**: When the page loads, "All" should be selected and all 18 documents should be visible.

2. **Last 7 days**: Should show approximately 6-8 recent documents published in the current week.

3. **Last month**: Should show documents from the previous calendar month (November 2024).

4. **This month**: Should show documents from the current month (December 2024).

5. **Year to date**: Should show all documents from 2024-01-01 to today.

6. **Last 12 months**: Should show documents from approximately December 2023 to today.

## Expected Behavior

- Each filter option should return at least 1-2 documents to ensure the filter is working
- The document count should be displayed in the DocumentList component
- Filter changes should be immediate and responsive
- Clear filters should reset to "All" and show all documents

## Manual Testing Steps

1. Load the application
2. Verify all 18 documents are shown by default
3. Select each date filter option one by one
4. Verify that appropriate documents are shown for each filter
5. Check that the document count matches expectations
6. Test the clear filters functionality
7. Verify that combining date filters with other filters works correctly

This comprehensive test coverage ensures that all date filter functionality works correctly across different time periods.
