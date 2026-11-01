/**
 * Ahmad Tech - WhatsApp Bot Pairing Panel Controller
 * Handles server switcher, phone inputs, validation, code generation, copy & cooldown timer.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initPairingPanel);

  function initPairingPanel() {
    const config = window.AHMAD_TECH_CONFIG;
    if (!config) {
      console.error('[Ahmad Tech] Configuration missing');
      return;
    }

    const apiClient = new window.AhmadTechApiClient(config);

    // DOM Elements
    const form = document.getElementById('pairingForm');
    const serverActiveCard = document.getElementById('selectedServerCard');
    const btnChangeServer = document.getElementById('btnChangeServer');
    const serverModal = document.getElementById('serverModal');
    const serverListContainer = document.getElementById('serverListContainer');
    const closeServerModal = document.getElementById('closeServerModal');

    const countryCodeSelect = document.getElementById('countryCodeSelect');
    const phoneInput = document.getElementById('phoneInput');
    const phoneHelp = document.getElementById('phoneHelp');

    const btnGenerate = document.getElementById('btnGenerateCode');
    const progressContainer = document.getElementById('generationProgress');
    const progressText = document.getElementById('progressStatusText');
    const progressBar = document.getElementById('progressBarFill');

    const codeBox = document.getElementById('pairingCodeBox');
    const codeDigits = document.getElementById('codeDigits');
    const codePlaceholder = document.getElementById('codePlaceholder');
    const btnCopyCode = document.getElementById('btnCopyCode');
    const timerWrapper = document.getElementById('expiryTimerWrapper');
    const timerSeconds = document.getElementById('expirySeconds');
    const timerProgress = document.getElementById('timerProgressBar');

    const toastContainer = document.getElementById('toastContainer');

    // State
    let selectedServer = config.servers.find(s => s.isDefault) || config.servers[0];
    let currentPairingCode = '';
    let isCooldown = false;
    let cooldownTimer = null;
    let expiryInterval = null;

    // 1. Populate Country Code Dropdown
    populateCountryCodes();

    // 2. Render Initial Active Server
    renderActiveServer();

    // 3. Populate Server Selection Modal/Drawer
    renderServerOptions();

    // Event Listeners
    if (btnChangeServer) {
      btnChangeServer.addEventListener('click', openServerModal);
    }

    if (closeServerModal) {
      closeServerModal.addEventListener('click', closeServerSelectionModal);
    }

    if (serverModal) {
      serverModal.addEventListener('click', (e) => {
        if (e.target === serverModal) closeServerSelectionModal();
      });
    }

    // Phone Input Sanitation (numeric characters only)
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        const cleaned = e.target.value.replace(/[^\d]/g, '');
        e.target.value = cleaned;
        validatePhoneUI(cleaned);
      });

      phoneInput.addEventListener('focus', () => {
        if (codeBox.classList.contains('state-error')) {
          resetCodeBoxToEmpty();
        }
      });
    }

    if (countryCodeSelect) {
      countryCodeSelect.addEventListener('change', () => {
        validatePhoneUI(phoneInput.value);
      });
    }

    // Form Submission / Generation
    if (form) {
      form.addEventListener('submit', handleGeneratePairingCode);
    }

    // Copy Button
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', handleCopyCode);
    }

    /* ==============================================================
       METHODS & EVENT HANDLERS
       ============================================================== */

    function populateCountryCodes() {
      if (!countryCodeSelect) return;
      countryCodeSelect.innerHTML = '';

      config.countryCodes.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.code;
        opt.textContent = `${item.flag} ${item.code} (${item.name})`;
        if (item.code === '+1') opt.selected = true;
        countryCodeSelect.appendChild(opt);
      });
    }

    function renderActiveServer() {
      if (!serverActiveCard || !selectedServer) return;

      const iconEl = serverActiveCard.querySelector('.server-badge-icon');
      const nameEl = serverActiveCard.querySelector('.server-current-name');
      const pingEl = serverActiveCard.querySelector('.server-current-ping');
      const loadEl = serverActiveCard.querySelector('.server-current-load');
      const regionEl = serverActiveCard.querySelector('.server-current-region');

      if (iconEl) iconEl.className = `server-badge-icon ${selectedServer.icon || 'fas fa-server'}`;
      if (nameEl) nameEl.textContent = selectedServer.name;
      if (pingEl) pingEl.textContent = `${selectedServer.ping} ms`;
      if (loadEl) loadEl.textContent = selectedServer.load;
      if (regionEl) regionEl.textContent = selectedServer.region;
    }

    function renderServerOptions() {
      if (!serverListContainer) return;
      serverListContainer.innerHTML = '';

      config.servers.forEach(server => {
        const isCurrent = server.id === selectedServer.id;
        const card = document.createElement('div');
        card.className = `server-option-card ${isCurrent ? 'is-selected' : ''}`;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.innerHTML = `
          <div class="server-option-left">
            <div class="server-opt-icon">
              <i class="${server.icon}"></i>
            </div>
            <div class="server-opt-details">
              <div class="server-opt-header">
                <span class="server-opt-title">${server.name}</span>
                <span class="server-opt-tag">${server.badge}</span>
              </div>
              <div class="server-opt-meta">
                <span><i class="fas fa-network-wired"></i> ${server.region}</span>
                <span><i class="fas fa-signal"></i> ${server.ping}ms latency</span>
                <span><i class="fas fa-tachometer-alt"></i> ${server.load} load</span>
              </div>
            </div>
          </div>
          <div class="server-option-status">
            <span class="status-indicator-dot online"></span>
            <span class="server-select-btn">${isCurrent ? 'Selected' : 'Connect'}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          selectServer(server);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectServer(server);
          }
        });

        serverListContainer.appendChild(card);
      });
    }

    function openServerModal() {
      if (!serverModal) return;
      serverModal.classList.add('active');
      document.body.classList.add('modal-open');
    }

    function closeServerSelectionModal() {
      if (!serverModal) return;
      serverModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }

    function selectServer(server) {
      selectedServer = server;
      renderActiveServer();
      renderServerOptions();
      closeServerSelectionModal();
      showToast(`Switched active gateway to ${server.name}`, 'info');
    }

    function validatePhoneUI(number) {
      if (!phoneHelp) return false;
      const clean = (number || '').replace(/[^\d]/g, '');
      const min = config.security.minPhoneDigits;
      const max = config.security.maxPhoneDigits;

      if (!clean) {
        phoneHelp.textContent = 'Enter WhatsApp number without leading zeros or symbols.';
        phoneHelp.className = 'form-input-help text-muted';
        return false;
      }

      if (clean.length < min) {
        phoneHelp.textContent = `Too short (${clean.length}/${min} digits minimum).`;
        phoneHelp.className = 'form-input-help text-warning';
        return false;
      }

      if (clean.length > max) {
        phoneHelp.textContent = `Too long (${clean.length}/${max} digits maximum).`;
        phoneHelp.className = 'form-input-help text-danger';
        return false;
      }

      phoneHelp.textContent = '✓ Valid phone format. Ready to request pairing.';
      phoneHelp.className = 'form-input-help text-success';
      return true;
    }

    async function handleGeneratePairingCode(e) {
      e.preventDefault();

      if (isCooldown) {
        showToast('Please wait for the cooldown timer before requesting again.', 'warning');
        return;
      }

      const rawNumber = (phoneInput.value || '').trim();
      const countryCode = (countryCodeSelect ? countryCodeSelect.value : '+1').replace('+', '');
      const cleaned = rawNumber.replace(/[^\d]/g, '');

      if (!cleaned || cleaned.length < config.security.minPhoneDigits || cleaned.length > config.security.maxPhoneDigits) {
        showCodeError('Invalid phone number length. Please enter 10 to 15 digits.');
        showToast('Please enter a valid WhatsApp phone number.', 'error');
        if (phoneInput) phoneInput.focus();
        return;
      }

      const fullPhoneNumber = `${countryCode}${cleaned}`;

      // UI Loading state
      setLoadingState(true);
      resetCodeBoxToEmpty();

      try {
        const response = await apiClient.requestPairingCode(
          selectedServer.id,
          fullPhoneNumber,
          (stepText, percent) => {
            if (progressText) progressText.textContent = stepText;
            if (progressBar) progressBar.style.width = `${percent}%`;
          }
        );

        if (response.success && response.code) {
          displayGeneratedCode(response.code, response.expiresIn || config.security.codeExpirySeconds);
          showToast('Pairing code generated successfully!', 'success');
          startCooldown(config.security.cooldownSeconds);
        } else {
          throw new Error(response.error || 'Gateway returned an empty pairing session.');
        }
      } catch (err) {
        console.error('[Ahmad Tech] Error generating pairing code:', err);
        showCodeError(err.message || 'Failed to reach cluster node.');
        showToast(err.message || 'Error generating code. Try another server.', 'error');
      } finally {
        setLoadingState(false);
      }
    }

    function setLoadingState(loading) {
      if (!btnGenerate) return;

      if (loading) {
        btnGenerate.disabled = true;
        btnGenerate.classList.add('loading');
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressBar) progressBar.style.width = '10%';
        if (progressText) progressText.textContent = 'Connecting to gateway...';
      } else {
        btnGenerate.disabled = isCooldown;
        btnGenerate.classList.remove('loading');
        if (progressContainer) progressContainer.style.display = 'none';
      }
    }

    function displayGeneratedCode(code, expirySeconds) {
      currentPairingCode = code;

      if (codeBox) {
        codeBox.classList.remove('state-empty', 'state-error');
        codeBox.classList.add('state-active');
      }

      if (codePlaceholder) codePlaceholder.style.display = 'none';
      if (codeDigits) {
        codeDigits.style.display = 'flex';
        codeDigits.innerHTML = '';

        // Render characters with nice formatting: e.g. "AHMD-7829"
        const parts = code.split('-');
        if (parts.length === 2) {
          const part1 = document.createElement('span');
          part1.className = 'code-segment';
          part1.textContent = parts[0];

          const sep = document.createElement('span');
          sep.className = 'code-separator';
          sep.textContent = '—';

          const part2 = document.createElement('span');
          part2.className = 'code-segment';
          part2.textContent = parts[1];

          codeDigits.appendChild(part1);
          codeDigits.appendChild(sep);
          codeDigits.appendChild(part2);
        } else {
          const fullSpan = document.createElement('span');
          fullSpan.className = 'code-segment';
          fullSpan.textContent = code;
          codeDigits.appendChild(fullSpan);
        }
      }

      if (btnCopyCode) {
        btnCopyCode.disabled = false;
        btnCopyCode.classList.remove('copied');
        btnCopyCode.innerHTML = '<i class="fas fa-copy"></i> <span>Copy Code</span>';
      }

      // Start Expiry Timer
      startExpiryCountdown(expirySeconds);
    }

    function startExpiryCountdown(totalSeconds) {
      if (expiryInterval) clearInterval(expiryInterval);
      if (!timerWrapper || !timerSeconds) return;

      let remaining = totalSeconds;
      timerWrapper.style.display = 'flex';
      timerSeconds.textContent = `${remaining}s`;
      if (timerProgress) timerProgress.style.width = '100%';

      expiryInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(expiryInterval);
          timerSeconds.textContent = 'Expired';
          if (timerProgress) timerProgress.style.width = '0%';
          if (codeBox) {
            codeBox.classList.remove('state-active');
            codeBox.classList.add('state-expired');
          }
          showToast('Pairing code expired. Please generate a new one.', 'warning');
        } else {
          timerSeconds.textContent = `${remaining}s`;
          if (timerProgress) {
            const pct = (remaining / totalSeconds) * 100;
            timerProgress.style.width = `${pct}%`;
          }
        }
      }, 1000);
    }

    function showCodeError(message) {
      currentPairingCode = '';
      if (expiryInterval) clearInterval(expiryInterval);
      if (timerWrapper) timerWrapper.style.display = 'none';

      if (codeBox) {
        codeBox.classList.remove('state-empty', 'state-active', 'state-expired');
        codeBox.classList.add('state-error');
      }

      if (codeDigits) codeDigits.style.display = 'none';
      if (codePlaceholder) {
        codePlaceholder.style.display = 'block';
        codePlaceholder.innerHTML = `<span class="error-msg"><i class="fas fa-exclamation-triangle"></i> ${message}</span>`;
      }

      if (btnCopyCode) {
        btnCopyCode.disabled = true;
      }
    }

    function resetCodeBoxToEmpty() {
      currentPairingCode = '';
      if (expiryInterval) clearInterval(expiryInterval);
      if (timerWrapper) timerWrapper.style.display = 'none';

      if (codeBox) {
        codeBox.className = 'pairing-code-box state-empty';
      }

      if (codeDigits) {
        codeDigits.style.display = 'none';
        codeDigits.innerHTML = '';
      }

      if (codePlaceholder) {
        codePlaceholder.style.display = 'block';
        codePlaceholder.innerHTML = '<span>• • • •  —  • • • •</span>';
      }

      if (btnCopyCode) {
        btnCopyCode.disabled = true;
        btnCopyCode.innerHTML = '<i class="fas fa-copy"></i> <span>Copy Code</span>';
      }
    }

    async function handleCopyCode() {
      if (!currentPairingCode) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(currentPairingCode);
        } else {
          // Fallback textarea method for legacy browsers
          const temp = document.createElement('textarea');
          temp.value = currentPairingCode;
          temp.style.position = 'fixed';
          temp.style.opacity = '0';
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }

        btnCopyCode.classList.add('copied');
        btnCopyCode.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
        showToast(`Copied ${currentPairingCode} to clipboard! Paste it into WhatsApp.`, 'success');

        setTimeout(() => {
          if (btnCopyCode) {
            btnCopyCode.classList.remove('copied');
            btnCopyCode.innerHTML = '<i class="fas fa-copy"></i> <span>Copy Code</span>';
          }
        }, 2500);
      } catch (err) {
        console.error('Failed to copy code', err);
        showToast('Unable to copy code automatically. Please select and copy manually.', 'error');
      }
    }

    function startCooldown(seconds) {
      isCooldown = true;
      let left = seconds;

      if (btnGenerate) {
        btnGenerate.disabled = true;
        const defaultHTML = btnGenerate.innerHTML;
        btnGenerate.setAttribute('data-default-html', defaultHTML);

        btnGenerate.innerHTML = `<i class="fas fa-clock"></i> <span>Wait (${left}s)</span>`;

        if (cooldownTimer) clearInterval(cooldownTimer);
        cooldownTimer = setInterval(() => {
          left -= 1;
          if (left <= 0) {
            clearInterval(cooldownTimer);
            isCooldown = false;
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = `<i class="fas fa-sync-alt"></i> <span>Generate New Code</span>`;
          } else {
            btnGenerate.innerHTML = `<i class="fas fa-clock"></i> <span>Wait (${left}s)</span>`;
          }
        }, 1000);
      }
    }

    function showToast(message, type = 'info') {
      if (!toastContainer) return;

      const toast = document.createElement('div');
      toast.className = `custom-toast toast-${type}`;

      let iconClass = 'fa-info-circle';
      if (type === 'success') iconClass = 'fa-check-circle';
      if (type === 'warning') iconClass = 'fa-exclamation-triangle';
      if (type === 'error') iconClass = 'fa-times-circle';

      toast.innerHTML = `
        <i class="fas ${iconClass} toast-icon"></i>
        <div class="toast-content">${message}</div>
        <button class="toast-close" aria-label="Close Notification">&times;</button>
      `;

      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          removeToast(toast);
        });
      }

      toastContainer.appendChild(toast);

      // Auto dismiss
      setTimeout(() => {
        removeToast(toast);
      }, 4500);
    }

    function removeToast(toast) {
      if (!toast || !toast.parentNode) return;
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }
  }
})();
