define(['dojo/_base/declare', 'dijit/_Widget',
    './SocialTimeline', '../SocialProfile/FilterPanel', 'dijit/_TemplatedMixin', '../Utility'],
function (declare, _Widget, SocialTimeline, FilterPanel, _TemplatedMixin, Utility) {
    // Main view for the social timeline
    // Responsible for creating timeline and Filter Panel
    return declare([_Widget, _TemplatedMixin], {
        templateString: "<table style='width: 100%' class='social-profile'>" +
            "<tr><td data-dojo-attach-point='tdLeft' style='vertical-align: top'></td>" +
            "<td data-dojo-attach-point='tdRight' style='width: 100%; vertical-align: top'></td></tr>" +
            "</table>",
        cmdFilterId: "",

        initModule: function (app) {
            this._app = app;

            var filter = new FilterPanel({ style: "width: 100px", cmdFilterId: this.cmdFilterId });
            this.tdLeft.appendChild(filter.domNode);
            app.addSubModule(filter);

            var timelineDiv = document.createElement("div");
            timelineDiv.style.width = "100%";
            timelineDiv.style.height = "300px";
            this.tdRight.appendChild(timelineDiv);
            var timeline = new SocialTimeline({}, timelineDiv);

            // Timeline module needs to go after the configuration modules
            app.addSubModule(timeline);
            Utility.loadCss("SmartParts/Social/css/Social.css");
        },

        postCreate: function () {
            this.inherited(arguments);

        }
    });
});