// ==UserScript==
// @name         G Meet with Work Account Switcher
// @namespace    https://github.com/thenilesh/userscripts
// @version      2024-06-18
// @description  Automatically switch Google Meet to work account
// @author       https://github.com/thenilesh
// @match        https://meet.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // TODO: set work account based on meeting invite
    const workAuthUser = '2';

    const url = new URL(window.location.href);
    const authuserParam = url.searchParams.get('authuser');

    if (authuserParam !== workAuthUser) {
        // If not, append the authuser parameter for the work account and reload the page
        url.searchParams.set('authuser', workAuthUser);
        window.location.replace(url.href);
    }
})();