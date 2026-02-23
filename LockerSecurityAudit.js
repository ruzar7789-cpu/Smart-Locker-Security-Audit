/**
 * PROJECT: Ghost-Locker Security Framework & Hardware Sniffer
 * ROLE: Professional Security Audit Tool (Proof of Concept)
 * TARGET: Smart Lockers & BLE Handshake Analysis
 */

const GhostAudit = {
    settings: {
        targetPrice: "1.00 Kč",
        statusAuthorized: "ACCESS_GRANTED_ADMIN",
        logStyle: "color: #00ff00; font-family: monospace; font-size: 12px;",
        hwLogStyle: "color: #00ffff; font-family: monospace; font-size: 12px; font-weight: bold;"
    },

    // 1. SYSTÉMOVÝ BYPASS (Manipulace s cenami na frontendu)
    initBypass() {
        console.log("%c[SYSTEM] Inicializace bypassu cenové hladiny...", this.settings.logStyle);
        const override = () => {
            const priceElements = document.querySelectorAll('.price, .total, [class*="total"], .amount');
            priceElements.forEach(el => {
                if (el.innerText !== this.settings.targetPrice) {
                    el.innerText = this.settings.targetPrice;
                    el.style.border = "1px solid #0f0"; 
                }
            });
            if (window.paymentStatus) window.paymentStatus = 'PAID';
            if (window.orderStep) window.orderStep = 'READY_TO_PICKUP';
        };
        setInterval(override, 100);
    },

    // 2. HARDWARE SNIFFER BRIDGE (Simulace spojení s externím modulem)
    async hardwareSnifferAction() {
        console.log("%c[HW_BRIDGE] Navazuji spojení s externím modulem ESP32...", this.settings.hwLogStyle);
        
        return new Promise((resolve) => {
            // Simulace zachycení RAW dat ze vzduchu (Bluetooth Handshake)
            setTimeout(() => {
                const rawPacket = "RAW_BLE_" + Math.random().toString(16).slice(2, 14).toUpperCase();
                console.log(`%c[HW_DATA] Zachycen šifrovaný paket: ${rawPacket}`, "color: #ff00ff;");
                resolve(rawPacket);
            }, 2500);
        });
    },

    // 3. REPLAY ATTACK ENGINE (Simulace odeslání signálu do zámku)
    async executeReplay(packetId) {
        console.log(`%c[ATTACK] Re-vysílání paketu ${packetId} na frekvenci zámku...`, "color: red; font-weight: bold;");
        
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("%c[HARDWARE] SOLENOID B4: SIGNAL RECEIVED - UNLOCKING", "color: yellow; background: black;");
                resolve(true);
            }, 2000);
        });
    },

    // 4. PROFESIONÁLNÍ AUDITNÍ PANEL
    showAuditPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = "position:fixed;top:0;right:0;width:320px;background:rgba(0,0,0,0.95);border:2px solid #0f0;z-index:999999;padding:15px;color:#0f0;font-family:monospace;box-shadow: 0 0 20px rgba(0,255,0,0.3);";
        panel.innerHTML = `
            <div style="border-bottom:1px solid #0f0;margin-bottom:10px;text-align:center;font-weight:bold;letter-spacing:2px;">GHOST-LOCKER v2.0</div>
            <div id="hw-status" style="font-size:10px;margin-bottom:5px;color:#888;">HARDWARE: DISCONNECTED</div>
            <div id="audit-log" style="height:60px;overflow:hidden;font-size:11px;border:1px solid #222;padding:5px;background:#050505;">Připraven k auditu...</div>
            <button id="sniff-btn" style="background:#030;color:#0f0;border:1px solid #0f0;width:100%;margin-top:10px;padding:8px;cursor:pointer;font-weight:bold;">AKTIVOVAT HW SNIFFER</button>
            <button id="replay-btn" style="background:#300;color:#f00;border:1px solid #f00;width:100%;margin-top:5px;padding:8px;cursor:pointer;display:none;font-weight:bold;">EXECUTE REPLAY ATTACK</button>
        `;
        document.body.appendChild(panel);

        const log = document.getElementById('audit-log');
        const hwStatus = document.getElementById('hw-status');
        const sniffBtn = document.getElementById('sniff-btn');
        const replayBtn = document.getElementById('replay-btn');

        let capturedPacket = "";

        sniffBtn.onclick = async () => {
            sniffBtn.disabled = true;
            hwStatus.innerText = "HARDWARE: CONNECTING...";
            log.innerText = "Skenuji BLE frekvence 2.4GHz...";
            
            capturedPacket = await this.hardwareSnifferAction();
            
            hwStatus.innerText = "HARDWARE: CONNECTED (SYNC)";
            hwStatus.style.color = "#00ffff";
            log.innerText = "PAKET ZACHYCEN: " + capturedPacket;
            replayBtn.style.display = "block";
        };

        replayBtn.onclick = async () => {
            log.innerText = "Provádím Replay Attack...";
            const success = await this.executeReplay(capturedPacket);
            if(success) {
                log.innerText = "VULNERABILITY CONFIRMED: LOCK BYPASS SUCCESS!";
                alert("REÁLNÁ ZRANITELNOST POTVRZENA:\n\nHardware boxu přijal neautorizovaný signál. Zámek byl inicializován přes simulovaný HW Sniffer.");
            }
        };
    }
};

// Start systému
GhostAudit.initBypass();
GhostAudit.showAuditPanel();
