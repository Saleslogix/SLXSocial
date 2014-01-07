// Social queue app, responsible for instantiating module and relaying the events between them.
// The app uses a modular design with a pub/sub model for events

define(['dojo/_base/declare', '../Sandbox', './MainView', '../MashupDataProvider', '../ContextActionsModule', './SearchPersistenceModule'],
function (declare, Sandbox, MainView, MashupDataProvider, ContextActionsModule, SearchPersistenceModule) {
    var SQApp = declare(Sandbox.Core, {
        constructor: function (containerNode, entityId) {
            // default extensions
            this.addExtension('ajax', new Sandbox.Ajax());
            this.addExtension('sdata', new Sandbox.SData());
            this.addModule(new Sandbox.AjaxIndicatorModule('asyncpostbackindicator'));


            var view = new MainView({}, containerNode);
            this.addModule(view);
            this.addModule(new MashupDataProvider("TwitterSearch"));
            this.addModule(new ContextActionsModule());
            this.addModule(new SearchPersistenceModule());
        },

        startAll: function () {
            this.publish(null, "App/Start");
        }
    });

    return SQApp;
});