// ==UserScript==
// @name         GeoFS-V3.9_Realism-Pack
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Advanced flight physics and environmental effects for GeoFS.
// @author       AwesomeOddEven-NightKeys-LunarBlink
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Design-System/main/standalone.user.js
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Core-Library/main/standalone.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const physicsUrl = 'https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Realism-Pack/main/src/physics.js';

    function loadRealismPackPro() {
        if (window.realismPackPro) return;
        const script = document.createElement('script');
        script.src = physicsUrl;
        document.head.appendChild(script);
        console.log('[GeoFS-V3.9_Realism-Pack] Standalone module script injected.');
    }

    // Wait for foundations then load
    const checker = setInterval(() => {
        if (window.SafeInit && document.getElementById('geofs-addon-design-system')) {
            clearInterval(checker);
            console.log('[GeoFS-V3.9_Realism-Pack] Foundations detected. Booting Pro Physics...');
            loadRealismPackPro();
        }
    }, 500);
})();
