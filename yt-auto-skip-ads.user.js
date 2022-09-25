// ==UserScript==
// @name         Auto Skip Ads
// @namespace    https://github.com/TheNilesh/userscripts
// @version      0.1
// @description  Detects Skip Ad button on youtube video, and clicks it automatically.
// @author       You
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    // observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    // ytp-ad-skip-button ytp-button
    waitForElm('.ytp-ad-skip-button').then((elm) => {
        console.log('Ad skip button detected');
        var skipBtn = document.querySelector('.ytp-ad-skip-button');
        skipBtn.click();
    });
})();