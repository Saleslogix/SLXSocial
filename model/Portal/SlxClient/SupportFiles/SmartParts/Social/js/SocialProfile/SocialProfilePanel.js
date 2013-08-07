/*
* Small UI module used for the actual display of the social profile.
* 
* Events in:
*  - SocialProfile/Updated
*  - SocialProfile/Loaded - display the profile.  If there is no profile data, we'll send a SocialProfile/Refresh event at this time.
*  - Data/RemoveNetwork (we'll hide the corresponding profile)
*
* Events out:
*  - SocialProfile/Refresh
*/

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom-construct', 'dojo/query', 'dojo/on', 'dijit/_Widget', 'dijit/_TemplatedMixin', 'dojo/string', '../Utility',
    'dojo/i18n!../nls/Resources'],
function (declare, lang, array, domConstruct, query, on, _Widget, _TemplatedMixin, djString, Utility, Resources) {
    var ProfileView = declare([_Widget], {
        socialProfile: null,  // profile to be displayed
        templateString: "<div class='social-profile'></div>",

        initModule: function (sb) {
            this._sandbox = sb;
        },

        updateSocialProfile: function (prof) {
            this.socialProfile = prof;
            var sb = this._sandbox;
            domConstruct.empty(this.domNode);
            var container = document.createElement("div");
            container.className = "social-profile";
            if (prof.PictureUrl) {
                domConstruct.place("<img class='s-profile-picture' src='" + prof.PictureUrl + "' alt='" + Resources.userPictureText + "'/>", container);
            }

            var summaryDiv = document.createElement("div");
            summaryDiv.className = 's-summary';
            domConstruct.place("<div class='s-title'>" + Utility.escapeHTML(prof.FormattedName) + "</div>", summaryDiv);
            if (prof.Headline) {
                domConstruct.place("<div class='s-headline'>" + Utility.escapeHTML(prof.Headline) + "</div>", summaryDiv);
            }

            var subtitle = document.createElement("div");
            subtitle.className = "s-subtitle";
            array.forEach([prof.Location, prof.Industry], function (sub) {
                if (sub) {
                    domConstruct.place("<span>" + Utility.escapeHTML(sub) + "</span>", subtitle);
                }
            });
            summaryDiv.appendChild(subtitle);

            if (prof.PreviousEmployers) {
                domConstruct.place("<div class='s-previous-employers'><label>" + Resources.previousEmployerText + ":</label> " + Utility.escapeHTML(prof.PreviousEmployers) + "</div>", summaryDiv);
            }

            container.appendChild(summaryDiv);
            container.appendChild(document.createElement("br"));


            if (prof.ProfessionalSummary) {
                domConstruct.place("<span class='s-description'>" + Utility.escapeHTML(prof.ProfessionalSummary) + "</span>", container);
            }
            if (prof.ProfessionalSpecialties) {
                domConstruct.place("<span class='s-description'><label>" + Resources.specialtiesText + "</label>: " + Utility.escapeHTML(prof.ProfessionalSpecialties) + "</span>", container);
            }
            domConstruct.place("<div class='s-profile-link'>" +
                "<a href='" + prof.ProfileUrl + "' target='_blank' title='" + Resources.viewProfileText + "'><img src='" + prof.socialNetwork.imageUrl + "' alt='" + Resources.viewProfileText + "'/></a>" +
                "<a href='javascript:void(0)' name='lnkRefresh' target='_blank' title='" + Resources.refreshText + "'><img src='images/icons/refresh.png' alt='" + Resources.refreshText + "'/></a>" +
                "</div>", container);
            on(query("[name=lnkRefresh]", container)[0], "click", function () {
                sb.publish("SocialProfile/Refresh", prof);
            });

            this.domNode.appendChild(container);
        }
    });

    return declare([_Widget], {
        _sandbox: null,
        _displayedProfiles: null,

        initModule: function (sb) {
            this._sandbox = sb;
            this._displayedProfiles = [];
            sb.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onSocialProfileLoaded"));
            sb.subscribe("SocialProfile/Updated", lang.hitch(this, "_onSocialProfileLoaded"));
            sb.subscribe("Data/RemoveNetwork", lang.hitch(this, "_onSocialNetworkRemoved"));
        },

        _onSocialProfileLoaded: function (prof) {
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
                dp = new ProfileView({});
                this._sandbox.addSubModule(dp);
                this.domNode.appendChild(dp.domNode);
                this._displayedProfiles.push(dp);
            }
            dp.updateSocialProfile(prof);
        },

        _onSocialNetworkRemoved: function (prof) {
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