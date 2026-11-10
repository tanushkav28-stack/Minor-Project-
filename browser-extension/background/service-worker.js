/**
 * Cognivibe AI - Background Service Worker (Manifest V3)
 * High-performance API proxy that bypasses page CORS and HTTPS mixed-content blocks.
 */

const BACKEND_URL = 'http://127.0.0.1:8000/api';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'cognivibe-analyze-selection',
    title: '🧠 Analyze with Cognivibe AI',
    contexts: ['selection']
  });

  chrome.storage.sync.get(['cognivibe_enabled'], (res) => {
    if (res.cognivibe_enabled === undefined) {
      chrome.storage.sync.set({ cognivibe_enabled: true });
    }
  });

  console.log('Cognivibe AI Background Worker initialized.');
});

// Context menu click listener
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'cognivibe-analyze-selection' && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyze_selection',
      text: info.selectionText
    });
  }
});

// Fast message proxy listener for content script & popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fast_analyze') {
    chrome.storage.sync.get(['cognivibe_token'], async (res) => {
      const token = res.cognivibe_token || '';
      try {
        const response = await fetch(`${BACKEND_URL}/extension/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Extension-Token': token
          },
          body: JSON.stringify({
            text: request.text,
            platform: request.platform || 'browser_extension',
            element_type: request.element_type || 'selection'
          })
        });

        if (!response.ok) {
          sendResponse({ success: false, error: `Server error status: ${response.status}` });
          return;
        }

        const data = await response.json();
        sendResponse({ success: true, data: data });
      } catch (err) {
        sendResponse({
          success: false,
          error: 'Could not connect to Cognivibe Backend on http://127.0.0.1:8000. Ensure server.py is running.'
        });
      }
    });

    return true; // Keep message channel open for async fetch
  }
});
