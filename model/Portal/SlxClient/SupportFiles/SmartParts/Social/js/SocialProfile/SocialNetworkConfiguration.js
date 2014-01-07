/*
* Configuration of the social profile for a single social network.
*
* TODO: this should be broken down in 2 modules at least, it is a bit too big right now
*
* Events in: 
*   App/Start - load initial configuration
*   SocialProfile/Updated - indicates another module has updated the profile (we'll save it to the DB at that time)
*   SocialProfile/Delete
*
* Events out:
*   SocialProfile/Loaded - indicate configuration has been loaded for a social profile
*   SocialProfile/Configured - indicate the user has provided configuration (user name) for a social profile
*   SocialProfile/Saved - indicates the social profile has been committed to the DB
*   SocialNetwork/Defined - indicates the social network has been defined  
*   SocialProfile/Deleted
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
            this.name = userProfile.Description || userProfile.LastName;
            this.screenName = userProfile.ScreenName || this.name;
            this.profileUrl = userProfile.ProfileUrl;
            var imgUrl = userProfile.PictureUrl || "ImageResource.axd?scope=global&type=Global_Images&key=Groups_32x32";
            this.label = '<img src="' + imgUrl + '" alt="' + Resources.profilePicture + '" height="32" width="32"/>' +
                Utility.escapeHTML(this.name);
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

            on(this._txtUsername, "keyPress", lang.hitch(this, function (evt) {
                if (evt.keyCode == 13) {
                    this._onOkClick();
                }
            }));
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
            this.socialNetwork.checkAuthentication().then(lang.hitch(this, function (isAuth) {
                if (isAuth) {
                    var dlg = new SocialProfileConfigurationDialog({ socialProfile: this, title: this.socialNetwork.name + " - " + Resources.configureProfileText });
                    dlg.show();
                }
            }));
        },

        saveConfiguration: function () {
            this._sandbox.publish("SocialProfile/Configured", this);
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
        _authenticated: null,

        constructor: function (opts) {
            lang.mixin(this, opts);
        },

        initModule: function (sb) {
            this._sandbox = sb;
            sb.subscribe("App/Start", lang.hitch(this, "_onAppStart"));
            // when the profile is updated (refreshed), we are going to go ahead and save it to the DB.
            // most of the info is NOT saved (because it would be against TOS), but we do keep the profile image URL and name
            sb.subscribe("SocialProfile/Updated", lang.hitch(this, "_onSocialProfileUpdated"));
            sb.subscribe("SocialProfile/Delete", lang.hitch(this, "_onSocialProfileDelete"));
            // when the profile is configured let's go ahead and save the id to the DB
            sb.subscribe("SocialProfile/Configured", lang.hitch(this, "_onSocialProfileConfigured"));
        },

        // public API

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
            // check authentication (with no error message if not currently authenticated)
            var def = new Deferred();
            if (this._authenticated === null) {
                var userId = Sage.Utility.getClientContextByKey("userID");
                this._sandbox.sdata.read("userOAuthTokens", "OAuthProvider.ProviderKey eq '" + this.name + "' and User.Id eq '" + userId +
                        "' and (ExpirationDate eq null or ExpirationDate gt '" + (new Date()).toISOString() + "')")
                .then(lang.hitch(this, function (result) {
                    this._authenticated = false;
                    if (result.$resources.length > 0) {
                        this._authenticated = true;
                    }
                    def.resolve(this._authenticated);
                }));
            } else {
                def.resolve(this._authenticated);
            }
            return def;
        },

        checkAuthentication: function () {
            // check if the user has a configured authentication for this network
            // if they do, then return true (on a deferred)
            // otherwise, return false, and show an error message
            var def = new Deferred();
            this.isAuthenticated().then(function (isAuth) {
                if (!isAuth) {
                    SageDialogs.raiseQueryDialog('', Resources.socialNetworkNotAuthenticated, function (selection) {
                        if (selection) {
                            window.location.href = "UserOptions.aspx";
                        }
                    }, Resources.setupNowText, Resources.cancelText, "infoIcon");
                }
                def.resolve(isAuth);
            });
            return def;
        },

        addProfile: function () {
            // bring up configuration dialog for a new profile
            var prof = new SocialProfile({ socialNetwork: this });
            this._sandbox.addModule(prof);
            prof.configure();
        },

        // App events

        _onAppStart: function () {
            this._sandbox.publish("SocialNetwork/Defined", this);
            this._loadConfigurationFromDatabase();
        },

        _loadConfigurationFromDatabase: function () {
            // load social profile info, if available for this network
            // note there can be more than 1 profile
            var app = this._sandbox;

            app.sdata.read("socialProfiles", "EntityId eq '" + this.entityId + "' and NetworkName eq '" + this.name + "'").then(lang.hitch(this, function (result) {
                array.forEach(result.$resources, lang.hitch(this, function (profData) {
                    var sp = null;

                    sp = new SocialProfile({ socialNetwork: this });
                    lang.mixin(sp, profData);
                    app.addModule(sp);

                    app.publish("SocialProfile/Loaded", sp);
                }));
            })).then(null, function (err) {
                app.error(err);
            });
        },

        _onSocialProfileUpdated: function (prof) {
            if (prof.socialNetwork.name == this.name && prof.dirty) {
                delete prof.dirty;  // dirty flag avoids spurious saves
                this.saveSocialProfile(prof);
            }
        },

        _onSocialProfileConfigured: function (prof) {
            if (prof.socialNetwork.name == this.name)
                this.saveSocialProfile(prof);
        },

        _onSocialProfileDelete: function (prof) {
            if (prof.socialNetwork.name == this.name) {
                var sb = this._sandbox;
                if (prof.$key) {
                    sb.sdata.destroy("socialProfiles", prof.$key).then(function () {
                        sb.publish("SocialProfile/Deleted", prof);
                    });
                } else {
                    sb.publish("SocialProfile/Deleted", prof);
                }
            }
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
                if (typeof (data[k]) == "object" || (k != "$key" && k[0] == "$"))
                    delete data[k];
            }
            if (prof.$key) {
                def = sb.sdata.update("socialProfiles", data);
            } else {
                def = sb.sdata.create("socialProfiles", data).then(function (res) { prof.$key = res.$key });
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