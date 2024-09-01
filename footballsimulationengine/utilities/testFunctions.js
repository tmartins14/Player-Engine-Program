// Utility function for logging test results
function logTestResult(testName, condition) {
  totalTests++;
  if (!condition) {
    console.log(`${testName}: FAIL`);
    failedTests++;
  }
}

module.exports = { logTestResult };
