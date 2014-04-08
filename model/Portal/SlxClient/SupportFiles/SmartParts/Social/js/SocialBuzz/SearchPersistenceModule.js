// Module responsible for saving and loading searches for the user
// Events in
//  - Data/SearchTabs/Save
//  - Data/SearchTabs/Delete
//  - App/Start - to load the initial configuration
//
// Events out:
//
//  - Data/SearchTabs/Loaded

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array'],
function (declare, lang, array) {
    return declare(null, {
        _app: null,

        initModule: function (sb) {
            this._app = sb;
            sb.subscribe("Data/SearchTabs/Save", lang.hitch(this, "_onSearchTabSave"));
            sb.subscribe("Data/SearchTabs/Delete", lang.hitch(this, "_onSearchTabDelete"));
            sb.subscribe("App/Start", lang.hitch(this, "_loadSavedSearches"));
        },

        _loadSavedSearches: function () {
            this._app.sdata.read("socialSearches").then(lang.hitch(this, function (data) {
                var searches = array.map(data.$resources, function (s) {
                    for (var k in s) {
                        // remove special properties because they will mess up the updates
                        if (k[0] == "$" && k != "$key")
                            delete s[k];
                    }
                    return s;
                });
                this._app.publish("Data/SearchTabs/Loaded", searches);
            }));
        },

        _onSearchTabSave: function (search) {
            if (!search.Userid)
                search.Userid = Sage.Utility.getClientContextByKey("userID");
            if (search.Userid != Sage.Utility.getClientContextByKey("userID")) {
                // don't save the ones that are owned by a different user
                return;
            }
            var sb = this._app;
            if (search.$key) {
                sb.sdata.update("socialSearches", search);
            } else {
                sb.ajax.xhrGet("slxdata.ashx/slx/dynamic/-/users('" + search.Userid + "')?format=json&select=DefaultOwner/Id").then(function (user) {
                    search.Owner = { $key: user.DefaultOwner.$key };
                    sb.sdata.create("socialSearches", search).then(function (data) {
                        search.$key = data.$key;
                    });
                });
            }
        },

        _onSearchTabDelete: function (search) {
            if (search.$key && search.Userid == Sage.Utility.getClientContextByKey("userID")) {
                this._app.sdata.destroy("socialSearches", search.$key);
            }
        }
    });
});