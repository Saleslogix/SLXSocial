define(['dojo/_base/declare', 'dijit/_Widget',
    '../SocialQueue/ResultPanel', '../SocialProfile/FilterPanel', 'dijit/_TemplatedMixin'],
function (declare, _Widget, ResultPanel, FilterPanel, _TemplatedMixin) {
    // Main view for the social queue
    // Responsible for creating Result Panel, Filter Panel, 
    return declare([_Widget, _TemplatedMixin], {
        templateString: "<table style='width: 100%' class='social-updates'>" +
            "<tr><td data-dojo-attach-point='tdLeft' style='vertical-align: top'></td>" +
            "<td data-dojo-attach-point='tdRight' style='width: 100%; vertical-align: top'></td></tr>" +
            "</table>",
        cmdFilterId: "",  // id of button used to toggle filter panel

        initModule: function (app) {
            this._app = app;

            var filter = new FilterPanel({ style: "width: 100px", cmdFilterId: this.cmdFilterId });
            this.tdLeft.appendChild(filter.domNode);
            app.addSubModule(filter);


            var result = new ResultPanel({ style: "max-height: 300px; overflow: auto" });
            this.tdRight.appendChild(result.domNode);
            app.addSubModule(result);
        },

        postCreate: function () {
            this.inherited(arguments);

        }
    });
});