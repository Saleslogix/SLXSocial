define(['dojo/_base/declare', 'dijit/_Widget',
    './SocialTimeline', '../SocialProfile/SocialProfileSelector', '../SocialProfile/DefaultPanel', 'dijit/_TemplatedMixin', '../Utility'],
function (declare, _Widget, SocialTimeline, SocialProfileSelector, DefaultPanel, _TemplatedMixin, Utility) {
    // Main view for the social timeline
    // Responsible for creating timeline and Filter Panel
    return declare([_Widget, _TemplatedMixin], {
        templateString: "<table style='width: 100%' class='social-profile'>" +
            "<tr><td data-dojo-attach-point='tdLeft' style='vertical-align: top'></td></tr><tr>" +
            "<td data-dojo-attach-point='tdRight' style='width: 100%; vertical-align: top'></td></tr>" +
            "</table>",
        cmdFilterToolId: "",
        cmdAddProfileToolId: "",

        initModule: function (app) {
            this._app = app;

            var filter = new SocialProfileSelector({ cmdFilterToolId: this.cmdFilterToolId, cmdAddProfileToolId: this.cmdAddProfileToolId });
            this.tdLeft.appendChild(filter.domNode);
            app.addModule(filter);

            var def = new DefaultPanel({  });
            this.tdRight.appendChild(def.domNode);
            app.addModule(def);

            var timelineDiv = document.createElement("div");
            timelineDiv.style.width = "100%";
            timelineDiv.style.height = "300px";
            this.tdRight.appendChild(timelineDiv);
            var timeline = new SocialTimeline({}, timelineDiv);

            // Timeline module needs to go after the configuration modules
            app.addModule(timeline);
            Utility.loadCss("SmartParts/Social/css/Social.css");
        },

        postCreate: function () {
            this.inherited(arguments);

        }
    });
});