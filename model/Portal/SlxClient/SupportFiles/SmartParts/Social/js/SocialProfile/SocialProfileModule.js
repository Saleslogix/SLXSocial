/*
 * Module used for the collection of "social profile" data (user name, title etc)
 * The configuration of the profile is in a different module (SocialNetworkConfiguration) - this one is only concerned with gathering the profile data 
 * available on the network.
 * The information is not persisted to the database, save for a few properties, as it would be against the TOS for LinkedIn
 * 
 * Events in:
 *  Data/AddNetwork - when a network is enabled we'll attempt to refresh the corresponding profile (if enabled for this network)
 *  SocialProfile/Configured - when the profile is updated, typically means the user changed the name.  We'll refresh at that time.
 *  SocialProfile/Refresh - a user request to refresh the profile
 *  
 * Events out:
 *  SocialProfile/Updated - means the profile has been refreshed from the social network (and should be saved to the DB and updated on the display)
 */



define(['dojo/_base/declare', 'dojo/_base/lang', '../Utility', 'dojo/i18n!../nls/Resources'],
function (declare, lang, Utility, Resources) {
    return declare(null, {
        _app: null,

        initModule: function (sb) {
            this._app = sb;
            sb.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onSocialProfileConfigured"));
            sb.subscribe("SocialProfile/Configured", lang.hitch(this, "_onSocialProfileConfigured"));
            sb.subscribe("SocialProfile/Refresh", lang.hitch(this, "_onSocialProfileRefresh"));
        },

        _onSocialProfileRefresh: function (prof) {
            this._refreshProfile(prof);
        },

        _onSocialProfileConfigured: function (prof) {
            prof.socialNetwork.isAuthenticated().then(lang.hitch(this, function (isAuth) {
                if (isAuth)
                    this._refreshProfile(prof);
            }));
        },


        _refreshProfile: function (prof) {
            if (!prof.socialNetwork.profileMashupName)
                return;
            // XXX do we need to check for "refresh in progress"
            var mashupParams = {};
            mashupParams["format"] = "json";
            mashupParams["_resultName"] = "AllResults";
            mashupParams["_LinkedInUser"] = prof.SocialUserId;
            mashupParams["hasErrorHandler"] = "true";  // prevent the automatic error handling
            var mashupUrl = "slxdata.ashx/$app/mashups/-/mashups('" + prof.socialNetwork.profileMashupName + "')/$queries/execute";
            this._app.ajax.xhrGet(mashupUrl, mashupParams).then(lang.hitch(this, function (data) {
                if (data.$resources && data.$resources.length > 0) {
                    var source = data.$resources[0];
                    if (source.FormattedName !== prof.FormattedName ||
                        source.PictureUrl !== prof.PictureUrl) {
                        prof.dirty = true;
                    }
                    lang.mixin(prof, source);
                    for (var k in source) {
                        if (k[0] == "$" && k != "$key")
                        // remove special properties, they mess up sdata updates
                            delete prof[k];
                    }

                    if (source.Specialties) {
                        prof.ProfessionalSpecialties = source.Specialties.join(", ");
                    } else {
                        prof.ProfessionalSpecialties = "";
                    }
                    prof.LastUpdatedOn = new Date().toISOString();
                    this._app.publish("SocialProfile/Updated", prof);
                }
            }), lang.hitch(this, function (err) {
                this._app.publish("SocialProfile/Error", prof, err);
            })).then(null, lang.hitch(this, function (err) {
                this._app.publish("App/Error", err);
            }));
        }
    });
});