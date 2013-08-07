/*
 * Display for social queue updates
 *
 * Events in:
 *  - Data/Loaded
 *  - Data/Search - used to clear the current display, since new data will be added
 *  - Data/Remove(source) - remove events matching specified source
 */

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dijit/_Widget', 'dijit/_TemplatedMixin', 'dijit/Menu', 'dijit/MenuItem', 'dijit/PopupMenuItem', 'dojo/string',
    '../Utility',
    'dojo/i18n!../nls/Resources'],
function (declare, lang, domConstruct, _Widget, _TemplatedMixin, Menu, MenuItem, PopupMenuItem, djString, Utility, Resources) {
    var StatusEntryView = declare([_Widget, _TemplatedMixin], {
        status: null,  // provided at construction, represents the status update to be displayed
        templateString: '<div class="s-row">' +
            '<img src="${_userImageUrl}" alt="" />' +
            '<p class="s-text" data-dojo-attach-point="contentHtml"></p>' +
            '<div class="s-info">' +
            '<span class="s-created-at">${_createdAt}</span>' +
            '&nbsp;:&nbsp;' +
            '<a href="${_userUrl}" target="new" class="s-from-user">${_userName}</a>' +
            '</div>' +
            '<div class="s-clear"></div>' +
            '</div>',

        postMixInProperties: function () {
            this.inherited(arguments);
            this._userImageUrl = this.status.user.imageUrl || "";
            this._userName = this.status.user.name || "";
            this._userUrl = this.status.user.url || "";
            this._createdAt = this.status.getPostDatePretty();
        },

        postCreate: function () {
            // note we can't use substitution for this one for some reason that causes the HTML to be escaped weirdly
            this.contentHtml.innerHTML = this.status.getTextAsHtml();
            if (this.status.icon) {
                this.domNode.style.background = "transparent url('" + this.status.icon + "') no-repeat right top";
            }
        }
    });

    var StatusMenu = declare([Menu], {
        status: null,
        app: null,

        postCreate: function () {
            this.inherited(arguments);
            var app = this.app;
            var status = this.status;
            // can't find how to add a note with pre-filled text in the new activity service?
            this.addChild(new MenuItem({ label: Resources.newNoteText, onClick: function () { app.publish("ContextMenu/NewNote", status) } }));
            this.addChild(new MenuItem({ label: Resources.newLeadText, onClick: function () { app.publish("ContextMenu/NewLead", status) } }));
            this.addChild(new MenuItem({ label: Resources.newOpportunityText, onClick: function () { app.publish("ContextMenu/NewOpportunity", status) } }));
//            this.addChild(new MenuItem({ label: Resources.newCompetitiveThreatText, onClick: function () { app.publish("ContextMenu/NewCompetitiveThreat", status) } }));
//            this.addChild(new MenuItem({ label: Resources.newSilverBulletText, onClick: function () { app.publish("ContextMenu/NewSilverBullet", status) } }));
            var activityMenu = new Menu();
            activityMenu.addChild(new MenuItem({ label: Resources.phoneCallText, onClick: function () { app.publish("ContextMenu/NewPhoneCall", status) } }));
            activityMenu.addChild(new MenuItem({ label: Resources.todoText, onClick: function () { app.publish("ContextMenu/NewTodo", status) } }));
            activityMenu.addChild(new MenuItem({ label: Resources.ticketText, onClick: function () { app.publish("ContextMenu/NewTicket", status) } }));
            activityMenu.addChild(new MenuItem({ label: Resources.featureRequestText, onClick: function () { app.publish("ContextMenu/NewFeatureRequest", status) } }));
            this.addChild(new PopupMenuItem({ label: Resources.newActivityText, popup: activityMenu }));

            this.startup();
        }
    });

    // ResultPanel 
    // - when there is new data made available (Data/Loaded), this displays it
    // - when there is a Data/Search event, clear our existing data and display a "loading" splash
    return declare([_Widget], {
        _container: null,
        _app: null,   // sandbox,
        _entries: null,  // array of StatusEntryView displayed

        initModule: function (app) {
            this._app = app;
            app.subscribe('Data/Loaded', lang.hitch(this, '_onDataLoaded'));
            app.subscribe('Data/Remove', lang.hitch(this, '_removeEntries'));
            app.subscribe('Data/Search', lang.hitch(this, '_onFilterApply'));
            this._entries = [];
        },
        buildRendering: function () {
            this.inherited(arguments);
            this._container = document.createElement("div");
            this._container.className = "social-panel";
            this.domNode.appendChild(this._container);
            Utility.loadCss("SmartParts/Social/css/Social.css");
        },

        _onDataLoaded: function (data) {
            this._hideLoading();

            for (var i = 0; i < data.length; i++) {
                var se = new StatusEntryView({ status: data[i] });
                // find correct insertion point for the status (in case they are received out of order)
                var insertionPoint = this._findNewestEntry(data[i].postdate);
                if (insertionPoint) {
                    domConstruct.place(se.domNode, insertionPoint.domNode, "before");
                } else {
                    // either there is nothing yet, or they are all newer
                    this._container.appendChild(se.domNode);
                }
                this._entries.push(se);
                // in Dojo 1.7 there is no way to know which node the menu is invoked for, so we have to create a copy of the menu for each row
                // in Dojo 1.8 it is possible to just create 1 menu and have it apply to all nodes within a given container
                // I left the menu creation code in the parent level, rather than moving it at the child level, so that it could be migrated easily once SLX upgrades to dojo 1.8
                var menu = this._createMenu(se.domNode, data[i]);
                se._menu = menu;
            }
        },

        _removeEntries: function (source) {
            for (var i = this._entries.length - 1; i >= 0; i--) {
                if (this._entries[i].status.source === source) {
                    if (this._entries[i]._menu)
                        this._entries[i]._menu.destroy();
                    this._entries[i].destroy();
                    this._entries.splice(i, 1);
                }
            }
        },

        _findNewestEntry: function (refdate) {
            // find the newest entry that is older than refdate (null if nothing matches)
            var newest = null;
            for (var i = this._entries.length - 1; i >= 0; i--) {
                var e = this._entries[i];
                if (e.status.postdate < refdate && (newest == null || newest.status.postdate < e.status.postdate))
                    newest = e;
            }
            return newest;
        },

        _createMenu: function (targetNode, status) {
            return new StatusMenu({ status: status, app: this._app, targetNodeIds: [targetNode.id] });
        },

        _onFilterApply: function () {
            domConstruct.empty(this._container);
            this._showLoading();
            this._entries = [];
        },

        _showLoading: function () {
            if (!this._divLoading) {
                this._divLoading = document.createElement("div");
                this._divLoading.innerHTML = Resources.loadingText;
                domConstruct.place(this._divLoading, this._container, "last");
            }
        },

        _hideLoading: function () {
            if (this._divLoading) {
                domConstruct.destroy(this._divLoading);
                this._divLoading = null;
            }
        }
    });
});