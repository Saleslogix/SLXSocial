/*
* Social Profile - ability to display the user's profile as retrieved from the social network
*
* Events out:
*  App/Start
*
* Events in:
*
*/
define(['dojo/_base/declare', '../Sandbox', './DefineSocialNetworks', './SocialProfilePanel', './FilterPanel', './SocialProfileModule', '../Utility',
'dijit/_Widget', 'dijit/_TemplatedMixin'],
function (declare, Sandbox, DefineSocialNetworks, SocialProfilePanel, FilterPanel, SocialProfileModule, Utility,
        _Widget, _TemplatedMixin) {

    var MainView = declare([_Widget, _TemplatedMixin], {
        templateString: "<table style='width: 100%' class='social-profile'>" +
            "<tr><td data-dojo-attach-point='tdLeft' style='vertical-align: top'></td>" +
            "<td data-dojo-attach-point='tdRight' style='width: 100%; vertical-align: top'></td></tr>" +
            "</table>",

        initModule: function (app) {
            this._app = app;

            var filter = new FilterPanel({ style: "width: 100px", whereNetworkIs: function (net) {
                // we only want to show the ones that have a profile API
                return !!net.profileMashupName
            } 
            });
            this.tdLeft.appendChild(filter.domNode);
            app.addSubModule(filter);

            var result = new SocialProfilePanel({ style: "max-height: 300px; overflow: auto" });
            this.tdRight.appendChild(result.domNode);
            app.addSubModule(result);


            Utility.loadCss("SmartParts/Social/css/Social.css");
        },

        postCreate: function () {
            this.inherited(arguments);

        }
    });

    var SPApp = declare(Sandbox.Core, {
        constructor: function (containerNode) {
            // default extensions
            this.addExtension('ajax', new Sandbox.Ajax());
            this.addExtension('sdata', new Sandbox.SData());
            this.addModule(new Sandbox.AjaxIndicatorModule('asyncpostbackindicator'));


            var view = new MainView({}, containerNode);
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