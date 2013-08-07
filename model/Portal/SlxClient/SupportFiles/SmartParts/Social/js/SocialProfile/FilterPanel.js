/*
* Allow user to select which providers to display in the view.
* Events in:
*  - SocialProfile/Loaded
*  - SocialProfile/Updated
* Events out:
*  - Data/AddNetwork
*  - Data/RemoveNetwork
*/

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dojo/on', 'dijit/_Widget',
    'dijit/form/TextBox', 'dijit/form/CheckBox', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
    'dojo/i18n!../nls/Resources'],
function (declare, lang, domConstruct, on, _Widget, TextBox, CheckBox, _TemplatedMixin, _WidgetsInTemplateMixin, Resources) {
    var SocialProfileWidget = declare([_Widget], {
        socialProfile: null,   // reference to SocialProfile object
        sandbox: null,

        buildRendering: function () {
            this.inherited(arguments);
            var network = this.socialProfile.socialNetwork;

            // checkbox
            var chk = new CheckBox({ title: network.name });
            this.domNode.appendChild(chk.domNode);
            on(chk, "click", lang.hitch(this, function () {
                var checked = chk.get('value');
                if (!this.socialProfile.isConfigured()) {
                    chk.set('value', false);
                    this.socialProfile.configure();
                } else {
                    if (checked) {
                        this.sandbox.publish("Data/AddNetwork", this.socialProfile);
                        img.src = network.imageUrl;
                    } else {
                        this.sandbox.publish("Data/RemoveNetwork", this.socialProfile);
                        img.src = network.inactiveImageUrl;
                    }
                }
            }));

            // icon
            var img = document.createElement("img");
            img.alt = network.name;
            img.src = network.inactiveImageUrl;
            this.domNode.appendChild(img);
            on(img, "click", lang.hitch(this, function () {
                this.socialProfile.configure();
            }));
            // add a label with the username
            var lblUsername = document.createElement("div");
            this.domNode.appendChild(lblUsername);
            lblUsername.className = "s-user";

            var sandbox = this.sandbox;
            var setupSocialProfile = function (socialProfile) {
                // if the profile is already configured go ahead and add it right away
                if (socialProfile.isConfigured()) {
                    if (!chk.get('value')) {
                        chk.set('value', 'on');
                    }
                    img.src = network.imageUrl;
                    sandbox.publish("Data/AddNetwork", socialProfile);
                    domConstruct.place(document.createTextNode(socialProfile.SocialUserName), lblUsername, "only");
                } else {
                    chk.set('value', false);
                    img.src = network.inactiveImageUrl;
                    sandbox.publish("Data/RemoveNetwork", socialProfile);
                    domConstruct.place(document.createTextNode(Resources.notConfigured), lblUsername, "only");
                }
            }

            setupSocialProfile(this.socialProfile);


            // handler for when the profile is successfully configured (or reconfigured)
            this.sandbox.subscribe("SocialProfile/Updated", lang.hitch(this, function (prof) {
                if (prof === this.socialProfile) {
                    setupSocialProfile(prof);
                }
            }));
        }
    });

    return declare([_Widget], {
        _app: null,
        whereNetworkIs: null,  // optional criteria function to determine which networks to be displayed
        cmdFilterId: "",  // id of button used to toggle filter panel (optional)

        initModule: function (app) {
            this._app = app;
            app.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onSocialProfileLoaded"));
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.cmdFilterId) {
                on(document.getElementById(this.cmdFilterId), "click", lang.hitch(this, function (evt) {
                    evt.preventDefault();
                    this._toggleVisibility();
                }));
                this._toggleVisibility();
            }
        },

        _toggleVisibility: function () {
            if (this.domNode.style.display == "none") {
                this.domNode.style.display = "";
            } else {
                this.domNode.style.display = "none";
            }
        },

        _onSocialProfileLoaded: function (profile) {
            if (this.whereNetworkIs) {
                if (!this.whereNetworkIs(profile.socialNetwork))
                // don't display this one then
                    return;
            }
            var spw = new SocialProfileWidget({ socialProfile: profile, sandbox: this._app });
            this.domNode.appendChild(spw.domNode);
            domConstruct.place("<br/>", this.domNode, "last");
        }
    });
});