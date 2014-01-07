/*
 * Module used to automatically register mashup data providers when the social networks are loaded.
 *
 * Events in:
 *  - SocialProfile/Loaded - registers mashup provider, if not already there, and send a Data/Search event
 *  - SocialProfile/Configured - registers mashup provider, if not already there, and send a Data/Search event
 *  - SocialProfile/Show 
 *  - SocialProfile/Hide 
 *
 * Events out:
 *  - Data/Search
 */

define(["dojo/_base/declare", "dojo/_base/lang", "../MashupDataProvider"], function (declare, lang, MashupDataProvider) {
    return declare(null, {
        _sandbox: null,
        _mashups: null,

        initModule: function (sb) {
            this._sandbox = sb;
            sb.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onAddNetwork"));
            sb.subscribe("SocialProfile/Configured", lang.hitch(this, "_onAddNetwork"));
            sb.subscribe("SocialProfile/Show", lang.hitch(this, "_onAddNetwork"));
            sb.subscribe("SocialProfile/Refresh", lang.hitch(this, "_onAddNetwork"));
            sb.subscribe("SocialProfile/Hide", lang.hitch(this, "_onRemoveNetwork"));
            this._mashups = {};
        },

        _onAddNetwork: function (socialProfile) {
            var net = socialProfile.socialNetwork;
            if (!this._mashups[net.name]) {
                var mashup = new MashupDataProvider(net.updateFeedMashupName, net.name);
                this._sandbox.addModule(mashup);
                this._mashups[net.name] = mashup;
            } else {
                // was already there - should first do a Remove to make sure we clean existing crud
                this._sandbox.publish("Data/Remove", socialProfile.socialNetwork.name);
            }
            var filter = { users: [{ proto: socialProfile.socialNetwork.name, name: socialProfile.SocialUserId}],
                query: socialProfile.SocialKeywords,
                socialProfile: socialProfile
            };

            // Don't do a global call, because that would be broadcast to all the mashup data providers
            //this._sandbox.publish("Data/Search", filter);
            // instead just call the search method directly
            this._mashups[net.name].performSearch(filter);
        },

        _onRemoveNetwork: function (socialProfile) {
            var mashup = this._mashups[socialProfile.socialNetwork.name];
            if (mashup) {
                this._sandbox.removeModule(mashup);
            }
            this._sandbox.publish("Data/Remove", socialProfile.socialNetwork.name);
        }
    });
});