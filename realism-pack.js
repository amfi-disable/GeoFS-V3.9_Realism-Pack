(function() {
    'use strict';

    window.initRealismPackPro = function() {
        if (window.realismPackPro) return;

        console.log("[GeoFS-V3.9_Realism-Pack] Initializing Advanced Physics Suite...");

        // Default settings - respect HUD Pro if already defined
        window.realismSettings = window.realismSettings || {
            gBreath: true,
            cameraShake: true,
            blackout: true,
            propwash: true,
            wingflex: true
        };

        const suite = {
            init: function() {
                this.initDashboard();
                this.initGSystems();
                this.initCameraSystems();
                this.initPropwash();
                console.log("[GeoFS-V3.9_Realism-Pack] Realism Pack Pro successfully initialized.");
            },

            initDashboard: function() {
                // Only create the standalone dashboard if the HUD Pro isn't already handling the UI
                if (document.getElementById("realismCard") || document.getElementById("hud-pro-main-container")) {
                    console.log("[GeoFS-V3.9_Realism-Pack] External UI detected (HUD Pro). Skipping standalone dashboard.");
                    return;
                }
                
                console.log("[GeoFS-V3.9_Realism-Pack] Building standalone physics dashboard.");
                const card = document.createElement("div");
                card.id = "realismCard";
                card.className = "addonpack-card";
                card.innerHTML = `
                    <div class="addonpack-card-header">
                        <span>💎 GeoFS-V3.9_Realism-Pack</span>
                        <button class="close-btn" onclick="document.getElementById('realismCard').classList.remove('active')">✕</button>
                    </div>
                    <div class="addonpack-card-content">
                        ${this.createToggle("G-Breathing", "gBreath")}
                        ${this.createToggle("Camera Shake", "cameraShake")}
                        ${this.createToggle("G-Blackout", "blackout")}
                        ${this.createToggle("Propwash", "propwash")}
                        <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 10px; color: #888;">Load Factor</span>
                                <span id="phys-g-val" style="font-size: 12px; font-weight: bold; color: #10b981;">1.0 G</span>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(card);
                if (window.initAddonDraggable) window.initAddonDraggable(card);

                setInterval(() => {
                    if (!geofs.animation.values) return;
                    const g = geofs.animation.values.loadFactor || 1;
                    const el = document.getElementById("phys-g-val");
                    if (el) {
                        el.textContent = g.toFixed(1) + " G";
                        el.style.color = g > 6 ? "#ef4444" : (g > 4 ? "#f59e0b" : "#10b981");
                    }
                }, 200);
            },

            createToggle: function(label, key) {
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 12px;">${label}</span>
                        <input type="checkbox" ${window.realismSettings[key] ? 'checked' : ''} onclick="window.realismSettings['${key}'] = this.checked">
                    </div>
                `;
            },

            initGSystems: function() {
                console.log("[GeoFS-V3.9_Realism-Pack] G-Systems (Audio/Blackout) monitoring active.");
                // G-Breathing Audio
                setInterval(() => {
                    if (window.realismSettings.gBreath && geofs.animation.values.loadFactor >= 3 && !geofs.isPaused()) {
                        const breath = new Audio("https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/03_GeoFS-V3.9_Addon-Pack/main/Resources/Addons/realism_addon/audio/cutgbreath.mp3");
                        breath.volume = 0.5;
                        breath.play();
                    }
                }, 3500);

                // Blackout Shader Logic (Simplified)
                let boTimer = 0;
                setInterval(() => {
                    if (!window.realismSettings.blackout || !geofs.aircraft.instance) return;
                    const g = geofs.animation.values.loadFactor;
                    if (g > 9 && geofs.animation.values.view === "cockpit") {
                        boTimer = Math.min(1, boTimer + 0.01);
                    } else {
                        boTimer = Math.max(0, boTimer - 0.005);
                    }
                    if (geofs.fx.overg && geofs.fx.overg.shader) {
                        geofs.fx.overg.shader.uniforms.strength = boTimer;
                    }
                }, 50);
            },

            initCameraSystems: function() {
                console.log("[GeoFS-V3.9_Realism-Pack] Camera dynamics monitoring active.");
                // Camera Shake
                setInterval(() => {
                    if (window.realismSettings.cameraShake && geofs.animation.values.aoa >= 10 && !geofs.isPaused()) {
                        const s = 0.0001 * geofs.animation.values.aoa * Math.random();
                        geofs.camera.translate(s, s, s);
                        setTimeout(() => geofs.camera.translate(-s, -s, -s), 5);
                    }
                }, 10);
            },

            initPropwash: function() {
                console.log("[GeoFS-V3.9_Realism-Pack] Propwash calculation loop active.");
                const PWAircraft = new Set([1022, 1026, 14, 16, 2, 8, 13]); // Simplified list
                setInterval(() => {
                    if (!window.realismSettings.propwash || !geofs.aircraft.instance) return;
                    if (PWAircraft.has(Number(geofs.aircraft.instance.id))) {
                        geofs.aircraft.instance.airfoils.forEach(e => {
                            e.propwash = (e.forceDirection === 2) ? 0.005 : 0.01;
                        });
                    }
                }, 100);
            }
        };

        window.realismPackPro = suite;
        suite.init();
    };

    if (window.SafeInit) {
        window.SafeInit('GeoFS-V3.9_Realism-Pack', window.initRealismPackPro);
    } else {
        window.initRealismPackPro();
    }
})();
