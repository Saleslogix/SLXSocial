// Social Timeline
//
// Events in:
// -
//
// Events out:
// - SocialProfile/Loaded
// - SocialProfile/Updated

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/on', 'dijit/_Widget', 'dojo/string', 'dojo/aspect', 'dojo/_base/array', 'dojo/dom-construct', 'dojo/query', '../Utility',
    'dojo/i18n!../nls/Resources'],
function (declare, lang, on, _Widget, djString, aspect, array, domConstruct, query, Utility, Resources) {
    aspect.after(Timeline.DefaultEventSource.Event.prototype, "fillInfoBubble", function (elmt, theme, labeller) {
        if (!this._socialStatus)
        // since we are overwriting the global it's possible this is a timeline bubble for a non-social widget, so
        // ignore any call that looks like they did not originate from our app
            return;

        var socialApp = this._socialApp;
        var socialStatus = this._socialStatus;

        var html = '<div class="social-panel"><div class="s-row">' +
            '<img src="${userImageUrl}" alt=""  class="s-user-image"/>' +
            '<a href="${userUrl}" target="_blank" class="s-from-user">${userName}</a>' +
            '&nbsp;&nbsp;' +
            '<a href="${userUrl}" target="_blank" class="s-screen-name">${screenName}</a>' +
            '<p class="s-text">${contentHtml}</p>' +
            '<div class="s-info" style="clear: both; margin: 0">' +  // override the margin and float because in this case we do want it to do a carriage return
            '<span class="s-created-at">${createdAt}</span>' +
            '&nbsp;&nbsp;' +
            '<span>${socialActions}</span>' +
            '</div>' +
            '<div class="slx-actions"></div>' +
            '<div class="s-clear"></div>' +
            '</div></div>';

        var templateData = {
            userImageUrl: socialStatus.user.imageUrl || "",
            userName: socialStatus.user.name,
            userUrl: socialStatus.user.url || "",
            screenName: socialStatus.user.screenname || "",
            contentHtml: socialStatus.getTextAsHtml(),
            createdAt: socialStatus.getPostDatePretty(),
            socialActions: ""
        };
        if (socialStatus.socialNetwork == "Twitter") {
            // twitter-specific actions
            Utility.loadScript("https://platform.twitter.com/widgets.js");
            templateData.socialActions += '<a class="s-twitter-intent s-twitter-reply" href="https://twitter.com/intent/tweet?in_reply_to=' + socialStatus.id + '"></a>';
            var cls = socialStatus.Retweeted ? "s-twitter-retweet-on" : "s-twitter-retweet";
            templateData.socialActions += '<a class="s-twitter-intent ' + cls + '" href="https://twitter.com/intent/retweet?tweet_id=' + socialStatus.id + '"></a>';
            var cls = socialStatus.Favorited ? "s-twitter-favorite-on" : "s-twitter-favorite";
            templateData.socialActions += '<a class="s-twitter-intent ' + cls + '" href="https://twitter.com/intent/favorite?tweet_id=' + socialStatus.id + '"></a>';
        }

        if (templateData.screenName == templateData.userName)
            templateData.screenName = "";
        html = djString.substitute(html, templateData);
        domConstruct.place(html, elmt, "only");
        //var divSlxActions = query(".slx-actions", elmt)[0];
        var divSlxActions = document.createElement("div");

        function createLink(text, topic, showSeparator) {
            if (showSeparator) {
                var img = document.createElement("img");
                img.style.padding = "0 3px 0 3px";
                img.style.verticalAlign = "middle";
                img.src = "images/blue_dot.gif";
                divSlxActions.appendChild(img);
            }
            var lnk = document.createElement("a");
            lnk.href = "javascript:void(0)";
            lnk.innerHTML = text;
            on(lnk, "click", lang.hitch(this, function () {
                SimileAjax.WindowManager.cancelPopups();
                socialApp.publish(topic, socialStatus);
            }));
            divSlxActions.appendChild(lnk);
        }


        createLink(Resources.newNoteText, "ContextMenu/NewNote", false);
        createLink(Resources.newLeadText, "ContextMenu/NewLead", true);
        createLink(Resources.newOpportunityText, "ContextMenu/NewOpportunity", true);
        //        createLink(Resources.newCompetitiveThreatText, "ContextMenu/NewCompetitiveThreat", true);
        //        createLink(Resources.newSilverBulletText, "ContextMenu/NewSilverBullet", true);
        createLink(Resources.phoneCallText, "ContextMenu/NewPhoneCall", true);
        createLink(Resources.todoText, "ContextMenu/NewTodo", true);
        createLink(Resources.ticketText, "ContextMenu/NewTicket", true);
        createLink(Resources.featureRequestText, "ContextMenu/NewFeatureRequest", true);
        domConstruct.place(divSlxActions, elmt, "last");
    }, true);

    return declare([_Widget], {
        _app: null,
        _eventSource: null,
        _timeline: null,  // timeline widget

        initModule: function (app) {
            _app = app;
            this._app = app;
            app.subscribe("Data/Loaded", lang.hitch(this, "_loadMashupData"));
            app.subscribe("Data/Remove", lang.hitch(this, "_removeMashupData"));
            app.subscribe("Data/Search", lang.hitch(this, "_onDataSearch"));


            app.subscribe("SocialProfile/Loaded", lang.hitch(this, "_onSocialProfileLoaded"));
            // handler for when the profile is successfully configured (or reconfigured)
            app.subscribe("SocialProfile/Updated", lang.hitch(this, "_onSocialProfileLoaded"));
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

            // default to hidden, this way it won't show if there is no network configured
            this.domNode.style.display = "none";

            // this is needed for the info bubbles
            Utility.loadCss("SmartParts/Social/css/Social.css");
        },

        _onSocialProfileLoaded: function (profile) {
            // if they have a configured network, show the timeline
            if (profile.isConfigured()) {
                this.domNode.style.display = "";
            }
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
            function getStatusHtml(status) {
                var html = '<div class="s-row">' +
            '<img src="${_userImageUrl}" alt="" />' +
            '<a href="${_userUrl}" target="new" class="s-from-user">${_userName}</a>' +
            '&nbsp;&nbsp;' +
            '<span class="s-screen-name">${_screenName}</span>' +
            '<p class="s-text">${_html}</p>' +
            '<div class="s-info">' +
            '<span class="s-created-at">${_createdAt}</span>' +
            '&nbsp;&nbsp;' +
            '${_actions}' +
            '</div>' +
            '<div class="s-clear"></div>' +
            '</div>';
                var html = status.getTextAsHtml();

            }
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
            this.domNode.style.display = "";
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