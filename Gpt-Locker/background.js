// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'logViolation') {
      logViolation(request.prompt, request.violation);
    }
  });
  
  function logViolation(prompt, violation) {
    // Placeholder function to simulate logging violations to an Excel sheet
    // You can implement the actual logging functionality here
    console.log('Logging violation - Prompt:', prompt, 'Violation:', violation);
  }
