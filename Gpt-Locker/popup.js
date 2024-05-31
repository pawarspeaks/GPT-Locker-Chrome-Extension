document.getElementById('checkButton').addEventListener('click', () => {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'none';
    console.log('Check button clicked');
  
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url.startsWith('https://chatgpt.com/')) {
        console.log('Injecting content script into:', activeTab.url);
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: ['content.js']
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error('Error injecting content script:', chrome.runtime.lastError.message);
            } else {
              console.log('Content script injected successfully');
              // Send a message to the content script after it's injected
              chrome.tabs.sendMessage(activeTab.id, { action: 'getPrompt' }, (response) => {
                if (response && response.prompt) {
                  handleResponse(response.prompt);
                } else {
                  console.log('No prompt received from content script.');
                  displayResult('No prompt detected.');
                }
              });
            }
          }
        );
      } else {
        displayResult('Extension works only on https://chatgpt.com/');
      }
    });
  });
  

  function handleResponse(prompt) {
    const resultDiv = document.getElementById('result');
    console.log(prompt);
    fetch('http://localhost:8000/check_prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    })

      .then(response => response.json())
      .then(data => {
        resultDiv.textContent = data.alert || 'No sensitive data detected.';
        resultDiv.style.display = 'block';
        
      })
      .catch(error => {
        console.error('Error:', error);
        resultDiv.textContent = 'Error checking prompt.';
        resultDiv.style.display = 'block';
      });
  }
  
  function displayResult(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
    resultDiv.style.display = 'block';
  }
  
