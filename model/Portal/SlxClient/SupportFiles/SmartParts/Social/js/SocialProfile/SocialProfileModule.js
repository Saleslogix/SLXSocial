/*
 * Module used for the collection of "social profile" data (user name, title etc)
 * 
 * Events in:
 *  Data/AddNetwork - when a network is enabled we'll attempt to refresh the corresponding profile (if enabled for this network)
 *  SocialProfile/Updated - when the profile is updated, typically means the user changed the name.  We'll refresh at that time.
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
            sb.subscribe("Data/AddNetwork", lang.hitch(this, "_onAddNetwork"));
            sb.subscribe("SocialProfile/Updated", lang.hitch(this, "_onSocialProfileUpdated"));
            sb.subscribe("SocialProfile/Refresh", lang.hitch(this, "_onSocialProfileRefresh"));
        },

        _onSocialProfileRefresh: function (prof) {
            this._refreshProfile(prof);
        },

        _onSocialProfileUpdated: function (prof) {
            this._refreshProfile(prof);
        },

        _onAddNetwork: function (prof) {
            if (!prof.FormattedName) {
                this._refreshProfile(prof);
            }
        },

        _refreshProfile: function (prof) {
            var mashupParams = {};
            mashupParams["format"] = "json";
            mashupParams["_resultName"] = "AllResults";
            mashupParams["_LinkedInUser"] = prof.SocialUserId;
            mashupParams["hasErrorHandler"] = "true";  // prevent the automatic error handling
            // limitation of the twitter search api: they can only go back about 1 week
            var mashupUrl = "slxdata.ashx/$app/mashups/-/mashups('LinkedInProfile')/$queries/execute";
            this._app.ajax.xhrGet(mashupUrl, mashupParams).then(lang.hitch(this, function (data) {
                if (data.$resources && data.$resources.length > 0) {
                    var source = data.$resources[0];
                    prof.FormattedName = source.FormattedName;
                    prof.Location = source.Location || "";
                    prof.PictureUrl = source.ProfileImageUrl;
                    prof.ProfessionalSummary = source.Summary || "";
                    prof.ProfessionalDescription = source.Description || "";
                    prof.FirstName = source.FirstName;
                    prof.LastName = source.LastName;
                    prof.Headline = source.Title || "";
                    prof.Email = source.Email || "";
                    prof.ProfileUrl = source.ProfileUrl;
                    prof.Industry = source.Industry || "";
                    prof.CurrentEmployer = source.CurrentEmployer || "";
                    prof.PreviousEmployers = source.PreviousEmployers || "";
                    prof.Education = source.Education || "";
                    prof.LastUpdatedOn = new Date().toISOString();
                    new Date();
                    if (source.Specialties) {
                        prof.ProfessionalSpecialties = source.Specialties.join(", ");
                    } else {
                        prof.ProfessionalSpecialties = "";
                    }
                    this._app.publish("SocialProfile/Updated", prof);
                }
            }));
        }
    });
});