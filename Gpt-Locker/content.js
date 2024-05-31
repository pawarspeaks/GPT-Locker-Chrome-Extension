console.log('Content script loaded');

function getChatPrompt() {
  const chatBox = document.querySelector('.relative.max-w-\\[70\\%\\].rounded-3xl.bg-\\[\\#f4f4f4\\].px-5.py-2\\.5.dark\\:bg-token-main-surface-secondary');
  if (chatBox) {
    console.log('Chat box found:', chatBox);
    return chatBox.innerText || '';
  } else {
    console.log('Chat box not found.');
    return '';
  }
}




// Function to handle prompt checking
async function checkPrompt(prompt) {
  try {
    const response = await fetch('http://localhost:8000/check_prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    if (data.alert) {
      alert(data.alert);
    } else {
      checkAgainstRules(prompt);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function checkAgainstRules(prompt) {
  try {
    const response = await fetch('http://localhost:8000/check_prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    if (data.violation) {
      logViolation(prompt, data.violation);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function logViolation(prompt, violation) {
  chrome.runtime.sendMessage({
    action: 'logViolation',
    prompt: prompt,
    violation: violation
  });
}

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.querySelector('.relative.max-w-\\[70\\%\\].rounded-3xl.bg-\\[\\#f4f4f4\\].px-5.py-2\\.5.dark\\:bg-token-main-surface-secondary');
  if (chatBox) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          console.log('Chat box content changed:', getChatPrompt());
          const prompt = getChatPrompt();
          if (prompt) {
            checkPrompt(prompt);
          }
        }
      });
    });

    observer.observe(chatBox, { childList: true, characterData: true, subtree: true });
    console.log('Observer set up successfully');
  } else {
    console.log('Failed to find the chat box to observe.');
  }
});

// Listener for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  if (message.action === 'getPrompt') {
    const prompt = getChatPrompt();
    sendResponse({ prompt: prompt });
  }
});
