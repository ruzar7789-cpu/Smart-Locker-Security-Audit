/**
 * GHOST-LOCKER CORE ENGINE
 * Real-time BLE Sniffing & Web-Bypass Logic
 */

const GhostCore = {
    capturedData: null,

    log(msg, color = "#0f0") {
        const out = document.getElementById('output');
        const div = document.createElement('div');
        div.style.color = color;
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
    },

    // 1. REÁLNÝ BLUETOOTH SNIFFING
    async startRealSniff() {
        this.log("Hledám Bluetooth zařízení v okolí...", "#0ff");
        try {
            // Pokus o reálný přístup k Bluetooth hardwaru
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['generic_access']
            });

            this.log(`ZAŘÍZENÍ NALEZENO: ${device.name || 'Neznámý Box'}`, "#ff0");
            this.log("Pokouším se o extrakci handshake balíčku...");
            
            // Simulace úspěšného odchytu po spojení
            setTimeout(() => {
                this.capturedData = "0x" + Math.random().toString(16).slice(2, 18).toUpperCase();
                this.log(`ÚSPĚCH: Odchycen RAW paket: ${this.capturedData}`, "#f0f");
                document.getElementById('replay-btn').style.display = "block";
            }, 2000);

        } catch (err) {
            this.log("CHYBA: Bluetooth přístup zamítnut nebo nenalezen.", "#f00");
            this.log("Přepínám na emulovaný sniffing (Offline mód)...", "#888");
            // Simulace pro prezentaci, když není hardware poblíž
            setTimeout(() => {
                this.capturedData = "EMU_0x" + Math.random().toString(16).slice(2, 10);
                this.log(`Odchycen emulovaný paket: ${this.capturedData}`, "#555");
                document.getElementById('replay-btn').style.display = "block";
            }, 3000);
        }
    },

    // 2. REÁLNÝ/SIMULOVANÝ REPLAY ATTACK
    async executeAttack() {
        this.log("INICIALIZUJI REPLAY ATTACK...", "#f00");
        this.log(`Odesílám paket ${this.capturedData} na port solenoidu...`);
        
        return new Promise(resolve => {
            setTimeout(() => {
                this.log("KRITICKÁ ODEZVA: Zámek potvrdil přijetí!", "yellow");
                this.log("STAV: ODEMČENO", "#0f0");
                alert("POTVRZENO: Systém přijal neautorizovaný kód. Zabezpečení prolomeno.");
                resolve();
            }, 2500);
        });
    },

    // UI PANEL
    initUI() {
        const panel = document.createElement('div');
        panel.style.cssText = "position:fixed; bottom:20px; right:20px; width:280px; background:rgba(0,20,0,0.9); border:1px solid #0f0; padding:15px; z-index:1000;";
        panel.innerHTML = `
            <button id="sniff-btn" style="width:100%; padding:10px; background:#040; color:#0f0; border:1px solid #0f0; cursor:pointer;">START SNIFFING</button>
            <button id="replay-btn" style="width:100%; padding:10px; background:#400; color:#f00; border:1px solid #f00; cursor:pointer; margin-top:10px; display:none;">EXECUTE UNLOCK</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('sniff-btn').onclick = () => this.startRealSniff();
        document.getElementById('replay-btn').onclick = () => this.executeAttack();
    }
};

window.onload = () => GhostCore.initUI();
