// Data provider using a pre-defined mashup.
// Possibly we could be using several of these but ideally the aggregation is going to be done at the mashup level anyway

// Handles events:
//  - Data/Search  (filter)
//   filter is a data object with the following properties:
//    - query: search query
//    - users: array of objects with following properties:
//         - proto 
//         - name
//       They are passed to the mashup, with the parameter name being based on the proto (e.g. "TwitterUser")
//   Those parameters are passed to the mashup to retrieve the data
// Raises events:
//  - Data/Loaded
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', './Model', 'dojo/string', 'dojo/i18n!./nls/Resources'],
function (declare, lang, array, Model, djString, Resources) {
    return declare(null, {
        _searchMashupName: "",
        _source: null,

        // searchMashup: mashup to use to retrieve the data, it must take a "Search" parameter and have a "AllResults" result
        // source (optional): something to tag the returned entries with so they can easily be manipulated as a group
        constructor: function (searchMashup, source) {
            this._searchMashupName = searchMashup;
            this._source = source;
        },

        initModule: function (app) {
            this._app = app;
            app.subscribe('Data/Search', lang.hitch(this, "performSearch"));
        },

        performSearch: function (filter, callback) {
            // fetch the mashup data then raise a Data/Loaded event
            // if a callback is specified then the results are passed to it instead of raising the event
            // (in case of an error the callback is invoked with a "false" parameter)
            if (typeof console !== "undefined")
                console.log("Data/Search", filter);
            if (!filter) {
                this._app.publish("Data/Loaded", []);
                return;
            }
            var mashupParams = this._prepareMashupParameters(filter);
            mashupParams["format"] = "json";
            mashupParams["count"] = "1000";
            mashupParams["_resultName"] = "AllResults";
            mashupParams["hasErrorHandler"] = "true";  // prevent the automatic error handling
            // limitation of the twitter search api: they can only go back about 1 week
            var mashupUrl = "slxdata.ashx/$app/mashups/-/mashups('" + this._searchMashupName + "')/$queries/execute";
            var app = this._app;
            this._app.ajax.xhrGet(mashupUrl, mashupParams).then(lang.hitch(this, function (data) {
                var texts = data.$resources;

                for (var i = 0; i < texts.length; i++) {
                    var status = texts[i];
                    texts[i] = new Model.Status({
                        id: status.StatusID,
                        url: status.StatusUrl,
                        icon: 'images/' + status.Icon,
                        text: status.Text,  // status text, this is already escaped for HTML
                        subject: status.Subject,
                        postdate: new Date(parseInt(status.CreatedAt.substr(6))),
                        source: this._source,
                        user: new Model.User({
                            name: status.User.ScreenName,
                            description: status.User.Description,
                            id: status.User.UserID,
                            imageUrl: window.location.protocol == "https:" ? status.User.ProfileImageUrlHttps : status.User.ProfileImageUrl,
                            url: status.User.ProfileUrl || status.User.DefaultProfileUrl
                        })
                    });
                }
                if (callback && typeof (callback) == "function")
                    callback(texts);
                else
                    app.publish("Data/Loaded", texts);
            })).then(null, function (err) {
                if (callback && typeof (callback) == "function") {
                    callback(false);
                } else if (filter.users && filter.users.length > 0) {
                    app.error(djString.substitute(Resources.unableToLoadUsersSocialFeedText, { network: filter.users[0].proto }));
                } else {
                    app.error(err);
                }
            });
        },

        _prepareMashupParameters: function (filter) {
            var p = {};
            if (filter.query) {
                var q = filter.query;
                // bit of a hack because the twitter API requires an upper case OR, we know the users are not going to remember that,
                // and it's currently the only searchable API we support anyway.
                q = q.replace(/, */, " OR ");
                p._Search = q;
            }
            if (filter.users) {
                array.forEach(filter.users, function (u) {
                    if (u.proto && u.name)
                        p["_" + u.proto + "User"] = u.name;
                });
            }
            return p;
        }

    });
});