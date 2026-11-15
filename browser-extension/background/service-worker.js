/**
 * Cognivibe AI - Background Service Worker (Manifest V3)
 * High-performance API proxy that bypasses page CORS and HTTPS mixed-content blocks.
 */

const BACKEND_URL = 'http://127.0.0.1:8000/api';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['cognivibe_enabled'], (res) => {
    if (res.cognivibe_enabled === undefined) {
      chrome.storage.sync.set({ cognivibe_enabled: true });
    }
  });

  console.log('Cognivibe AI Background Worker initialized.');
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

  // 2. Digital Consumption Logging & Live Page Analysis Proxy
  if (request.action === 'log_consumption') {
    chrome.storage.sync.get(['cognivibe_token'], async (res) => {
      const token = res.cognivibe_token || '';
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['X-Extension-Token'] = token;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/consumption/log`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(request.payload)
        });

        if (response.ok) {
          const data = await response.json();
          sendResponse({ success: true, data: data });
        } else {
          sendResponse({ success: false, status: response.status });
        }
      } catch (err) {
        sendResponse({ success: false, error: 'Backend unreachable' });
      }
    });

    return true;
  }

  // 3. Quick Mood Check-in Proxy
  if (request.action === 'mood_checkin') {
    chrome.storage.sync.get(['cognivibe_token'], async (res) => {
      const token = res.cognivibe_token || '';
      if (!token) {
        sendResponse({ success: false, error: 'Extension not paired with token.' });
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/consumption/mood-checkin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Extension-Token': token
          },
          body: JSON.stringify({
            mood: request.mood,
            note: request.note || 'Logged via Chrome extension quick popup'
          })
        });

        if (response.ok) {
          const data = await response.json();
          sendResponse({ success: true, data: data });
        } else {
          sendResponse({ success: false, status: response.status });
        }
      } catch (err) {
        sendResponse({ success: false, error: 'Backend unreachable' });
      }
    });

    return true;
  }

  // 4. Get Today's Consumption Summary
  if (request.action === 'get_today_summary') {
    chrome.storage.sync.get(['cognivibe_token'], async (res) => {
      const token = res.cognivibe_token || '';
      if (!token) {
        sendResponse({ success: false, error: 'Not paired' });
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/consumption/daily-report`, {
          headers: {
            'X-Extension-Token': token
          }
        });
        if (response.ok) {
          const data = await response.json();
          sendResponse({ success: true, data: data });
        } else {
          sendResponse({ success: false });
        }
      } catch (err) {
        sendResponse({ success: false, error: 'Backend unreachable' });
      }
    });

    return true;
  }
});
