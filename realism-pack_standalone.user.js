// ==UserScript==
// @name         GeoFS-V3.9_Realism-Pack
// @namespace    http://tampermonkey.net/
// @version      1.0.0-Alpha
// @description  Advanced flight physics and environmental effects for GeoFS.
// @author       AwesomeOddEven-NightKeys-LunarBlink
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Design-System/main/design-system_standalone.user.js
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Core-Library/main/core-library_standalone.user.js
// @grant        none
// @updateURL    https://raw.githubusercontent.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Realism-Pack/main/realism-pack_standalone.user.js
// @downloadURL  https://raw.githubusercontent.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Realism-Pack/main/realism-pack_standalone.user.js
// ==/UserScript==

(function() {
    'use strict';
    const physicsUrl = 'https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Realism-Pack/main/realism-pack.js';

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
