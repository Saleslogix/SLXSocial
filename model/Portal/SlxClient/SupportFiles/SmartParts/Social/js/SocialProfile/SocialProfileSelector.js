// UI for picking the social profile to be displayed on the view, and defining new ones.
//
// Events in:
//  - SocialNetwork/Defined - we keep track of the available network so we can show a popup menu to the user when they want to add a new profile
//  - SocialProfile/Configured - update the profile selection widget (we display the user's screenname)
//  - SocialProfile/Loaded - display the profile selection widget
//  - SocialProfile/Deleted
//  - SocialProfile/Error - if there is an error retrieving the profile data we'll show that here
//
// Events out:
//  - SocialProfile/Configure - request to configure a profile, this can be either an existing profile or a new, empty one (tied to a pre-defined network)
//  - SocialProfile/Show
//  - SocialProfile/Hide - when a profile is hidden (or removed)
//  - SocialProfile/Delete

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/on', 'dijit/_WidgetBase',
    'dijit/form/CheckBox', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
    'dijit/Menu', 'dijit/MenuItem', 'dijit/PopupMenuItem',
    '../Utility',
    'dojo/i18n!../nls/Resources'],
function (declare, lang, array, domConstruct, domClass, on, _WidgetBase, CheckBox, _TemplatedMixin, _WidgetsInTemplateMixin,
    Menu, MenuItem, PopupMenuItem,
    Utility, Resources) {


    var SocialProfileButton = declare([_WidgetBase], {
        // Icon for a single social profile

        profile: null,  // social profile object
        enabled: true,
        _networkIcon: null,
        _app: null,

        buildRendering: function () {
            this.inherited(arguments);

            // UI
            this.domNode.className = 's-profile';
            var img = this._networkIcon = document.createElement("img");
            img.src = this.enabled ? this.profile.socialNetwork.imageUrl : this.profile.socialNetwork.inactiveImageUrl;
            img.alt = img.title = this.profile.socialNetwork.name;
            img.style.width = "32px";
            img.style.height = "32px";
            img.id = this.id + "_imgbutton";
            img.title = Resources.rightClickForOptions;
            this.domNode.appendChild(img);
            on(img, "click", lang.hitch(this, "_onNetworkToggle"));
            on(img, "dblclick", lang.hitch(this, "_onNetworkConfigure"));
            var lbl = this._networkLabel = document.createElement("span");
            lbl.className = 's-user';
            lbl.appendChild(document.createTextNode(this.profile.SocialUserName));
            this.domNode.appendChild(lbl);

            // create the menu
            setTimeout(lang.hitch(this, function () {
                var mnu = new Menu({ targetNodeIds: [img.id] });
                mnu.addChild(new MenuItem({ label: Resources.configureText || 'Configure', onClick: lang.hitch(this, "_onNetworkConfigure") }));
                mnu.addChild(new MenuItem({ label: Resources.removeText || 'Remove', onClick: lang.hitch(this, "_onNetworkRemove") }));
                mnu.startup();
            }), 100);
        },

        initModule: function (app) {
            this._app = app;
        },


        _setEnabledAttr: function (value) {
            var imgUrl = value ? this.profile.socialNetwork.imageUrl : this.profile.socialNetwork.inactiveImageUrl;
            this._networkIcon.src = imgUrl;
            this._set("enabled", value);
        },

        // Public API

        updateProfileDisplay: function () {
            domConstruct.place(document.createTextNode(this.profile.SocialUserName), this._networkLabel, "only");
            this._networkIcon.alt = this._networkIcon.title = this.profile.socialNetwork.name;
            this.hideError();
        },

        showError: function (err) {
            if (!this._errorIcon) {
                var icon = this._errorIcon = document.createElement("div");
                icon.className = "messageIcon warningIcon";
                icon.style.styleFloat = icon.style.cssFloat = "none";
                icon.title = Resources.errorRetrievingNetworkUpdates;
                // do not give the error details... they will be logged to the console for debugging, but they confuse regular users
                //  +": " + err.toString();
                this.domNode.appendChild(icon);
                domClass.add(this.domNode, "s-profile-error");
            }
        },

        hideError: function () {
            if (this._errorIcon) {
                domConstruct.destroy(this._errorIcon);
                this._errorIcon = null;
                domClass.remove(this.domNode, "s-profile-error");
            }
        },

        // UI events

        _onNetworkConfigure: function () {
            // bring up configuration interface
            this.profile.configure();
        },

        _onNetworkToggle: function () {
            // enable / disable the profile
            this.set("enabled", !this.enabled);
            if (this.enabled) {
                this._app.publish("SocialProfile/Show", this.profile);
            } else {
                this._app.publish("SocialProfile/Hide", this.profile);
            }
        },

        _onNetworkRemove: function () {
            this._app.publish("SocialProfile/Delete", this.profile);
        }
    });

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Selector UI (icons + add button)
        _profiles: null,
        _networks: null,
        _addMenu: null,  // menu will have 1 item for each network
        _app: null,
        whereNetworkIs: null,  // optional criteria function to determine which networks to be displayed
        cmdFilterToolId: "",  // id of toolbar button used to toggle filter panel (optional)
        cmdAddProfileToolId: "",  // id of toolbar button used to add a new profile (optional)

        templateString: "<div><div style='float: left' data-dojo-attach-point='panProfileButtons' class='s-profile-selector-buttons'></div>" +
            '<div class="s-profile-add" data-dojo-attach-point="btnAddProfile">' + Resources.addProfileText + '</div>' +
            "</div>",

        postMixInProperties: function () {
            this.inherited(arguments);
            this._profiles = [];
            this._networks = {};
        },

        postCreate: function () {
            this.inherited(arguments);

            if (this.cmdFilterToolId) {
                on(document.getElementById(this.cmdFilterToolId), "click", lang.hitch(this, function (evt) {
                    evt.preventDefault();
                    this._toggleVisibility();
                }));
            }

            // Create the add menu
            this.btnAddProfile.id = this.id + "_btnAddProfile";
        },

        initModule: function (app) {
            this._app = app;
            app.subscribe("SocialNetwork/Defined", lang.hitch(this, "_onAddNetwork"));
            app.subscribe("SocialProfile/Configured", lang.hitch(this, "_onSocialProfileConfigured"));
            app.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onSocialProfileConfigured"));
            app.subscribe("SocialProfile/Deleted", lang.hitch(this, "_onSocialProfileDeleted"));
            app.subscribe("SocialProfile/Error", lang.hitch(this, "_onSocialProfileError"));
        },

        // UI events


        _toggleVisibility: function () {
            if (this.domNode.style.display == "none") {
                this._showPanel();
            } else {
                this._hidePanel();
            }
        },

        _showPanel: function () {
            this.domNode.style.display = "";
        },

        _hidePanel: function () {
            this.domNode.style.display = "none";
        },

        // Application events

        _onAddNetwork: function (net) {
            // keep track of what networks are available
            if (this.whereNetworkIs) {
                if (!this.whereNetworkIs(net))
                // don't display this one then
                    return;
            }
            if (!this._networks[net.name]) {
                this._networks[net.name] = net;
                if (!this._addMenu) {
                    var targetNodes = [this.btnAddProfile.id];
                    if (this.cmdAddProfileToolId)
                        targetNodes.push(this.cmdAddProfileToolId);
                    this._addMenu = new Menu({ targetNodeIds: targetNodes, leftClickToOpen: true });
                    this._addMenu.startup();
                }
                this._addMenu.addChild(new MenuItem({ label: net.name, onClick: lang.hitch(this, "_onAddProfileClick", net) }));
            }
        },

        _onAddProfileClick: function (network) {
            network.addProfile();
        },

        _onSocialProfileConfigured: function (prof) {
            if (this.whereNetworkIs) {
                if (!this.whereNetworkIs(prof.socialNetwork))
                // don't display this one then
                    return;
            }
            // draw the new social profile
            for (var i = 0; i < this._profiles.length; i++) {
                var profWidget = this._profiles[i];
                if (profWidget.profile === prof) {
                    profWidget.updateProfileDisplay();
                    return;
                }
            }
            var profWidget = new SocialProfileButton({ profile: prof });
            this._app.addModule(profWidget);
            this.panProfileButtons.appendChild(profWidget.domNode);
            this._profiles.push(profWidget);

            if (this.cmdFilterToolId) {
                // if they have a configured filter button, and at least one network is already configured, start the panel as hidden
                if (prof.isConfigured()) {
                    this._hidePanel();
                }
            }
        },

        _onSocialProfileDeleted: function (prof) {
            for (var i = 0; i < this._profiles.length; i++) {
                var profWidget = this._profiles[i];
                if (profWidget.profile === prof) {
                    profWidget.destroy();
                    this._profiles.splice(i, 1);
                }
            }
            this._app.publish("SocialProfile/Hide", prof);
        },

        _onSocialProfileError: function (prof, error) {
            for (var i = 0; i < this._profiles.length; i++) {
                var profWidget = this._profiles[i];
                if (profWidget.profile === prof) {
                    this._showPanel();
                    profWidget.showError(error);
                }
            }
        }
    });

});
