/**
 * Ahmad Tech - API Client Service
 * 
 * Cleanly separates UI layer from backend networking.
 * Handles both mock demonstration mode and real Baileys / WhatsApp MD REST endpoints.
 */

class AhmadTechApiClient {
  constructor(config = window.AHMAD_TECH_CONFIG) {
    this.config = config;
    this.baseUrl = config.backend.apiBaseUrl;
    this.useMock = config.backend.useMock;
  }

  /**
   * Request pairing code from selected node
   * @param {string} serverId Selected server cluster ID
   * @param {string} fullPhoneNumber Digits only with country code (e.g., '14155552671')
   * @param {function} onStep Optional progress callback: (stepName, percent) => {}
   * @returns {Promise<{success: boolean, code?: string, error?: string, expiresAt?: number}>}
   */
  async requestPairingCode(serverId, fullPhoneNumber, onStep = null) {
    if (this.useMock) {
      return this._mockPairingRequest(serverId, fullPhoneNumber, onStep);
    }
    return this._realPairingRequest(serverId, fullPhoneNumber, onStep);
  }

  /**
   * Real backend REST integration (Ready for Node.js / Baileys microservice)
   */
  async _realPairingRequest(serverId, fullPhoneNumber, onStep) {
    try {
      if (onStep) onStep("Connecting to cluster node...", 25);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.backend.timeoutMs);

      const endpoint = `${this.baseUrl}${this.config.backend.endpoints.pairCode}`;
      
      if (onStep) onStep("Initiating WhatsApp MD pairing handshake...", 60);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Client-Origin": "ahmadtech.site"
        },
        body: JSON.stringify({
          serverId,
          phoneNumber: fullPhoneNumber,
          timestamp: Date.now()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (onStep) onStep("Receiving secure 8-character pairing session...", 90);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || `Server responded with status ${response.status}`);
      }

      return {
        success: true,
        code: data.code,
        serverId: data.serverId || serverId,
        expiresIn: data.expiresIn || this.config.security.codeExpirySeconds,
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn("[AhmadTech API] Live backend unavailable or errored:", err.message);
      // Fallback gracefully if backend is not yet online during user demonstration
      return {
        success: false,
        error: err.name === "AbortError" 
          ? "Connection timed out. Selected server is busy. Try another server."
          : (err.message || "Could not reach gateway server.")
      };
    }
  }

  /**
   * Mock pairing request simulating realistic WhatsApp Baileys MD socket handshake
   */
  async _mockPairingRequest(serverId, fullPhoneNumber, onStep) {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    if (onStep) onStep("Connecting to node...", 20);
    await delay(350);

    if (onStep) onStep("Handshaking with WhatsApp Baileys protocol...", 50);
    await delay(450);

    if (onStep) onStep("Securing multi-device pairing key...", 80);
    await delay(400);

    // Generate standard WhatsApp 8-character format: XXXX-XXXX
    // Uses realistic alphanumeric character set excluding ambiguous letters (I, O, 0, 1)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let part1 = "";
    let part2 = "";

    // Brand prefix touches for Ahmad Tech
    const prefixes = ["AHMD", "TECH", "BOT9", "MD77", "AT24"];
    part1 = prefixes[Math.floor(Math.random() * prefixes.length)];

    for (let i = 0; i < 4; i++) {
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const pairingCode = `${part1}-${part2}`;

    if (onStep) onStep("Pairing code ready!", 100);
    await delay(200);

    return {
      success: true,
      code: pairingCode,
      serverId,
      expiresIn: this.config.security.codeExpirySeconds,
      timestamp: Date.now()
    };
  }

  /**
   * Ping / check server status
   */
  async checkServerHealth(serverId) {
    if (this.useMock) {
      const server = this.config.servers.find(s => s.id === serverId);
      const jitter = Math.floor(Math.random() * 8) - 4;
      return {
        serverId,
        online: true,
        ping: Math.max(12, (server ? server.ping : 35) + jitter),
        load: `${Math.floor(20 + Math.random() * 30)}%`
      };
    }

    try {
      const endpoint = `${this.baseUrl}${this.config.backend.endpoints.serverStatus}?id=${encodeURIComponent(serverId)}`;
      const res = await fetch(endpoint);
      return await res.json();
    } catch {
      return { serverId, online: false, ping: 999, load: "offline" };
    }
  }
}

window.AhmadTechApiClient = AhmadTechApiClient;
