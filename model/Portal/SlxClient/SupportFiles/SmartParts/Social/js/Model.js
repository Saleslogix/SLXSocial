/*
* Data objects
*/
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/string', 'dojo/i18n!./nls/Resources'], function (declare, lang, djString, Resources) {
    var User = declare(null, {
        name: null,
        description: null,
        imageUrl: null,
        url: null,

        constructor: function (values) {
            lang.mixin(this, values);
        }
    });
    var Status = declare(null, {
        id: null,
        subject: null,
        text: null,
        user: null,
        postdate: null,
        icon: null,   // different icons for different types of feed
        url: null,    // direct link to the post

        constructor: function (values) {
            lang.mixin(this, values);
        },

        getTextAsHtml: function () {
            // retrieve text with URLs hyperlinked
            return this.text;
        },

        getPostDatePretty: function () {
            return this._prettyDate(this.postdate);
        },


        // Takes an ISO time and returns a string representing how
        // long ago the date represents.
        _prettyDate: function prettyDate(time) {
            //var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
            var date = new Date(time),
		    diff = (((new Date()).getTime() - date.getTime()) / 1000),
		    day_diff = Math.floor(diff / 86400);

            if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
                return time ? time.toLocaleString() : '';

            return day_diff == 0 && (
            // TODO: localize
			    diff < 60 && Resources.justNowText ||
			    diff < 120 && Resources.oneMinuteAgoText ||
			    diff < 3600 && Math.floor(diff / 60) + " " + Resources.minutesAgoText ||
			    diff < 7200 && Resources.oneHourAgoText ||
			    diff < 86400 && Math.floor(diff / 3600) + " " + Resources.hoursAgoText) ||
		    day_diff == 1 && Resources.yesterdayText ||
		    day_diff < 7 && day_diff + " " + Resources.daysAgoText ||
		    day_diff < 31 && Math.ceil(day_diff / 7) + " " + Resources.weeksAgoText;
        }
    });

    return {
        User: User,
        Status: Status
    };
});