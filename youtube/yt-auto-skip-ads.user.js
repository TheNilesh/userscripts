// ==UserScript==
// @name         Auto Skip Ads
// @namespace    https://github.com/TheNilesh/userscripts
// @version      0.2
// @description  Detects Skip Ad button on youtube video, and clicks it automatically.
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                var elem = document.querySelector(selector)
                elem.setAttribute("style", "background-color:red;");
                let randomDelay = Math.random() * 3;
                setTimeout(elem.click(), randomDelay);
                // return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    var elem = document.querySelector(selector)
                    elem.setAttribute("style", "background-color:red;");
                    let randomDelay = Math.random() * 3;
                    setTimeout(elem.click(), randomDelay);
                    // resolve(document.querySelector(selector));
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
    // ytp-ad-skip-button-modern ytp-button
    waitForElm('.ytp-ad-skip-button-modern').then((elm) => {
        console.log('This promise will never resolve');
    });
})();
