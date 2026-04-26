(function() {
    'use strict';

    window.initRealismPackPro = function() {
        if (window.realismPackPro) return;

        console.log("[GeoFS-V3.9_Realism-Pack] Initializing Advanced Physics Suite...");

        if (typeof window.registerHUDTab !== 'function') {
            console.error("[GeoFS-V3.9_Realism-Pack] FATAL: window.registerHUDTab not found! Core Library might be outdated.");
            return;
        }

        window.realismSettings = window.realismSettings || {
            gBreath: true, cameraShake: true, blackout: true, propwash: true, fbw: true, wingflex: true
        };
        
        window.toggleRealismParam = function(key) {
            window.realismSettings[key] = !window.realismSettings[key];
            const tgl = document.getElementById(`toggle_${key}`);
            if (tgl) {
                tgl.style.background = window.realismSettings[key] ? '#3b82f6' : 'rgba(255,255,255,0.1)';
                tgl.firstElementChild.style.left = window.realismSettings[key] ? '20px' : '2px';
            }
        };

        function makeToggle(label, key) {
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.85rem; color: rgba(255,255,255,0.9);">${label}</span>
                    <div onclick="window.toggleRealismParam('${key}')" id="toggle_${key}" style="width: 36px; height: 18px; background: ${window.realismSettings[key] ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; border-radius: 9px; cursor: pointer; position: relative; transition: all 0.3s;">
                        <div style="width: 14px; height: 14px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: ${window.realismSettings[key] ? '20px' : '2px'}; transition: all 0.3s;"></div>
                    </div>
                </div>`;
        }

        const suite = {
            init: function() {
                this.initDashboard();
                this.initGSystems();
                this.initCameraSystems();
                this.initPropwash();
                console.log("[GeoFS-V3.9_Realism-Pack] Realism Pack Pro successfully initialized.");
            },

            initDashboard: function() {
                const realismHTML = `
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${makeToggle("G-Breathing & Sounds", "gBreath")}
                        ${makeToggle("Dynamic Camera Shake", "cameraShake")}
                        ${makeToggle("High-G Blackout", "blackout")}
                        ${makeToggle("Engine Propwash", "propwash")}
                        ${makeToggle("Fly-By-Wire (Jets)", "fbw")}
                        ${makeToggle("Advanced Wingflex", "wingflex")}
                        <div style="margin-top: 10px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span class="stat-label">Current Load</span>
                                <span id="realismGVal" class="stat-value highlight" style="font-size: 1.1rem;">1.0 G</span>
                            </div>
                            <div style="width: 100%; height: 4px; background: rgba(0,0,0,0.3); border-radius: 2px; overflow: hidden;">
                                <div id="realismGBar" style="width: 10%; height: 100%; background: #3b82f6; transition: width 0.1s linear;"></div>
                            </div>
                        </div>
                    </div>
                `;
                
                window.registerHUDTab('realism', 'REALISM', realismHTML, false);

                setInterval(() => {
                    if (!geofs.animation.values) return;
                    const loadFactor = geofs.animation.values.loadFactor ? geofs.animation.values.loadFactor.toFixed(1) : "1.0";
                    const realismGVal = document.getElementById("realismGVal");
                    const realismGBar = document.getElementById("realismGBar");
                    if (realismGVal) realismGVal.textContent = loadFactor + " G";
                    if (realismGBar) {
                        const gRatio = Math.min(100, (parseFloat(loadFactor) / 9) * 100);
                        realismGBar.style.width = gRatio + "%";
                    }
                }, 100);
            },

            initGSystems: function() {
                setInterval(() => {
                    if (window.realismSettings.gBreath && geofs.animation.values.loadFactor >= 3 && !geofs.isPaused()) {
                        const breath = new Audio("https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/03_GeoFS-V3.9_Addon-Pack/main/Resources/Addons/realism_addon/audio/cutgbreath.mp3");
                        breath.volume = 0.5; breath.play();
                    }
                }, 3500);

                let boTimer = 0;
                setInterval(() => {
                    if (!window.realismSettings.blackout || !geofs.aircraft.instance) return;
                    const g = geofs.animation.values.loadFactor;
                    if (g > 9 && geofs.animation.values.view === "cockpit") boTimer = Math.min(1, boTimer + 0.01);
                    else boTimer = Math.max(0, boTimer - 0.005);
                    if (geofs.fx.overg && geofs.fx.overg.shader) geofs.fx.overg.shader.uniforms.strength = boTimer;
                }, 50);
            },

            initCameraSystems: function() {
                setInterval(() => {
                    if (window.realismSettings.cameraShake && geofs.animation.values.aoa >= 10 && !geofs.isPaused()) {
                        const s = 0.0001 * geofs.animation.values.aoa * Math.random();
                        geofs.camera.translate(s, s, s);
                        setTimeout(() => geofs.camera.translate(-s, -s, -s), 5);
                    }
                }, 10);
            },

            initPropwash: function() {
                const PWAircraft = new Set([1022, 1026, 14, 16, 2, 8, 13]);
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