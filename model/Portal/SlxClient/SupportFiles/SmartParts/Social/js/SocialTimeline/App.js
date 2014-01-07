// Social queue app, responsible for instantiating module and relaying the events between them.
// The app uses a modular design with a pub/sub model for events

define(['dojo/_base/declare', '../Sandbox', './MainView', './SocialProfileUpdates', '../ContextActionsModule', '../SocialProfile/DefineSocialNetworks'],
function (declare, Sandbox, MainView, SocialProfileUpdates, ContextActionsModule, DefineSocialNetworks) {
    var STApp = declare(Sandbox.Core, {
        constructor: function (containerNode, cmdFilterToolId, cmdAddProfileToolId) {
            // default extensions
            this.addExtension('ajax', new Sandbox.Ajax());
            this.addExtension('sdata', new Sandbox.SData());
            this.addModule(new Sandbox.AjaxIndicatorModule('asyncpostbackindicator'));

            this.addModule(new MainView({ cmdFilterToolId: cmdFilterToolId, cmdAddProfileToolId: cmdAddProfileToolId }, containerNode));

            this.addModule(new SocialProfileUpdates());

            DefineSocialNetworks(this);

            this.addModule(new ContextActionsModule());
        },

        startAll: function () {
            this.publish(null, "App/Start");
        }
    });

    return STApp;
});