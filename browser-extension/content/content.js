/**
 * Cognivibe AI - Passive Ambient Content Script
 * Runs completely in the background without intrusive text selection popups.
 */

(function () {
  function isExtensionValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
  }

  // 1. Text selection listener removed:
  // Cognivibe AI observes pages ambiently via consumption-tracker.js.
  // No floating button pops up on text highlight.

  // Right-click context menu message receiver (if user explicitly chooses context menu)
  if (isExtensionValid()) {
    try {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'analyze_selection' && msg.text) {
          analyzeSelectedContent(msg.text, 'context_menu');
        }
      });
    } catch (e) {}
  }

  // 2. Active platform adapters (passive extraction handled by consumption-tracker.js)
  function initAdapters() {
    // Kept clean without intrusive inline buttons
  }

  // 3. Fast API Proxy via Background Service Worker
  function analyzeSelectedContent(text, platform) {
    if (!isExtensionValid()) {
      alert('Cognivibe AI was updated in Chrome! Please refresh this webpage (F5) once to connect the new version.');
      return;
    }

    showResultModal({ loading: true, text });

    try {
      chrome.runtime.sendMessage(
        {
          action: 'fast_analyze',
          text: text,
          platform: platform,
          element_type: 'selection'
        },
        (response) => {
          if (!isExtensionValid() || chrome.runtime.lastError) {
            showResultModal({
              loading: false,
              text,
              error: 'Extension was reloaded. Please refresh (F5) this webpage and try again.'
            });
            return;
          }

          if (response && response.success && response.data) {
            showResultModal({ loading: false, text, data: response.data });
          } else {
            showResultModal({
              loading: false,
              text,
              error: (response && response.error) || 'Failed to complete analysis.'
            });
          }
        }
      );
    } catch (err) {
      showResultModal({
        loading: false,
        text,
        error: 'Extension connection refreshed. Please press F5 to reload this webpage!'
      });
    }
  }

  // 4. Modal display
  function showResultModal(state) {
    let overlay = document.getElementById('cognivibe-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cognivibe-modal-overlay';
      document.body.appendChild(overlay);
    }

    if (state.loading) {
      overlay.innerHTML = `
        <div class="cognivibe-modal-card">
          <div class="cognivibe-modal-header">
            <div class="cognivibe-modal-title">🧠 Analyzing Language...</div>
          </div>
          <div class="cognivibe-modal-body" style="text-align: center; padding: 25px;">
            <div style="font-size: 13px; color: #475569;">Evaluating code-mixed Hinglish patterns & context...</div>
          </div>
        </div>
      `;
      return;
    }

    if (state.error) {
      overlay.innerHTML = `
        <div class="cognivibe-modal-card">
          <div class="cognivibe-modal-header">
            <div class="cognivibe-modal-title">⚠️ Notice</div>
            <button class="cognivibe-close-btn" id="cognivibe-close-modal">✕</button>
          </div>
          <div class="cognivibe-modal-body">
            <div style="color: #b91c1c; font-size: 13px; margin-bottom: 8px;">${state.error}</div>
            <button onclick="window.location.reload()" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">Refresh Page (F5)</button>
          </div>
        </div>
      `;
      document.getElementById('cognivibe-close-modal').onclick = () => overlay.remove();
      return;
    }

    const d = state.data;
    const emo = d.task_1_emotion.predicted_emotion;
    const emoConf = Math.round(d.task_1_emotion.confidence * 100);
    const isDep = d.task_2_depression_language.depression_related;
    const ind = d.task_2_depression_language.indicator;
    const unc = Math.round(d.uncertainty.score * 100);
    const cues = d.linguistic_cues || [];

    const emoClass = `badge-${emo.toLowerCase().replace('/', '')}`;

    let helplineHtml = '';
    if (d.metadata.crisis_flag || isDep) {
      helplineHtml = `
        <div class="cognivibe-crisis-alert">
          <strong>Supportive Helpline Resources:</strong>
          <ul class="cognivibe-helpline-list">
            <li><strong>Tele-MANAS:</strong> 14416 / 1800-891-4416 (24x7 Free)</li>
            <li><strong>KIRAN:</strong> 1800-599-0019 (24x7)</li>
            <li><strong>Vandrevala Foundation:</strong> +91 9999 666 555</li>
          </ul>
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="cognivibe-modal-card">
        <div class="cognivibe-modal-header">
          <div class="cognivibe-modal-title">
            <span>✨</span> Cognivibe AI Linguistic Screening
          </div>
          <button class="cognivibe-close-btn" id="cognivibe-close-modal">✕</button>
        </div>
        <div class="cognivibe-modal-body">
          <div class="cognivibe-quote-box">"${state.text.substring(0, 150)}${state.text.length > 150 ? '...' : ''}"</div>

          <div class="cognivibe-grid">
            <div class="cognivibe-result-tile">
              <div class="cognivibe-tile-label">Detected Emotion</div>
              <span class="cognivibe-badge-pill ${emoClass}">${emo}</span>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Confidence: ${emoConf}%</div>
            </div>

            <div class="cognivibe-result-tile">
              <div class="cognivibe-tile-label">Depression-Related Flag</div>
              <span class="cognivibe-badge-pill ${isDep ? 'badge-sadness' : 'badge-joy'}">
                ${isDep ? 'Flagged Language' : 'Non-Depressive'}
              </span>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Indicator: <strong>${ind.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 4px;">
              <span>Model Uncertainty</span>
              <strong>${unc}% (${d.uncertainty.status})</strong>
            </div>
            <div style="background: #e2e8f0; height: 5px; border-radius: 3px; overflow: hidden;">
              <div style="background: ${unc > 70 ? '#f59e0b' : '#3b82f6'}; width: ${unc}%; height: 100%;"></div>
            </div>
          </div>

          <div style="font-size: 12px; color: #334155; margin-bottom: 10px;">
            <strong>Linguistic Cues:</strong>
            <ul style="margin: 4px 0 0 16px; padding: 0;">
              ${cues.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>

          ${helplineHtml}
        </div>
        <div class="cognivibe-modal-footer">
          <span style="font-size: 11px; color: #94a3b8;">Research Screening • Not a Diagnosis</span>
          <a href="http://127.0.0.1:5173" target="_blank" class="cognivibe-link-btn">Open Web Dashboard →</a>
        </div>
      </div>
    `;

    document.getElementById('cognivibe-close-modal').onclick = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
  }

  initAdapters();
})();
