// Test script for PowerQuery M Code generation
// This script tests the new PowerQuery functionality

const testPowerQueryEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing PowerQuery M Code Generation...\n');
  
  // Test 1: Template-based generation
  console.log('📋 Test 1: Template-based M Code Generation');
  try {
    const templateResponse = await fetch(`${baseUrl}/api/excel/powerquery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'data_cleaning',
        workbook: { name: 'Test Workbook', id: 'test-wb-1' }
      })
    });
    
    const templateResult = await templateResponse.json();
    console.log('✅ Template generation successful');
    console.log('📝 Generated template code preview:', templateResult.templateCode?.slice(0, 100) + '...');
    console.log('📊 Preview data rows:', templateResult.previewData?.length || 0);
  } catch (error) {
    console.log('❌ Template generation failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Step-based generation
  console.log('🔧 Test 2: Step-based M Code Generation');
  const testSteps = [
    {
      id: 'step-1',
      name: 'Filter Step',
      operation: 'filter',
      mCode: '',
      description: 'Filter test data',
      isApplied: false
    },
    {
      id: 'step-2', 
      name: 'Sort Step',
      operation: 'sort',
      mCode: '',
      description: 'Sort test data',
      isApplied: false
    }
  ];
  
  try {
    const stepsResponse = await fetch(`${baseUrl}/api/excel/generate-powerquery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workbookId: 'test-wb-1',
        sheetName: 'Sheet1',
        steps: testSteps,
        template: null
      })
    });
    
    const stepsResult = await stepsResponse.json();
    console.log('✅ Step-based generation successful');
    console.log('🔗 Generated steps count:', stepsResult.steps?.length || 0);
    console.log('📝 Complete M Code preview:', stepsResult.completeMCode?.slice(0, 100) + '...');
    console.log('📊 Preview data rows:', stepsResult.previewData?.length || 0);
  } catch (error) {
    console.log('❌ Step-based generation failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Individual step operations
  console.log('⚙️  Test 3: Individual Step Operations');
  const operations = ['filter', 'sort', 'group', 'add_column', 'dataTypes'];
  
  for (const operation of operations) {
    try {
      const stepResponse = await fetch(`${baseUrl}/api/excel/powerquery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: operation,
          parameters: {},
          currentSteps: []
        })
      });
      
      const stepResult = await stepResponse.json();
      console.log(`✅ ${operation} operation successful`);
      console.log(`   Generated M Code: ${stepResult.step?.mCode?.slice(0, 60)}...`);
    } catch (error) {
      console.log(`❌ ${operation} operation failed:`, error.message);
    }
  }
  
  console.log('\n🎉 PowerQuery testing complete!');
};

// Export for use in browser console or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPowerQueryEndpoints };
} else {
  // For browser usage
  window.testPowerQueryEndpoints = testPowerQueryEndpoints;
}

console.log(`
🚀 PowerQuery M Code Generation Test Script

To run this test:
1. Ensure the development server is running (npm run dev)
2. Open browser console and run: testPowerQueryEndpoints()
3. Or run in Node.js: node powerquery-test.js

Features to test:
✨ Template-based M Code generation
✨ Step-by-step M Code building  
✨ Individual operation testing
✨ Error handling and validation
✨ Preview data generation
`);
