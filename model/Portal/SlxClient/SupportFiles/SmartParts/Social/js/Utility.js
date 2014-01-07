// Utility methods for Social Queue module  (aka misc stuff)

define([], function () {
    if (!Date.prototype.toISOString) {
        // replacement for Ecma5 standard toISOString method if not supported by browser

        (function () {

            function pad(number) {
                var r = String(number);
                if (r.length === 1) {
                    r = '0' + r;
                }
                return r;
            }

            Date.prototype.toISOString = function () {
                return this.getUTCFullYear()
                + '-' + pad(this.getUTCMonth() + 1)
                + '-' + pad(this.getUTCDate())
                + 'T' + pad(this.getUTCHours())
                + ':' + pad(this.getUTCMinutes())
                + ':' + pad(this.getUTCSeconds())
                + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                + 'Z';
            };

        } ());
    }

    var dynamicallyLoadedFiles = {};

    var Utility = {
        convertDateToUTC: function (date) {
            // summary:
            //  Return new date using the UTC values from the original
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        },
        convertDateToLocal: function (date) {
            // summary:
            //  Manually convert a date to local time by subtracting the UTC offset.
            //  This creates a new date object in which the UTC date is equal to the original's date LOCAL time.
            var offset = date.getTimezoneOffset();
            date.setMinutes(date.getMinutes() - offset);
            return date;
        },
        escapeHTML: function (s) {
            s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
            s = s.replace(/\n/g, "<br/>");
            return s;
        },
        stripHTML: function (html) {
            return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '');
        },
        loadCss: function (url) {
            // summary:
            //  Dynamically load a stylesheet
            if (dynamicallyLoadedFiles[url])
                return;
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", url);
            document.getElementsByTagName("head")[0].appendChild(fileref);
        },
        loadScript: function (url) {
            // summary:
            //  Dynamically load a javascript.
            //  Keep track of what scripts are loaded to prevent loading it twice.
            if (dynamicallyLoadedFiles[url])
                return;
            var fileref = document.createElement("script");
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", url);
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    };

    return Utility;
});