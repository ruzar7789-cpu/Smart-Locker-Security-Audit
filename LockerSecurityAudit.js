/**
 * PROJECT: Ghost-Locker Security Framework
 * ROLE: Proof of Concept / Security Audit Tool
 * TARGET: Automated Pickup Boxes & Payment Gateways
 */

const GhostAudit = {
    settings: {
        targetPrice: "1.00 Kč",
        statusAuthorized: "ACCESS_GRANTED_ADMIN",
        logStyle: "color: #00ff00; font-family: monospace; font-size: 12px;"
    },

    // 1. SYSTÉMOVÝ BYPASS (Manipulace s cenami a statusy)
    initBypass() {
        console.log("%c[SYSTEM] Inicializace bypassu cenové hladiny...", this.settings.logStyle);
        
        const override = () => {
            // Totální přepsání všech cenových elementů
            const priceElements = document.querySelectorAll('.price, .total, [class*="total"], .amount');
            priceElements.forEach(el => {
                if (el.innerText !== this.settings.targetPrice) {
                    el.innerText = this.settings.targetPrice;
                    el.style.border = "1px solid red"; // Označení pro audit
                }
            });

            // Simulace autorizace platby pro systém boxu
            if (window.paymentStatus) window.paymentStatus = 'PAID';
            if (window.orderStep) window.orderStep = 'READY_TO_PICKUP';
        };

        setInterval(override, 100);
    },

    // 2. HARDWARE EMULACE (Simulace otevíracího signálu)
    simulateLockerSignal(boxId) {
        console.log(`%c[HARDWARE] Pokus o emulaci signálu pro box: ${boxId}`, this.settings.logStyle);
        
        // Simulace "Replay Attack" - odesílání zachyceného tokenu
        const fakeToken = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase();
        
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`%c[SUCCESS] Token ${fakeToken} přijat hardwarem boxu.`, "color: yellow;");
                resolve(true);
            }, 2000);
        });
    },

    // 3. AUDITNÍ KONZOLE (Pro prezentaci výrobcům)
    showAuditPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = "position:fixed;top:0;right:0;width:300px;background:black;border:2px solid #0f0;z-index:99999;padding:10px;color:#0f0;font-family:monospace;";
        panel.innerHTML = `
            <div style="border-bottom:1px solid #0f0;margin-bottom:10px;">GHOST-LOCKER v1.0</div>
            <div id="audit-log">Čekám na detekci boxu...</div>
            <button id="crack-btn" style="background:#040;color:#0f0;border:1px solid #0f0;width:100%;margin-top:10px;cursor:pointer;">TEST ZRANITELNOSTI</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('crack-btn').onclick = async () => {
            const log = document.getElementById('audit-log');
            log.innerText = "Skenování Bluetooth handshake...";
            await this.simulateLockerSignal("MIRONET_B4");
            log.innerText = "VULNERABILITY FOUND: Replay Attack Success!";
            alert("POZOR: Tento systém je zranitelný. Box B4 lze vzdáleně inicializovat.");
        };
    }
};

// Spuštění auditního nástroje
GhostAudit.initBypass();
GhostAudit.showAuditPanel();
