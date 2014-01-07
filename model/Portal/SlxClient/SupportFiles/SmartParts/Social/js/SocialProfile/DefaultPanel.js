// Show the user an instruction screen when there is no configured network
define(['dojo/_base/declare', 'dojo/_base/lang', 'dijit/_WidgetBase', 'dojo/dom-construct', 'dojo/string', 'dojo/i18n!../nls/Resources'],
function (declare, lang, _WidgetBase, domConstruct, djString, Resources) {
    return declare([_WidgetBase], {
        _app: null,
        whereNetworkIs: null,  // optional criteria function to determine which networks to be displayed

        initModule: function (app) {
            this._app = app;
            app.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onSocialProfileLoaded"));
            // handler for when the profile is successfully configured (or reconfigured)
            app.subscribe("SocialProfile/Configured", lang.hitch(this, "_onSocialProfileConfigured"));
            app.subscribe("SocialProfile/Updated", lang.hitch(this, "_onSocialProfileConfigured"));
        },

        buildRendering: function () {
            this.inherited(arguments);
            domConstruct.place("<p>" + Resources.noSocialProfileConfiguredText + "</p>", this.domNode);
        },

        _onSocialProfileLoaded: function (profile) {
            if (this.whereNetworkIs) {
                if (!this.whereNetworkIs(profile.socialNetwork))
                // don't display this one then
                    return;
            }
            // if they have a configured network, hide the panel
            if (profile.isConfigured()) {
                this.domNode.style.display = "none";
            } else {
                // show signup link 
                var html = djString.substitute(Resources.socialNetworkSignup,
                    { signup_url: profile.socialNetwork.signupUrl, network_name: profile.socialNetwork.name });
                domConstruct.place("<p>" + html + "</p>", this.domNode, "last");
            }
        },

        _onSocialProfileConfigured: function (profile) {
            // if they have a configured network, hide the panel
            if (profile.isConfigured()) {
                this.domNode.style.display = "none";
            }
        }
    });
});