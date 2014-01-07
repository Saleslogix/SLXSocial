/*
 * Social Updates app - this displays the user's updates in a linear form
 */
define(['dojo/_base/declare', '../Sandbox', './MainView', '../MashupDataProvider', '../SocialTimeline/SocialProfileUpdates', '../ContextActionsModule', '../SocialProfile/DefineSocialNetworks'],
function (declare, Sandbox, MainView, MashupDataProvider, SocialProfileUpdates, ContextActionsModule, DefineSocialNetworks) {
    var SPApp = declare(Sandbox.Core, {
        constructor: function (containerNode, cmdFilterToolId, cmdAddProfileToolId) {
            // default extensions
            this.addExtension('ajax', new Sandbox.Ajax());
            this.addExtension('sdata', new Sandbox.SData());
            this.addModule(new Sandbox.AjaxIndicatorModule('asyncpostbackindicator'));


            var view = new MainView({ cmdFilterToolId: cmdFilterToolId, cmdAddProfileToolId: cmdAddProfileToolId }, containerNode);
            this.addModule(view);
            this.addModule(new ContextActionsModule());
            this.addModule(new SocialProfileUpdates());

            DefineSocialNetworks(this);
        },

        startAll: function () {
            this.publish(null, "App/Start");
        }
    });

    return SPApp;
});