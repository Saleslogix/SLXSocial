
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom-construct', 'dojo/query', 'dojo/on', 'dijit/_Widget', 'dijit/_TemplatedMixin', 'dojo/string', '../Utility',
    'dojo/i18n!../nls/Resources'],
function (declare, lang, array, domConstruct, query, on, _Widget, _TemplatedMixin, djString, Utility, Resources) {
    return declare([_Widget], {
        socialProfile: null,  // profile to be displayed

        initModule: function (sb) {
            this._sandbox = sb;
        },

        updateSocialProfile: function (prof) {
            var ctxService = Sage.Services.getService('ClientEntityContext');
            var ctx = ctxService.getContext();

            if (ctx.EntityTableName != "ACCOUNT") {
                this.updateSocialProfileBusiness(prof);
            } else {
                this.updateSocialProfilePerson(prof);
            }                            
        },

        /*****
            * People profile view (for persons)
            ******/
        updateSocialProfilePerson: function (prof) {
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


            if (prof.Summary) {
                domConstruct.place("<span class='s-description'>" + Utility.escapeHTML(prof.Summary) + "</span>", container);
            }
            domConstruct.place("<br style='clear: both'/>", container);
            if (prof.ProfessionalSpecialties) {
                domConstruct.place("<span class='s-description'>" + Utility.escapeHTML(prof.ProfessionalSpecialties) + "</span>", container);
            }
            domConstruct.place("<div class='s-profile-link'>" +
    "<a href='" + prof.ProfileUrl + "' target='_blank' title='" + Resources.viewProfileText + "'><img src='" + prof.socialNetwork.imageUrl + "' alt='" + Resources.viewProfileText + "'/></a>" +
    "<a href='javascript:void(0)' name='lnkRefresh' target='_blank' title='" + Resources.refreshText + "'><img src='images/icons/refresh.png' alt='" + Resources.refreshText + "'/></a>" +
    "</div>", container);
            on(query("[name=lnkRefresh]", container)[0], "click", function () {
                sb.publish("SocialProfile/Refresh", prof);
            });

            this.domNode.appendChild(container);
        },

        /*******
            * Business Profile View (for account entity)
            *******/
        updateSocialProfileBusiness: function (prof) {
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
            var name = prof.FormattedName;
            if (prof.Ticker)
                name += " (" + prof.Ticker + ")";
            domConstruct.place("<div class='s-title'>" + Utility.escapeHTML(name) + "</div>", summaryDiv);
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

            container.appendChild(summaryDiv);
            container.appendChild(document.createElement("br"));

            if (prof.Description) {
                domConstruct.place("<div class='s-description'>" + Utility.escapeHTML(prof.Description) + "</div>", container);
            }

            var founded = prof.FoundedYear;
            if (!founded) {
                if (prof.EndYear) {
                    founded = "? - " + prof.EndYear;
                }
            } else {
                if (prof.EndYear) {
                    founded = founded + " - " + prof.EndYear;
                }
            }
            if (founded) {
                domConstruct.place("<div class='s-description'><label>" + Resources.foundedText + ": </label>" + founded + "</div>", container);
            }

            if (prof.ProfileUrl) {
                domConstruct.place("<div class='s-description'><label>" + Resources.websiteText + ": </label><a href='" + prof.ProfileUrl + "' target='_blank'>" +
                prof.ProfileUrl + "</a></div>", container);
            }
            if (prof.EmployeeCount) {
                domConstruct.place("<div class='s-description'><label>" + Resources.companySizeText + ": </label>" + prof.EmployeeCount + "</div>", container);
            }
            if (prof.ProfessionalSpecialties) {
                domConstruct.place("<div class='s-description'><label>" + Resources.specialtiesText + ": </label>" + Utility.escapeHTML(prof.ProfessionalSpecialties) + "</div>", container);
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
});