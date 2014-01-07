/*
* Social Profile - ability to display the user's profile as retrieved from the social network
*
* Events out:
*  App/Start
*
* Events in:
*
*/
define(['dojo/_base/declare', 'dojo/_base/lang', '../Sandbox', './SocialProfilePanel', 'dijit/_Widget', 'dijit/_TemplatedMixin',
'./SocialProfileSelector', './SocialProfileModule', './DefaultPanel', '../Utility',
"./DefineSocialNetworks"],
function (declare, lang, Sandbox, SocialProfilePanel, _Widget, _TemplatedMixin,
    SocialProfileSelector, SocialProfileModule, DefaultPanel, Utility,
    DefineSocialNetworks) {

    var MainView = declare([_Widget, _TemplatedMixin], {
        templateString: "<table style='width: 100%' class='social-profile'>" +
            "<tr><td data-dojo-attach-point='tdLeft' style='vertical-align: top'></td></tr><tr>" +
            "<td data-dojo-attach-point='tdRight' style='width: 100%; vertical-align: top'></td></tr>" +
            "</table>",
        cmdFilterToolId: "",
        cmdAddProfileToolId: "",

        initModule: function (app) {
            this._app = app;

            var whereNetworkIs = function (net) {
                // we only want to show the ones that have a profile API
                return !!net.profileMashupName
            };
            var filter = new SocialProfileSelector({ whereNetworkIs: whereNetworkIs, cmdFilterToolId: this.cmdFilterToolId, cmdAddProfileToolId: this.cmdAddProfileToolId });
            this.tdLeft.appendChild(filter.domNode);
            app.addModule(filter);

            var def = new DefaultPanel({ whereNetworkIs: whereNetworkIs });
            this.tdRight.appendChild(def.domNode);
            app.addModule(def);

            var result = new SocialProfilePanel({ style: "max-height: 300px; overflow: auto" });
            this.tdRight.appendChild(result.domNode);
            app.addModule(result);


            Utility.loadCss("SmartParts/Social/css/Social.css");
        },

        postCreate: function () {
            this.inherited(arguments);

        }
    });

    var SPApp = declare(Sandbox.Core, {
        constructor: function (containerNode, cmdFilterToolId, cmdAddProfileToolId) {
            // default extensions
            this.addExtension('ajax', new Sandbox.Ajax());
            this.addExtension('sdata', new Sandbox.SData());
            this.addModule(new Sandbox.AjaxIndicatorModule('asyncpostbackindicator'));

            var view = new MainView({ cmdFilterToolId: cmdFilterToolId, cmdAddProfileToolId: cmdAddProfileToolId }, containerNode);
            this.addModule(view);

            this.addModule(new SocialProfileModule());
            DefineSocialNetworks(this);
        },

        startAll: function () {
            this.publish(null, "App/Start");
        }
    });

    return SPApp;
});