define(['dojo/_base/declare', 'dijit/_Widget', 'dijit/layout/ContentPane',
    './SearchTabs'],
function (declare, _Widget, ContentPane, SearchTabs) {
    // Main view for the social queue
    // Responsible for creating Result Panel, Filter Panel, 
    return declare([_Widget], {
        initModule: function (app) {
            this._app = app;
            app.addModule(this._result);
        },
        buildRendering: function () {
            this.inherited(arguments);
            // we have to hack into the page's layout to remove the top title
            // (we just want to use the tab bar, like SLX does in a group view)
            var ib = dijit.byId('innerBorder');
            var center = dijit.byId('centerContent');
            ib.removeChild(center);
            var div = document.createElement("div");
            div.style.height = "100%";
            div.style.width = "99%";

            var br = document.createElement("br");
            br.style.clear = "both";
            this.domNode.appendChild(br);

            var cp = new ContentPane({ region: 'center' });
            cp.containerNode.appendChild(div);
            ib.addChild(cp);
            this._result = new SearchTabs({}, div);
        }
    });
});