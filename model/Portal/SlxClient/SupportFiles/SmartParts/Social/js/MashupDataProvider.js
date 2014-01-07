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
//    - socialProfile: if specified, then the error is reported using a SocialProfile/Error event
//   Those parameters are passed to the mashup to retrieve the data
// Raises events:
//  - Data/Loaded - when the data is loaded this is raised with the array of texts and the filter parameter
//  - Data/Loading - when the search query is sent, and before we receive the results from the server
//  - SocialProfile/Error - if there is an error retrieving the data and a social profile object was passed in
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', './Model', 'dojo/string', 'dojo/i18n!./nls/Resources'],
function (declare, lang, array, Model, djString, Resources) {
    // ensure the URL are prefixed with http to avoid interpreting as a local URL
    function getUrl(url) {
        return url && !/^(http|\.\/)/.test(url) ? ("http://" + url) : url;
    }

    return declare(null, {
        _searchMashupName: "",
        _source: null,
        _searchStatus: null,  // used to be able to cancel an ongoing search

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

        performSearch: function (filter) {
            // fetch the mashup data then raise a Data/Loaded event
            //            if (typeof console !== "undefined")
            //                console.log("Data/Search", filter);
            if (!filter) {
                this._app.publish("Data/Loaded", []);
                return;
            }
            if (this._searchStatus) {
                this._searchStatus.canceled = true;
            }
            this._app.publish("Data/Loading");
            var searchStatus = this._searchStatus = {};
            var mashupParams = this._prepareMashupParameters(filter);
            mashupParams["format"] = "json";
            mashupParams["count"] = "1000";
            mashupParams["_resultName"] = "AllResults";
            mashupParams["hasErrorHandler"] = "true";  // prevent the automatic error handling
            // limitation of the twitter search api: they can only go back about 1 week
            var mashupUrl = "slxdata.ashx/$app/mashups/-/mashups('" + this._searchMashupName + "')/$queries/execute";
            var app = this._app;
            this._app.ajax.xhrGet(mashupUrl, mashupParams).then(lang.hitch(this, function (data) {
                console.log("Loaded data...", data);
                var texts = data.$resources;

                if (searchStatus.canceled) {
                    if (typeof console !== "undefined")
                        console.log("Mashup search canceled");
                    return;
                }

                for (var i = 0; i < texts.length; i++) {
                    var status = texts[i];
                    texts[i] = new Model.Status({
                        id: status.StatusID,
                        url: getUrl(status.StatusUrl),
                        icon: 'SmartParts/Social/img/' + status.Icon,
                        text: status.Text,  // status text, this is already escaped for HTML
                        subject: status.Subject,
                        postdate: new Date(parseInt(status.CreatedAt.substr(6))),
                        source: this._source,
                        socialNetwork: status.SocialNetwork,
                        favorited: status.Favorited,
                        user: new Model.User({
                            screenname: status.User.ScreenName,
                            name: (status.User.FirstName || "") + " " + status.User.LastName,
                            description: status.User.Description,
                            id: status.User.UserID,
                            imageUrl: status.User.PictureUrl,
                            url: getUrl(status.User.ProfileUrl || status.User.DefaultProfileUrl)
                        })
                    });
                }
                app.publish("Data/Loaded", texts, filter);
            })).then(null, function (err) {
                if (filter.socialProfile) {
                    app.publish("SocialProfile/Error", filter.socialProfile, err);
                } else if (filter.users && filter.users.length > 0) {
                    app.error(djString.substitute(Resources.unableToLoadUsersSocialFeedText, { network: filter.users[0].proto }));
                } else {
                    app.error(djString.substitute(Resources.unableToLoadSocialFeedText));
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