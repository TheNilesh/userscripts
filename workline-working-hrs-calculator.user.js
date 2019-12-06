// ==UserScript==
// @name         Workline WorkingHrs Calculator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This script adds label on Workline HRMS View Attendance page to show number of working hours completed and expected working hours.
// @author       Nilesh Akhade
// @match        https://app17.workline.hr/ams/AmsViewEmployeeCalenderEmp.aspx
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var month = new Array();
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Sep";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";

    function padZero(num) {
        if (num <= 9 && num >= 0) {
            return '0' + num;
        }
        return '' + num;
    }

    function itsYesterday(date) {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        var sYesterday = padZero(d.getDate()) + '-' + month[d.getMonth()] + '-' + d.getFullYear();
        return date === sYesterday;
    }

    function itsToday(date) {
        var d = new Date();
        var sToday = padZero(d.getDate()) + '-' + month[d.getMonth()] + '-' + d.getFullYear();
        return date === sToday;
    }

    function areYouInOffice() {
        return true;//todo:implement
    }

    function currentTime() {
        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        return padZero(h) + ':' + padZero(m);
    }

    function splitHrsMins(timeDuration) {
        var td = timeDuration.split(':');
        return {
            hours: parseInt(td[0]),
            minutes: parseInt(td[1])
        };
    }

    function timeDiff(timeG, timeL) {
        var tG = splitHrsMins(timeG);
        var tL = splitHrsMins(timeL);
        var diffMin = tG.minutes - tL.minutes;
        var diffHr = tG.hours - tL.hours;
        if(diffMin < 0) {
            diffHr=-1;
            diffMin=60+diffMin;
        }
        return padZero(diffHr) + ':' + padZero(diffMin);
    }

    function calculateWorkHrs(response, lastMonth) {
        var thisMonth = !lastMonth;
        var pResp = '<div>' + response + '</div>';
        //todo: optimize pResp using parseHtml()
        //todo: Write common mapper function and re-use it
        var dates = $(pResp).find("td[data-title='Date']").map(function () { return this.innerText.trim(); }).get();
        var shifts = $(pResp).find("td[data-title='Shift']").map(function () { return this.innerText.trim(); }).get();
        var logins = $(pResp).find("td[data-title='Login']").map(function () { return this.innerText.trim(); }).get();
        var logouts = $(pResp).find("td[data-title='Logout']").map(function () { return this.innerText.trim(); }).get();
        var workingHrs = $(pResp).find("td[data-title='Working Hrs.']").map(function () { return this.innerText.trim(); }).get();
        var leavesPending = $(pResp).find("td[data-title='Leave Pending']").map(function () { return this.innerText.trim(); }).get();
        var leavesApproved = $(pResp).find("td[data-title='Leave Approved']").map(function () { return this.innerText.trim(); }).get();
        //Consider records from 21st of the last month
        if (lastMonth) {
            dates = dates.slice(20);
            shifts = shifts.slice(20);
            workingHrs = workingHrs.slice(20);
            leavesPending = leavesPending.slice(20);
            leavesApproved = leavesApproved.slice(20);
        } else {
            //Consider records upto 20 of this month
            var recordsLen = dates.length;
            if (recordsLen > 20) {
                dates = dates.slice(0, 20);
                shifts = shifts.slice(0, 20);
                workingHrs = workingHrs.slice(0, 20);
                leavesPending = leavesPending.slice(0, 20);
                leavesApproved = leavesApproved.slice(0, 20);
            }
        }

        var wHours = 0, wMinutes = 0, ewDays = 0;
        var i;
        for (i = 0; i < dates.length; i++) {
            if (shifts[i] === 'GS' && leavesPending[i] === '' && leavesApproved[i] === '') {

                if(workingHrs[i] === '') {
                    debugger;
                    if(itsYesterday(dates[i])) {
                        workingHrs[i] = timeDiff(logouts[i], logins[i]); //For some reason workingHrs is calculated couple of days later
                    } else if(itsToday(dates[i])) {
                        if(areYouInOffice()) {
                            logouts[i] = currentTime();
                            workingHrs[i] = timeDiff(logouts[i], logins[i]);
                        } else {
                            if(logins[i] == '') {
                                //not arrived at office
                                continue;
                            }
                            workingHrs[i] = timeDiff(logouts[i], logins[i]);
                        }
                    } else {
                        // Possibly absent
                        workingHrs[i] = '00:00';
                    }
                }
                var hrsMins = splitHrsMins(workingHrs[i]);
                wHours += hrsMins.hours;
                wMinutes += hrsMins.minutes;
                ewDays++;
            }
        }
        return {
            ewDays: ewDays,
            wHours: wHours,
            wMinutes: wMinutes
        };
    }

    $(document).ajaxSuccess(function (event, xhr, settings) {
        if (settings.url.includes("AMSViewEmployeeCalendarSubEmp.aspx")) {
            var workHrsThisMonth = calculateWorkHrs(xhr.responseText, false); //lastmonth false because this is current month

            //Now fetch the last month's workHrs
            var pagename = $('#HidPageName').val();
            var UC = $('#HidUsercode').val();
            var passDate = $('#HidPDate').val();
            //TODO: How do we ensure passDate is not undefined? It is added to DOM after success() of original caller is executed for this month
            if (passDate) {
                $.ajax({
                    global: false, //so that this request is not captured by ajaxSuccess() above
                    url: '/AMS/AMSViewEmployeeCalendarSub' + pagename + '.aspx?FDate=' + passDate + '&Flag=P&UC=' + UC,
                    success: function (response) {
                        debugger;
                        var workHrsLastMonth = calculateWorkHrs(response, true);
                        var workHrsTotal = {
                            ewDays: workHrsLastMonth.ewDays + workHrsThisMonth.ewDays,      // expected working days
                            wHours: workHrsLastMonth.wHours + workHrsThisMonth.wHours,      // actual working hours
                            wMinutes: workHrsLastMonth.wMinutes + workHrsThisMonth.wMinutes // actual working hours
                        };

                        //convert > 60 minutes to hours
                        var minutes = workHrsTotal.wMinutes;
                        workHrsTotal.wHours += Math.floor(minutes / 60);
                        workHrsTotal.wMinutes = minutes % 60;
                        console.log(workHrsTotal);
                        var expectedWorkHrs = workHrsTotal.ewDays * 8; //8 hrs average expected

                        //Add an element on DOM to show workHrs
                        if ($('#avg-time').length) {
                            $('#avg-time').fadeOut('fast', function () {
                                $('#avg-time').html('<i class="fa fa-clock-o"></i> ' + workHrsTotal.wHours + ':' + padZero(workHrsTotal.wMinutes) + ' / ' + expectedWorkHrs + ':00 </button>');
                                $('#avg-time').fadeIn('fast');
                            });
                        } else {
                            $('.col-md-10.text-right.print-none').prepend('<button id="avg-time" type="button" class="btn btn-sm btn-danger" style="padding:5px;"> <i class="fa fa-clock-o"></i> ' + workHrsTotal.wHours + ':' + padZero(workHrsTotal.wMinutes) + ' / ' + expectedWorkHrs + ':00 </button>');
                        }

                    }
                });
            } else {
                console.log('We dont know previous month because #HidPDate not found in dom');
            }
        }
    });
})();
