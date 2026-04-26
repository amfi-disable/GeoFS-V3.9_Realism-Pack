(function() {
    'use strict';

    // Shared HUD Manager
    function ensureSharedHUD() {
        if (!globalThis.hudProVisible) globalThis.hudProVisible = true;
        if (globalThis.hudProMinimized === undefined) globalThis.hudProMinimized = false;

        // Inject Core HUD CSS
        if (!document.getElementById('hudModularStyles')) {
            const style = document.createElement('style');
            style.id = 'hudModularStyles';
            style.textContent = `
                .unified-tabs { display: flex; width: 100%; gap: 2px; margin-bottom: 5px; }
                .unified-tab { flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 10px; padding: 5px 2px; cursor: pointer; transition: all 0.2s; font-family: sans-serif; font-weight: bold; text-transform: uppercase; }
                .unified-tab:hover { background: rgba(255,255,255,0.2); }
                .unified-tab.active { background: rgba(100,200,255,0.3); border-color: #64c8ff; color: #64c8ff; }
                .unified-content { display: none; }
                .unified-content.active { display: block; }
                .unified-content.unified-grid.active { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 10px; }
                #flightDataDisplay.hud-minimized { display: none !important; }
            `;
            document.head.appendChild(style);
        }

        if (!document.getElementById('hudMinimizeBtn')) {
            const btn = document.createElement('div');
            btn.id = 'hudMinimizeBtn';
            btn.innerHTML = '▣';
            btn.title = 'Toggle Info Display';
            btn.style.left = '0px'; 
            btn.style.top = '50%'; 
            btn.style.transform = 'translateY(-50%)';
            btn.onclick = () => {
                globalThis.hudProMinimized = !globalThis.hudProMinimized;
                document.getElementById('flightDataDisplay')?.classList.toggle('hud-minimized', globalThis.hudProMinimized);
                btn.innerHTML = globalThis.hudProMinimized ? '◈' : '▣';
            };
            document.body.appendChild(btn);
            if (window.initAddonDraggable) window.initAddonDraggable(btn, 'geofs-addonpack-hud-icon-pos');
        }

        if (!document.getElementById('flightDataDisplay')) {
            const panel = document.createElement('div');
            panel.id = 'flightDataDisplay';
            panel.innerHTML = `
                <div id="masterCaution" style="display:none; grid-column: 1 / -1; background: #ef4444; color: #fff; text-align: center; font-weight: 900; padding: 4px; border-radius: 6px; margin-bottom: 8px; animation: cautionPulse 1s infinite; letter-spacing: 2px; font-size: 10px; border: 1px solid #fff;">MASTER CAUTION</div>
                <div class="hud-drag-handle" style="font-size: 9px; letter-spacing: 2px; color: rgba(100,200,255,0.6);">GEOFS HUD PRO v3.9</div>
                <div class="unified-tabs" id="hud-unified-tabs"></div>
            `;
            document.body.appendChild(panel);
            if (window.initAddonDraggable) window.initAddonDraggable(panel, 'geofs-addonpack-hud-pos');
        }

        if (!window.switchHUDProTab) {
            window.switchHUDProTab = function(activeTabId) {
                globalThis.activeHudProTab = activeTabId;
                document.querySelectorAll('#flightDataDisplay .unified-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('#flightDataDisplay .unified-content').forEach(c => c.classList.remove('active'));
                
                const tabBtn = document.getElementById(`tab-btn-${activeTabId}`);
                const tabContent = document.getElementById(`tab-content-${activeTabId}`);
                if (tabBtn) tabBtn.classList.add('active');
                if (tabContent) tabContent.classList.add('active');
                
                globalThis.hudProMinimized = false;
                document.getElementById('flightDataDisplay')?.classList.remove('hud-minimized');
                const btn = document.getElementById('hudMinimizeBtn');
                if (btn) btn.innerHTML = '▣';
            };
        }

        // Visibility Controller
        if (!window._hudVisibilityLoop) {
            window._hudVisibilityLoop = setInterval(() => {
                const btn = document.getElementById('hudMinimizeBtn');
                const panel = document.getElementById('flightDataDisplay');
                if (!btn || !panel) return;

                const isVisible = globalThis.hudProVisible !== false;
                const isMinimized = globalThis.hudProMinimized === true;
                const isPaused = typeof geofs !== 'undefined' && geofs.isPaused && geofs.isPaused();

                btn.style.display = isVisible ? 'flex' : 'none';
                
                if (!isVisible || isMinimized || isPaused) {
                    panel.style.display = 'none';
                } else {
                    panel.style.display = 'grid';
                }
            }, 100);
        }
    }

    function registerHUDTab(tabId, label, contentHTML, isGrid) {
        ensureSharedHUD();
        const tabsContainer = document.getElementById('hud-unified-tabs');
        if (!document.getElementById(`tab-btn-${tabId}`)) {
            const btn = document.createElement('button');
            btn.id = `tab-btn-${tabId}`;
            btn.className = 'unified-tab';
            btn.textContent = label;
            
            // Tab ordering: ID, Fuel, Checks, Realism
            const tabOrder = { 'id': 1, 'fuel': 2, 'checks': 3, 'realism': 4 };
            btn.style.order = tabOrder[tabId] || 99;

            btn.onclick = () => window.switchHUDProTab(tabId);
            tabsContainer.appendChild(btn);
            console.log(`[HUD Shared] Registered tab: ${tabId}`);
        }

        const panel = document.getElementById('flightDataDisplay');
        if (!document.getElementById(`tab-content-${tabId}`)) {
            const content = document.createElement('div');
            content.id = `tab-content-${tabId}`;
            content.className = `unified-content ${isGrid ? 'unified-grid' : ''}`;
            content.innerHTML = contentHTML;
            panel.appendChild(content);
        }

        setTimeout(() => {
            const tabs = Array.from(document.querySelectorAll('#hud-unified-tabs .unified-tab'));
            tabs.sort((a, b) => parseInt(a.style.order) - parseInt(b.style.order));
            const firstTab = tabs[0];
            if (firstTab && !document.querySelector('.unified-tab.active')) {
                window.switchHUDProTab(firstTab.id.replace('tab-btn-', ''));
            }
        }, 500);
    }

    window.initRealismPackPro = function() {
        if (window.realismPackPro) return;

        console.log("[GeoFS-V3.9_Realism-Pack] Initializing Advanced Physics Suite...");

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
                
                registerHUDTab('realism', 'REALISM', realismHTML, false);

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