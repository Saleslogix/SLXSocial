/*
* Small UI module used for the actual display of the social profile.
* 
* Events in:
*  - SocialProfile/Updated
*  - SocialProfile/Loaded - display the profile.  If there is no profile data, we'll send a SocialProfile/Refresh event at this time.
*  - SocialProfile/Hide (we'll hide the corresponding profile)
*  - SocialProfile/Show
*
* Events out:
*  - SocialProfile/Refresh
*/

define(['dojo/_base/declare', 'dojo/_base/lang', 'dijit/_Widget', './SocialProfileView'],
function (declare, lang, _Widget, SocialProfileView) {


    return declare([_Widget], {
        _sandbox: null,
        _displayedProfiles: null,

        initModule: function (sb) {
            this._sandbox = sb;
            this._displayedProfiles = [];
            sb.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onSocialProfileLoaded"));
            sb.subscribe("SocialProfile/Updated", lang.hitch(this, "_onSocialProfileUpdated"));
            sb.subscribe("SocialProfile/Show", lang.hitch(this, "_onSocialProfileUpdated"));
            sb.subscribe("SocialProfile/Hide", lang.hitch(this, "_onSocialProfileHide"));
        },

        _onSocialProfileLoaded: function (prof) {
            // initial load.  We need to refresh the info from Linked In (we can't store it because of TOS)
            var sb = this._sandbox;
            if (!prof.FormattedName) {
                // empty profile
                return;
            }
            prof.socialNetwork.isAuthenticated().then(function (isAuth) {
                if (isAuth) {
                    sb.publish("SocialProfile/Refresh", prof);
                }
            });
            // create the default view this way we at least display the user's profile pic and name (otherwise we might just end up with a blank screen)
            this._onSocialProfileUpdated(prof);
        },

        _onSocialProfileUpdated: function (prof) {
            if (!prof.FormattedName) {
                // empty profile
                return;
            }
            var dp = null;

            for (var i = 0; i < this._displayedProfiles.length; i++) {
                if (this._displayedProfiles[i].socialProfile === prof) {
                    dp = this._displayedProfiles[i];
                    break;
                }
            }
            if (!dp) {
                dp = new SocialProfileView({});
                this._sandbox.addModule(dp);
                this.domNode.appendChild(dp.domNode);
                this._displayedProfiles.push(dp);
            }
            dp.updateSocialProfile(prof);
        },

        _onSocialProfileHide: function (prof) {
            for (var i = 0; i < this._displayedProfiles.length; i++) {
                if (this._displayedProfiles[i].socialProfile === prof) {
                    var pv = this._displayedProfiles[i];
                    pv.destroy();
                    this._displayedProfiles.splice(i, 1);
                    return;
                }
            }
        }
    });
});