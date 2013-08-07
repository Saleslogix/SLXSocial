define(['dojo/_base/declare', 'dijit/_Widget',
    './ResultPanel', './FilterPanel'],
function (declare, _Widget, ResultPanel, FilterPanel) {
    // Main view for the social queue
    // Responsible for creating Result Panel, Filter Panel, 
    return declare([_Widget], {
        initModule: function (app) {
            this._app = app;
            app.addSubModule(this._filter);
            app.addSubModule(this._result);
        },
        buildRendering: function () {
            this.inherited(arguments);
            this._filter = new FilterPanel({});            
            this.domNode.appendChild(this._filter.domNode);
            this._result = new ResultPanel({});            
            this.domNode.appendChild(this._result.domNode);
        }
    });
});