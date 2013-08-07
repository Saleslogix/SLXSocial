/*
* Configuration of the social profile for a single social network.
*
* Events in: 
*   App/Start - load initial configuration
*   SocialProfile/Updated - indicates another module has updated the profile (we'll save it to the DB at that time)
*
* Events out:
*   SocialProfile/Loaded - indicate configuration has been loaded for a social profile
*   SocialProfile/Updated - indicate the user has provided configuration (user name) for a social profile
*   SocialProfile/Saved - indicates the social profile has been committed to the DB
*/
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dojo/_base/array', 'dojo/on', 'dijit/Dialog', 'Sage/UI/Dialogs',
'dijit/form/TextBox', 'dijit/form/FilteringSelect', 'dojo/store/Memory', 'dojo/string',
'dojo/_base/Deferred', 'dijit/_Widget', '../Utility',
'dojo/i18n!../nls/Resources'],
function (declare, lang, domConstruct, array, on, Dialog, SageDialogs, TextBox, FilteringSelect, Memory, djString, Deferred, _Widget, Utility,
Resources) {
    var UserSelection = declare(null, {
        constructor: function (userProfile) {
            this.id = userProfile.UserID;
            this.name = userProfile.Description;
            this.screenName = userProfile.ScreenName;
            this.profileUrl = userProfile.ProfileUrl;
            this.label = '<img src="' + (userProfile.ProfileImageUrlHttps || userProfile.ProfileImageUrl) + '" alt="Profile picture" height="32" width="32"/>' +
                Utility.escapeHTML(userProfile.Description);
        }
    });
    var UserSelectionDropdown = declare([FilteringSelect], {
        setUsers: function (matches) {
            // set the list of user profiles to be displayed in the dropdown.  The first one will be selected by default.
            var dojoStore = new Memory({
                data: array.map(matches, function (m) {
                    return new UserSelection(m);
                })
            });
            this.set('searchAttr', 'name');
            this.set('labelAttr', 'label');
            this.set('labelType', 'html');
            this.set('store', dojoStore);
            this.set('value', matches[0].UserID);
        }
    });

    var SocialProfileConfigurationDialog = declare([Dialog], {
        // Configuration for a social network
        // Currently the only thing configured is the user name associated with the entity

        socialProfile: null,
        _currentStep: "PromptUsername",   // PromptUsername, SelectUser
        _divUserInput: null,  // div containing the username textbox

        postCreate: function () {
            this.inherited(arguments);

            var container = document.createElement("div");
            container.style.width = "500px";
            this.containerNode.appendChild(container);

            this._divUserInput = document.createElement("div");
            if (this.socialProfile.socialNetwork.userSearchMashupName) {
                // in this case we are doing a user search, we need to prompt for a person name
                domConstruct.place("<label class='lbl'>" + Resources.lblPersonSearch + ":</label>", this._divUserInput);
                this._txtUsername = new TextBox({ value: this.socialProfile.SocialUserName });
            } else {
                // in this case we are only prompting for a handle
                domConstruct.place("<label class='lbl'>" + Resources.lblScreenName + ":</label>", this._divUserInput);
                this._txtUsername = new TextBox({ value: "@" + (this.socialProfile.SocialUserName || "") });
            }
            var txtDiv = document.createElement("div");
            txtDiv.className = "textcontrol";
            txtDiv.appendChild(this._txtUsername.domNode);
            this._divUserInput.appendChild(txtDiv);
            domConstruct.place("<br/>", this._divUserInput);

            // search box
            if (this.socialProfile.socialNetwork.enableSearch) {
                domConstruct.place("<br/>", this._divUserInput, "last");
                domConstruct.place("<label class='lbl'>Keywords:</label>", this._divUserInput);
                this._txtKeywords = new TextBox({ value: this.socialProfile.SocialKeywords });
                var txtDiv = document.createElement("div");
                txtDiv.className = "textcontrol";
                txtDiv.appendChild(this._txtKeywords.domNode);
                this._divUserInput.appendChild(txtDiv);
            }
            domConstruct.place(this._divUserInput, container);

            this._divUserSelect = document.createElement("div");
            this._divUserSelect.style.display = "none";
            domConstruct.place("<label>" + Resources.moreThan1MatchPleaseSelectUser + "</label>", this._divUserSelect);
            this._divUserSelect.appendChild(document.createElement("br"));
            this._ddlUsers = new UserSelectionDropdown({ style: 'width: 90%' }, document.createElement("div"));
            this._divUserSelect.appendChild(this._ddlUsers.domNode);
            domConstruct.place(this._divUserSelect, container);

            domConstruct.place("<br style='clear: both'/>", container);

            // create OK/Cancel button panel
            var buttonPanel = document.createElement("div");
            buttonPanel.style.textAlign = "right";
            var btnOk = document.createElement("button");
            btnOk.appendChild(document.createTextNode("OK"));
            btnOk.className = "slxbutton";
            buttonPanel.appendChild(btnOk);
            var btnCancel = document.createElement("button");
            btnCancel.appendChild(document.createTextNode("Cancel"));
            btnCancel.className = "slxbutton";
            buttonPanel.appendChild(btnCancel);
            container.appendChild(buttonPanel);

            on(btnOk, "click", lang.hitch(this, function () { this._onOkClick() }));
            on(btnCancel, "click", lang.hitch(this, "_onCancelClick"));

            this._onOkClick = this._validateUsername;
        },

        _validateUsername: function () {
            // take the selected username and verify that it is valid
            // if more than 1 matches are returned, ask the user to select which one is valid
            // otherwise, if 1 match is returned, go ahead and save teh configuration then close the dialog
            // if 0 match is returned, give an error message
            var userName = this._txtUsername.get('value');
            userName = userName.replace(/^@/, "");
            if (userName) {
                this.socialProfile.socialNetwork.getUserMatches(userName).then(lang.hitch(this, function (matches) {
                    if (matches.length == 1) {
                        this._setUserConfiguration(new UserSelection(matches[0]));
                    } else if (matches.length == 0) {
                        SageDialogs.alert(Resources.socialProfileInvalidUser);
                    } else {
                        this._showUserSelection(matches);
                    }
                }));
            }
        },

        _showUserSelection: function (matches) {
            this._onOkClick = lang.hitch(this, "_onUserSelected");
            this._divUserInput.style.display = "none";
            this._divUserSelect.style.display = "block";
            this._ddlUsers.setUsers(matches);
        },

        _setUserConfiguration: function (selection) {
            var userId = selection.id;
            this.socialProfile.SocialUserId = userId;
            this.socialProfile.SocialUserName = selection.screenName;
            if (this._txtKeywords) {
                this.socialProfile.SocialKeywords = this._txtKeywords.get('value');
            }
            this.socialProfile.saveConfiguration();
            this.destroy();

            // Do we need to give an error if the user is not valid? 
            // Not necessarily, because we may still want to get their profile!
            //            this.socialProfile.socialNetwork.validateUser(userId).then(lang.hitch(this, function (isValid) {
            //                if (isValid) {
            //                    
            //                } else {
            //                    if (selection.profileUrl) {
            //                        SageDialogs.alert(djString.substitute(Resources.socialProfileInvalidUserWithProfileLink, { url: selection.profileUrl }));
            //                    } else {
            //                        SageDialogs.alert(Resources.socialProfileInvalidUser);
            //                    }
            //                }
            //            }));
        },

        _onUserSelected: function () {
            // handler for "OK" once they have selected a user in the dropdown
            var selection = this._ddlUsers.item;
            if (!selection)
                return;
            this._setUserConfiguration(selection);
        },

        _onCancelClick: function () {
            this.destroy();
        }
    });

    var SocialProfile = declare(null, {
        socialNetwork: null,   // SocialNetworkConfiguration object
        SocialUserId: null,
        SocialUserName: null,
        SocialKeywords: null,
        _sandbox: null,

        constructor: function (opts) {
            lang.mixin(this, opts);
        },

        isConfigured: function () {
            return !!this.SocialUserId;
        },

        configure: function () {
            // used to bring up configuration for the social profile (this lets the user select the username to be associated for this entity)
            if (!this.socialNetwork.isAuthenticated()) {
                SageDialogs.alert(Resources.socialNetworkNotAuthenticated);
                return;
            }
            var dlg = new SocialProfileConfigurationDialog({ socialProfile: this, title: this.socialNetwork.name + " - " + Resources.configureProfileText });
            dlg.show();
        },

        saveConfiguration: function () {
            this._sandbox.publish("SocialProfile/Updated", this);
        },

        initModule: function (sb) {
            this._sandbox = sb;
        }
    });

    var SocialNetworkConfiguration = declare(null, {
        imageUrl: null,
        inactiveImageUrl: null,
        name: null,
        userSearchMashupName: "",  // name of mashup to use for user search (can be blank if user search not relevant for this provider)
        updateFeedMashupName: "",  // name of mashup to use for status updates data
        enableSearch: false,     // possible to do a search by keyword?
        entityId: null,  // current SLX entity id
        _sandbox: null,  // reference to app object

        constructor: function (opts) {
            lang.mixin(this, opts);
        },

        initModule: function (sb) {
            this._sandbox = sb;
            sb.subscribe("App/Start", lang.hitch(this, "_loadConfigurationFromDatabase"));
            sb.subscribe("SocialProfile/Updated", lang.hitch(this, "_onSocialProfileUpdated"));
        },

        getUserMatches: function (userName) {
            // return profiles matching the specified username
            // For some networks the username is a unique identifier
            var def = new Deferred();
            if (this.userSearchMashupName == null) {
                def.resolve([{ UserID: userName, Description: userName, ScreenName: userName}]);
            } else {
                var mashupParams = { _Search: userName, _resultName: "AllResults", format: "json" };
                var mashupUrl = "slxdata.ashx/$app/mashups/-/mashups('" + this.userSearchMashupName + "')/$queries/execute";

                var app = this._sandbox;
                this._sandbox.ajax.xhrGet(mashupUrl, mashupParams).then(function (data) {
                    var matches = data.$resources;
                    def.resolve(matches);
                }).then(null, function (err) { app.error(err) });
            }

            return def;
        },

        isAuthenticated: function () {
            // TODO
            return true;
        },

        _loadConfigurationFromDatabase: function () {
            // load social profile info
            // if there isn't one configured yet we'll load an empty one
            var sb = this._sandbox;
            sb.sdata.read("entitySocialProfiles", "EntityId eq '" + this.entityId + "' and NetworkName eq '" + this.name + "'").then(lang.hitch(this, function (result) {
                var sp = null;
                sp = new SocialProfile({ socialNetwork: this });
                if (result.$resources.length > 0) {
                    lang.mixin(sp, result.$resources[0]);
                }
                sb.addSubModule(sp);
                sb.publish("SocialProfile/Loaded", sp);
            })).then(null, function (err) {
                sb.error(err);
            }); ;
        },

        _onSocialProfileUpdated: function (prof) {
            if (prof.socialNetwork.name == this.name)
                this.saveSocialProfile(prof);
        },


        saveSocialProfile: function (prof) {
            // save the given profile to the database
            // multiple requests to save the profile are queued to avoid inserting multiple records
            var sb = this._sandbox;
            if (this._saveQueue) {
                this._saveQueue.push(prof);
                return;
            }
            this._saveQueue = [];
            var def;
            var data = {
                EntityId: this.entityId,
                NetworkName: this.name
            };
            lang.mixin(data, prof);
            for (var k in data) {
                // remove object and "special" properties
                if (typeof (data[k]) == "object" || (k != "$key" && /^\$/.test(k)))
                    delete data[k];
            }
            if (prof.$key) {
                def = sb.sdata.update("entitySocialProfiles", data);
            } else {
                def = sb.sdata.create("entitySocialProfiles", data).then(function (res) { prof.$key = res.$key });
            }
            def.then(lang.hitch(this, function () {
                if (this._saveQueue && this._saveQueue.length > 0) {
                    var queuedProf = this._saveQueue.shift();
                    if (this._saveQueue.length == 0)
                        this._saveQueue = null;
                    this.saveSocialProfile(queuedProf);
                } else {
                    this._saveQueue = null;
                    sb.publish("SocialProfile/Saved", prof);
                }
            }));
            return def;
        }
    });

    return SocialNetworkConfiguration;
});