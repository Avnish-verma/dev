/**
 * THE NEURAL ARCHIVE // ADVANCED TELEMETRY & SQUAD TRACKING
 * Automatically gathers deep client metrics and syncs with MongoDB backend.
 */

(function () {
  'use strict';

  // Persistent Visitor UUID
  const STORAGE_KEY_VISITOR = 'neural_archive_vid';
  const STORAGE_KEY_COUNT = 'neural_archive_vcount';

  let visitorId = localStorage.getItem(STORAGE_KEY_VISITOR);
  let isNewVisitor = false;
  if (!visitorId) {
    visitorId = 'agt_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY_VISITOR, visitorId);
    isNewVisitor = true;
  }

  let visitCount = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10) + 1;
  localStorage.setItem(STORAGE_KEY_COUNT, visitCount.toString());

  // Parse Query Parameters (e.g. ?via=devansh&ref=squad)
  const urlParams = new URLSearchParams(window.location.search);
  const queryParams = {};
  for (const [key, value] of urlParams.entries()) {
    queryParams[key] = value;
  }
  const via = queryParams.via || queryParams.from || queryParams.ref || 'direct';

  // Smart API Resolver:
  // If viewing via VS Code Live Server (port 5500) or static dev server,
  // automatically route API calls to the running Node/Express backend at http://localhost:5000.
  // In production (Netlify / live domain / port 5000), use same-origin relative URL.
  const isLocalStaticServer = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && window.location.port !== '5000' && window.location.port !== '';
  const API_BASE = isLocalStaticServer ? 'http://localhost:5000' : '';

  // Client-Side OS and Browser Detector
  function parseClientEnvironment() {
    const ua = navigator.userAgent || '';
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    let deviceType = 'desktop';

    // Device Type
    if (/iPad|tablet|(android(?!.*mobile))/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
      deviceType = 'mobile';
    }

    // Operating System
    if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
    else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
    else if (/Android/i.test(ua)) {
      const match = ua.match(/Android\s([0-9\.]+)/i);
      os = match ? `Android ${match[1]}` : 'Android';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      const match = ua.match(/OS\s([0-9_]+)/i);
      os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macOS';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
    }

    // Browser
    if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
    else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
    else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Google Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
    else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';

    return { deviceType, os, browser, userAgent: ua };
  }

  // Hardware Profiling
  function getHardwareProfile() {
    return {
      ramGB: navigator.deviceMemory || null, // RAM in GB (e.g. 4, 8)
      cpuCores: navigator.hardwareConcurrency || null, // CPU thread count
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      touchPoints: navigator.maxTouchPoints || 0,
      orientation: window.screen.orientation ? window.screen.orientation.type : (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    };
  }

  // Network Telemetry
  function getNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return {};
    return {
      effectiveType: conn.effectiveType || '', // e.g. '4g', '3g'
      downlinkMbps: conn.downlink || null,
      rttMs: conn.rtt || null,
      saveData: conn.saveData || false
    };
  }

  // Battery Telemetry
  async function getBatteryInfo() {
    try {
      if (typeof navigator.getBattery === 'function') {
        const battery = await navigator.getBattery();
        return {
          levelPercent: Math.round(battery.level * 100),
          isCharging: battery.charging
        };
      }
    } catch (e) {
      // Battery API not supported or permissions denied
    }
    return { levelPercent: null, isCharging: null };
  }

  // State
  let currentVisitId = null;
  const startTime = Date.now();
  const stagesViewed = ['stage-01-terminal'];

  // Global Telemetry Controller
  window.NeuralTelemetry = {
    visitorId,
    via,

    // Primary initial handshake
    async init() {
      try {
        const { deviceType, os, browser, userAgent } = parseClientEnvironment();
        const hardware = getHardwareProfile();
        const network = getNetworkInfo();
        const battery = await getBatteryInfo();

        const payload = {
          visitorId,
          visitCount,
          isNewVisitor,
          device: { type: deviceType, os, browser, userAgent },
          hardware,
          network,
          battery,
          referral: {
            referrer: document.referrer || 'Direct Visit',
            url: window.location.href,
            via,
            queryParams
          },
          session: {
            stagesReached: stagesViewed,
            durationSeconds: 0
          }
        };

        const res = await fetch(API_BASE + '/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          currentVisitId = data.visitId;
        }
      } catch (err) {
        // Fail gracefully without affecting user animation
      }
    },

    // High-Priority Biometric Fingerprint Trigger (Fires immediately when thumb touches sensor)
    async logBiometricScan(action = 'fingerprint_touch') {
      try {
        const { deviceType, os, browser, userAgent } = parseClientEnvironment();
        const hardware = getHardwareProfile();
        const network = getNetworkInfo();
        const battery = await getBatteryInfo();
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);

        if (!stagesViewed.includes('stage-02')) {
          stagesViewed.push('stage-02');
        }

        const payload = {
          visitorId,
          visitId: currentVisitId,
          visitCount,
          isNewVisitor,
          trigger: action,
          durationSeconds,
          device: { type: deviceType, os, browser, userAgent },
          hardware,
          network,
          battery,
          referral: {
            referrer: document.referrer || 'Direct Visit',
            url: window.location.href,
            via,
            queryParams
          }
        };

        const res = await fetch(API_BASE + '/api/track/biometric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.visitId) currentVisitId = data.visitId;
        }
      } catch (err) {
        // Fail silently so animation is butter-smooth
      }
    },

    // Record Stage Progression
    logStage(stageName) {
      if (!stagesViewed.includes(stageName)) {
        stagesViewed.push(stageName);
        this.syncSession({ stage: stageName });
      }
    },

    // Record Guest Identification (Name & Note/Wish)
    logGuestIdentity(guestName, guestWish = '') {
      this.syncSession({ guestName, guestWish });
    },

    // Sync session updates to backend
    async syncSession(updateData = {}) {
      try {
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);
        const payload = {
          visitorId,
          visitId: currentVisitId,
          durationSeconds,
          ...updateData
        };

        // If page is closing, use sendBeacon for reliability
        if (navigator.sendBeacon && updateData.isClosing) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon(API_BASE + '/api/track/update', blob);
          return;
        }

        await fetch(API_BASE + '/api/track/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        // Silently ignore sync errors
      }
    }
  };

  // Launch initial telemetry after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.NeuralTelemetry.init());
  } else {
    window.NeuralTelemetry.init();
  }

  // Sync on page exit / unload
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      window.NeuralTelemetry.syncSession({ isClosing: true });
    }
  });

  window.addEventListener('pagehide', () => {
    window.NeuralTelemetry.syncSession({ isClosing: true });
  });

})();
