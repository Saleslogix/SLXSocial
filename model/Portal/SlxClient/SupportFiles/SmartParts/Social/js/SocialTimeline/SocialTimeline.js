define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/on', 'dijit/_Widget', 'dojo/aspect', 'dojo/_base/array', 'dojo/dom-construct', 'dojo/i18n!../nls/Resources'],
function (declare, lang, on, _Widget, aspect, array, domConstruct, Resources) {
    aspect.after(Timeline.DefaultEventSource.Event.prototype, "fillInfoBubble", function (elmt, theme, labeller) {
        function createLink(text, topic, showSeparator) {
            if (showSeparator) {
                var img = document.createElement("img");
                img.style.padding = "0 3px 0 3px";
                img.style.verticalAlign = "middle";
                img.src = "images/blue_dot.gif";
                elmt.appendChild(img);
            }
            var lnk = document.createElement("a");
            lnk.href = "javascript:void(0)";
            lnk.innerHTML = text;
            on(lnk, "click", lang.hitch(this, function () {
                SimileAjax.WindowManager.cancelPopups();
                socialApp.publish(topic, socialStatus);
            }));
            elmt.appendChild(lnk);
        }

        var socialApp = this._socialApp;
        var socialStatus = this._socialStatus;

        createLink(Resources.newNoteText, "ContextMenu/NewNote", false);
        createLink(Resources.newLeadText, "ContextMenu/NewLead", true);
        createLink(Resources.newOpportunityText, "ContextMenu/NewOpportunity", true);
//        createLink(Resources.newCompetitiveThreatText, "ContextMenu/NewCompetitiveThreat", true);
//        createLink(Resources.newSilverBulletText, "ContextMenu/NewSilverBullet", true);
        createLink(Resources.phoneCallText, "ContextMenu/NewPhoneCall", true);
        createLink(Resources.todoText, "ContextMenu/NewTodo", true);
        createLink(Resources.ticketText, "ContextMenu/NewTicket", true);
        createLink(Resources.featureRequestText, "ContextMenu/NewFeatureRequest", true);
    }, true);

    return declare([_Widget], {
        _app: null,
        _eventSource: null,
        _timeline: null,  // timeline widget

        initModule: function (app) {
            _app = app;
            this._app = app;
            this._app.subscribe("Data/Loaded", lang.hitch(this, "_loadMashupData"));
            this._app.subscribe("Data/Remove", lang.hitch(this, "_removeMashupData"));
            this._app.subscribe("Data/Search", lang.hitch(this, "_onDataSearch"));
        },

        buildRendering: function () {
            this.inherited(arguments);

            var eventSource = this._eventSource = new Timeline.DefaultEventSource();
            var bandInfos = [
             Timeline.createBandInfo({
                 eventSource: eventSource,
                 width: "80%",
                 intervalUnit: Timeline.DateTime.DAY,
                 intervalPixels: 75
             }),
             Timeline.createBandInfo({
                 eventSource: eventSource,
                 overview: true,
                 width: "10%",
                 intervalUnit: Timeline.DateTime.MONTH,
                 intervalPixels: 150
                 // this does not work here.. only afterward
                 //syncWith: 0,     
                 //highlight: true
             }),
             Timeline.createBandInfo({
                 eventSource: eventSource,
                 overview: true,
                 width: "10%",
                 intervalUnit: Timeline.DateTime.YEAR,
                 intervalPixels: 300
             })
           ];
            bandInfos[1].syncWith = 0;
            bandInfos[1].highlight = true;
            bandInfos[2].syncWith = 0;
            bandInfos[2].highlight = true;

            // note that the dom node must have a specified style
            var tl = this._timeline = Timeline.create(this.domNode, bandInfos);

            on(window, "resize", function () { tl.layout() });
        },

        _onDataSearch: function () {
            this._eventSource.clear();
        },

        _loadMashupData: function (data) {
            var events = [];
            var statusesByUrl = {};
            //            console.log("Loaded events", data);
            if (!data.length)
                return;
            for (var i = 0; i < data.length; i++) {
                var status = data[i];
                var evt = new Timeline.DefaultEventSource.Event(
                    null,  // id
                    status.postdate, // start
                    null,  // end
                    null,  // latestStart
                    null,  // earliestEnd                    
                    false,  // isDuration
                    //status.subject || status.user.name,  // title
                    "",   // title - leave out for now as it causes the display to be jumbled
                    status.getTextAsHtml(),  // Description
                    null,  // image
                    status.url,
                    status.icon,
                    null,  // color
                    null// textcolor                             
                );
                evt._socialStatus = status;
                evt._socialApp = this._app;
                evt._mashupSource = status.source;
                events.push(evt);
            }
            this._eventSource.addMany(events);
        },

        _removeMashupData: function (source) {
            var iter = this._eventSource.getAllEventIterator();
            var evtIter;
            // unfortunately this part is a bit of a hack because there is no convenient method to remove events
            while ((evtIter = iter.next())) {
                if (evtIter._mashupSource === source) {                    
                    if (this._eventSource._events._events.remove(evtIter)) {
                        iter._index--;
                    }
                }
            }
            this._eventSource.addMany([]);
        }
    });
});