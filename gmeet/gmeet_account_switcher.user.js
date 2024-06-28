// ==UserScript==
// @name         Google Meet Account Switcher
// @namespace    https://github.com/thenilesh/userscripts
// @version      2024-06-18
// @description  Automatically switch to the Google account that was invited to the Google Meet meeting.
// @author       https://github.com/thenilesh
// @match        https://meet.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Total number of Google accounts
    const accountsCount = 3;

    function switchAccount(authUser) {
        const url = new URL(window.location.href);
        url.searchParams.set('authuser', authUser);
        window.location.replace(url.href);
    }

    function checkJoinButtons() {
        const spanElements = document.querySelectorAll('span[jsname="V67aGc"][class="VfPpkd-vQzf8d"]');
        // Switch to the below line if the above line doesn't work
        // const spanElements = document.querySelectorAll('span');

        for (const span of spanElements) {
            switch (span.innerText) {
                case 'Ask to join':
                    // console.log('Ask to join button found');
                    return false;
                case 'Join and use a phone for audio':
                    //console.log('Join now button found');
                    return true;
            }
        }

        console.log('No matching buttons found');
        return null;
    }

    function findInvitedAccount() {
        const url = new URL(window.location.href);
        let currentAuthUser = parseInt(url.searchParams.get('authuser')) || 0;

        const checkInterval = setInterval(() => {
            const joinButtonFound = checkJoinButtons();

            if (joinButtonFound === true) {
                clearInterval(checkInterval);
                return;
            } else if (joinButtonFound === false) {
                currentAuthUser++;
                if (currentAuthUser <= accountsCount) {
                    switchAccount(currentAuthUser);
                } else {
                    clearInterval(checkInterval);
                }
            }
        }, 500);
    }

    findInvitedAccount();
})();
