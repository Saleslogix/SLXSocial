// Social queue app, responsible for instantiating module and relaying the events between them.
// The app uses a modular design with a pub/sub model for events

define(['dojo/_base/declare', '../Sandbox', './MainView', './SocialProfileUpdates', '../ContextActionsModule', '../SocialProfile/DefineSocialNetworks'],
function (declare, Sandbox, MainView, SocialProfileUpdates, ContextActionsModule, DefineSocialNetworks) {
    var STApp = declare(Sandbox.Core, {
        constructor: function (containerNode, cmdFilterId) {
            // default extensions
            this.addExtension('ajax', new Sandbox.Ajax());
            this.addExtension('sdata', new Sandbox.SData());
            this.addModule(new Sandbox.AjaxIndicatorModule('asyncpostbackindicator'));
            this.addModule(new SocialProfileUpdates());

            DefineSocialNetworks(this);

            this.addModule(new MainView({ cmdFilterId: cmdFilterId }, containerNode));

            // create user interface
            //            var tagList = new TagList({});
            //            containerNode.appendChild(tagList.domNode);

            //            var timelineDiv = document.createElement("div");
            //            timelineDiv.style.width = "100%";
            //            timelineDiv.style.height = "300px";
            //            containerNode.appendChild(timelineDiv);
            //            var timeline = new SocialTimeline({}, timelineDiv);

            //            this.addModule(tagList);
            //            this.addModule(new ConfigurationDialog({ triggerButtonId: optionsButtonId, saveButtonId: saveButtonId, formPrefix: formPrefix }));
            //            this.addModule(new DefaultTagList(formPrefix + "_hidSocialTags"), saveButtonId);

            // data provider for the mashups
            //this.addModule(new MashupDataProvider("TwitterSearch"));

            // Timeline module needs to go after the configuration modules
            //            this.addModule(timeline);

            this.addModule(new ContextActionsModule());
        },

        startAll: function () {
            this.publish(null, "App/Start");
        }
    });

    return STApp;
});