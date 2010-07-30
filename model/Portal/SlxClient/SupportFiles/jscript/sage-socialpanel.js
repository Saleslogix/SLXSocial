if (typeof Sys !== "undefined") {
    Type.registerNamespace("Sage.SalesLogix.Controls");
    Type.registerNamespace("Sage.SalesLogix.Controls.Resources");
}
else {
    Ext.namespace("Sage.SalesLogix.Controls");
    Ext.namespace("Sage.SalesLogix.Controls.Resources");

    Sage.__namespace = true; //allows child namespaces to be registered via Type.registerNamespace(...)
    Sage.SalesLogix.__namespace = true;
    Sage.SalesLogix.Controls.__namespace = true;
    Sage.SalesLogix.Controls.Resources.__namespace = true;
}

Sage.SalesLogix.Controls.SocialPanel = Ext.extend(Ext.Panel, {
    justNowText: 'just now',
    oneMinuteAgoText: '1 minute ago',
    minutesAgoText: 'minutes ago',
    oneHourAgoText: '1 hour ago',
    hoursAgoText: 'hours ago',
    yesterdayText: 'Yesterday',
    daysAgoText: 'days ago',
    weeksAgoText: 'weeks ago',
    loadingText: 'Loading...',

    constructor: function(config) {
        Ext.apply(this, {
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="s-row{[xindex == xcount ? " s-row-last" : xindex == 1 ? " s-row-first" : ""]}">',
                '<img src="{[Ext.util.Format.htmlDecode(values.profile_image_url)]}" />',
                '<p class="s-text">{[this.twitterize(values.text)]}</p>',
                '<div class="s-info">',
                '<span class="s-created-at">{[this.prettyDate(values.created_at)]}</span>',
                '&nbsp;:&nbsp;',
                '<a href="http://www.twitter.com/{from_user}" target="new" class="s-from-user">{from_user}</a>',
                '</div>',
                '<div class="s-clear"></div>',
                '</div>',
                '</tpl>', {
                    prettyDate: this.prettyDate,
                    twitterize: this.twitterize
                }),
            itemSelector: 'div.s-row',
            layout: 'fit',
            border: false,
            title: false,
            activeFilter: false,
            filterOnLoad: true,
            cls: 'social-panel'
        });

        if (config.filters) {
            Ext.each(config.filters, function(o, i) {
                o.id = o.id || i;
            });
        }

        Sage.SalesLogix.Controls.SocialPanel.superclass.constructor.apply(this, arguments);

        this.addEvents(
            'filterschanged'
        );
    },

    initComponent: function() {
        this.store = this.store || new Ext.data.Store({
            autoLoad: false,
            reader: new Ext.data.JsonReader({
                root: 'results',
                idProperty: 'id'
            }, [
                'text', 'to_user_id', 'from_user', 'id', 'from_user_id', 'iso_language_code', 'source', 'profile_image_url',
                { name: 'created_at', mapping: 'created_at', type: 'date', dateFormat: 'D, d M Y H:i:s O'} //Wed, 29 Apr 2009 18:12:26 +0000
            ]),
            proxy: new Ext.data.ScriptTagProxy({
                url: 'http://search.twitter.com/search.json',
                params: { 'show_user': 'true' }
            })
        });

        this.view = this.view || new Ext.DataView({
            id: [this.id, 'view'].join('_'),
            store: this.store,
            tpl: this.tpl,
            autoWidth: true,
            itemSelector: this.itemSelector,
            listeners: {
                contextmenu: {
                    fn: function(v, i, el, e) {
                        this.selected = this.store.getAt(i);
                        this.menu.showAt(e.xy);
                        e.stopEvent();
                    },
                    scope: this
                }
            }
        });

        this.menu = this.menu || new Ext.menu.Menu({
            target: this,
            id: [this.id, 'menu'].join('_'),
            cls: 'social-menu',
            items: ['<h3>Create New ...</h3>', {
                text: 'Note',
                listeners: {
                    click: function() {
                        Link.newNote({
                            twitterid: this.parentMenu.target.selected.data.from_user,
                            notes: String.format(
                                'Twitter user: {0} \n posted: {1}',
                                this.parentMenu.target.selected.data.from_user,
                                this.parentMenu.target.selected.data.text)
                        });
                    }
                }
            }, {
                text: 'Lead',
                listeners: {
                    click: function() {
                        Link.newLead({
                            twitterid: this.parentMenu.target.selected.data.from_user,
                            notes: String.format(
                                        'Twitter user: {0} \n posted: {1}',
                                        this.parentMenu.target.selected.data.from_user,
                                        this.parentMenu.target.selected.data.text)
                        }
                    );

                    }
                }
            }, {
                text: 'Competitive Threat',
                listeners: {
                    click: function() {
                        Link.newCompetitiveThreat({
                            type: 'Competitive Threat',
                            twitterid: this.parentMenu.target.selected.data.from_user,
                            notes: String.format(
                                        'Twitter user: {0} \n posted: {1}',
                                        this.parentMenu.target.selected.data.from_user,
                                        this.parentMenu.target.selected.data.text)
                        }
                    );
                    }
                }
            }, {
                text: 'Silver Bullet',
                listeners: {
                    click: function() {
                        Link.newSilverBullet(
                        {
                            type: 'Silver Bullet',
                            twitterid: this.parentMenu.target.selected.data.from_user,
                            notes: String.format(
                                        'Twitter user: {0} \n posted: {1}',
                                        this.parentMenu.target.selected.data.from_user,
                                        this.parentMenu.target.selected.data.text)
                        }
                );
                    }
                }
            }, {
                text: 'Activity',
                menu: {
                    cls: 'social-menu',
                    items: ['<h3>Type ...</h3>', {
                        text: 'Phone Call',
                        listeners: {
                            click: function() {
                                Link.scheduleActivity({
                                    type: 'atPhoneCall',
                                    twitterid: this.parentMenu.parentMenu.target.selected.data.from_user,
                                    notes: String.format(
                                        'Twitter user: {0} \n posted: {1}',
                                        this.parentMenu.parentMenu.target.selected.data.from_user,
                                        this.parentMenu.parentMenu.target.selected.data.text)
                                });
                            }
                        }
                    }, {
                        text: 'To-Do',
                        listeners: {
                            click: function() {
                                Link.scheduleActivity({
                                    type: 'atToDo',
                                    twitterid: this.parentMenu.parentMenu.target.selected.data.from_user,
                                    notes: String.format(
                                        'Twitter user: {0} \n posted: {1}',
                                        this.parentMenu.parentMenu.target.selected.data.from_user,
                                        this.parentMenu.parentMenu.target.selected.data.text)
                                });
                            }
                        }

}]
                    }
                }, {
                    text: 'Ticket',
                    listeners: {
                        click: function() {
                            Link.newTicket({
                                description: this.parentMenu.target.selected.data.text,
                                twitterid: this.parentMenu.target.selected.data.from_user,
                                subject: String.format(
                                'Follow up on Twitter post from: {0}',
                                this.parentMenu.target.selected.data.from_user),
                            });
                        }
                    }
                }, {
                    text: 'Feature Request',
                    listeners: {
                        click: function() {
                            Link.newDefect({
                                source: this.parentMenu.target.selected.data.source,
                                description: this.parentMenu.target.selected.data.text,
                                subject: String.format(
                                'Feature Request submitted from Twitter post by: {0}',
                                this.parentMenu.target.selected.data.from_user)
                            });
                        }
                    }
}]
                });

                this.filterStore = this.filterStore || new Ext.data.Store({
                    reader: new Ext.data.JsonReader({
                        root: 'items',
                        id: 'id'
                    }, [
                { name: 'id' },
                { name: 'text' }
            ]),

                    proxy: new Ext.data.MemoryProxy({
                        items: this.filters
                    }),

                    sortInfo: { field: 'text', direction: 'ASC' }
                });

                this.filterStore.load();

                this.filterCombo = this.filterCombo || new Ext.form.ComboBox({
                    id: [this.id, 'tools'].join('_'),
                    xtype: 'combo',
                    cls: 'x-form-combo',
                    label: 'Filter',
                    store: this.filterStore,
                    value: this.activeFilter,
                    displayField: 'text',
                    valueField: 'id',
                    triggerAction: 'all',
                    mode: 'local',
                    editable: false,
                    listeners: {
                        select: {
                            fn: function(c, r, i) { this.filter(r.json); },
                            scope: this
                        }
                    }
                });

                this.tbar = this.tbar || [this.filterCombo, {
                    text: false,
                    iconCls: "s-tool-config",
                    handler: function() {
                        new Sage.SalesLogix.Controls.SocialPanelConfigDialog({
                            id: [this.id, 'config'].join('_'),
                            target: this
                        }).show();
                    },
                    scope: this
                }, '->', {
                    tooltip: this.prevText,
                    iconCls: "x-tbar-page-prev",
                    disabled: false,
                    handler: function() {
                        var data = this.store.reader.jsonData;
                        if (data.previous_page)
                            this.store.proxy.url = [this.store.url, data.previous_page, '&', Ext.urlEncode(this.store.proxy.params)].join('')

                        this.store.load();
                    },
                    scope: this
                }, {
                    tooltip: this.nextText,
                    iconCls: "x-tbar-page-next",
                    disabled: false,
                    handler: function() {
                        var data = this.store.reader.jsonData;
                        if (data.next_page)
                            this.store.proxy.url = [this.store.url, data.next_page, '&', Ext.urlEncode(this.store.proxy.params)].join('')

                        this.store.load();
                    },
                    scope: this
                }, '-', {
                    iconCls: "x-tbar-loading",
                    handler: function() {
                        this.store.load();
                    },
                    scope: this
}];

                    /* wrap the view with a panel for corret auto-scroll */
                    this.items = [{
                        border: false,
                        title: false,
                        autoScroll: true,
                        items: [this.view]
}];

                        Sage.SalesLogix.Controls.SocialPanel.superclass.initComponent.apply(this, arguments);
                    },

                    render: function() {
                        Sage.SalesLogix.Controls.SocialPanel.superclass.render.apply(this, arguments);
                    },

                    doLayout: function() {
                        Sage.SalesLogix.Controls.SocialPanel.superclass.doLayout.apply(this, arguments);

                        this.mask = this.mask || new Ext.LoadMask(this.body, {
                            store: this.store,
                            msg: this.loadingText
                        });

                        this.store.on({
                            beforeload: {
                                fn: function() {
                                    this.getTopToolbar().disable()
                                },
                                scope: this
                            },
                            load: {
                                fn: function() {
                                    this.getTopToolbar().enable()
                                },
                                scope: this
                            }
                        });

                        if (this.filterOnLoad) this.filter(this.activeFilter, true);
                    },

                    filter: function(o, load) {
                        var filter = typeof o === "object"
            ? o
            : this.filterStore.getById(o);

                        if (typeof filter === "undefined")
                            return;

                        this.store.url = this.store.url || this.store.proxy.url;

                        this.store.proxy.url = [this.store.url, '?', Ext.urlEncode(Ext.apply({}, filter.params || filter.json.params, this.store.proxy.params))].join('');

                        if (load !== false) this.store.load();
                    },

                    getFilterOptions: function() {
                        var r = [];
                        Ext.each(this.filters, function(o, i) { r.push([i, o.text]); });
                        return r;
                    },

                    /*
                    * JavaScript Pretty Date
                    * Copyright (c) 2008 John Resig (jquery.com)
                    * Licensed under the MIT license.
                    */

                    // Takes an ISO time and returns a string representing how
                    // long ago the date represents.
                    prettyDate: function prettyDate(time) {
                        var P = Sage.SalesLogix.Controls.SocialPanel.prototype;

                        //var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
                        var date = new Date(time),
		    diff = (((new Date()).getTime() - date.getTime()) / 1000),
		    day_diff = Math.floor(diff / 86400);

                        if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
                            return time ? time.toLocaleString() : '';

                        return day_diff == 0 && (
			    diff < 60 && P.justNowText ||
			    diff < 120 && P.oneMinuteAgoText ||
			    diff < 3600 && Math.floor(diff / 60) + " " + P.minutesAgoText ||
			    diff < 7200 && P.oneHourAgoText ||
			    diff < 86400 && Math.floor(diff / 3600) + " " + P.hoursAgoText) ||
		    day_diff == 1 && P.yesterdayText ||
		    day_diff < 7 && day_diff + " " + P.daysAgoText ||
		    day_diff < 31 && Math.ceil(day_diff / 7) + " " + P.weeksAgoText;
                    },

                    twitterize: function(text) {
                        return text.replace(/http:\/\/(.*?)(?=\s+|\.\s+|\.$|$)/g, function(s) {
                            return String.format('<a href="{0}" target="new">{0}</a>', s);
                        }).replace(/@(\w+)/g, function(s, g1) {
                            return String.format('<a href="http://www.twitter.com/{0}" target="new">@{0}</a>', g1);
                        }).replace(/#(\w+)/g, function(s, g1) {
                            return String.format('<a href="http://search.twitter.com/search?q={0}" target="new">#{1}</a>', encodeURIComponent(g1), g1);
                        });
                    },

                    refresh: function(filters) {
                        /* todo: re-id all the incomming filters for now */
                        Ext.each(filters, function(o, i) {
                            o.id = i;
                        });

                        /* todo: need find a better way to do this */
                        this.filters = this.filterStore.proxy.data.items = filters;
                        this.filterStore.load();
                        this.filterCombo.setValue(0); /* todo: remember previous filter */
                        this.filter(0); /* todo: remember previous filter */

                        this.fireEvent('filterschanged', this, this.filters);
                    },

                    getState: function() {
                        return {
                            filters: this.filters
                        };
                    },

                    applyState: function(state) {
                        this.suspendEvents();

                        if (state && state.filters)
                            this.refresh(state.filters);

                        this.resumeEvents();
                    }
                });

                Ext.reg('socialpanel', Sage.SalesLogix.Controls.SocialPanel);

                Sage.SalesLogix.Controls.SocialPanelConfigDialog = Ext.extend(Ext.Window, {
                    constructor: function(config) {
                        Ext.apply(this, {
                            layout: 'border',
                            width: 500,
                            height: 400,
                            buttons: [{
                                text: 'OK',
                                handler: function() {
                                    this.store.commitChanges();
                                    this.target.refresh(this.createFilterSet());
                                    this.close();
                                },
                                scope: this
                            }, {
                                text: 'Cancel',
                                handler: function() {
                                    this.close();
                                },
                                scope: this
}]
                            });

                            Sage.SalesLogix.Controls.SocialPanelConfigDialog.superclass.constructor.apply(this, arguments);
                        },

                        createFilterSet: function() {
                            var rows = this.store.getRange();
                            var result = [];
                            Ext.each(rows, function() {
                                var row = this;
                                var filter = { params: {} };

                                this.fields.each(function() {
                                    eval(String.format('filter.{0} = row.data["{1}"];', this.mapping || this.name, this.name));
                                });

                                result.push(filter);
                            });

                            return result;
                        },

                        initComponent: function() {
                            this.store = this.store || new Ext.data.Store({
                                reader: new Ext.data.JsonReader({
                                    root: 'items'
                                }, [
                { name: 'text' },
                { name: 'query', mapping: 'params.q' }
            ]),

                                proxy: new Ext.data.MemoryProxy({
                                    items: this.target.filters
                                }),

                                listeners: {
                                    update: {
                                        fn: function(s, r, o) {
                                        },
                                        scope: this
                                    }
                                }
                            });

                            this.menu = this.menu || new Ext.menu.Menu({
                                id: [this.id, 'menu'].join('_'),
                                cls: 'social-menu',
                                items: [{
                                    text: 'Remove',
                                    listeners: {
                                        click: function() {
                                            this.grid.stopEditing();
                                            var row = this.grid.getSelectionModel().getSelected();
                                            this.store.remove(row);
                                        },
                                        scope: this
                                    }
}]
                                });

                                this.grid = this.grid || new Ext.grid.EditorGridPanel({
                                    id: [this.id, 'grid'].join('_'),
                                    store: this.store,
                                    border: false,
                                    region: 'center',
                                    clicksToEdit: 2,
                                    sm: new Ext.grid.RowSelectionModel({
                                        singleSelect: true
                                    }),
                                    viewConfig: {
                                        forceFit: true,
                                        autoFill: true
                                    },
                                    columns: [{
                                        header: 'Text',
                                        dataIndex: 'text',
                                        fixed: true,
                                        sortable: true,
                                        width: 192,
                                        editor: new Ext.form.TextField({
                                            allowBlank: false
                                        })
                                    }, {
                                        header: 'Query',
                                        dataIndex: 'query',
                                        sortable: true,
                                        editor: new Ext.form.TextField({
                                            allowBlank: false
                                        })
}],
                                        listeners: {
                                            rowcontextmenu: {
                                                fn: function(g, r, e) {
                                                    this.grid.getSelectionModel().selectRow(r);
                                                    this.menu.showAt(e.xy);
                                                    e.stopEvent();
                                                },
                                                scope: this
                                            }
                                        }
                                    });

                                    this.tbar = [{
                                        text: 'Add',
                                        handler: function() {
                                            this.grid.stopEditing();
                                            this.store.insert(0, [new this.store.recordType({ text: '', query: '' })]);
                                            this.grid.startEditing(0, 0);
                                        },
                                        scope: this
                                    }, '->'];

                                    this.items = [this.grid];

                                    Sage.SalesLogix.Controls.SocialPanelConfigDialog.superclass.initComponent.apply(this, arguments);
                                },

                                render: function() {
                                    Sage.SalesLogix.Controls.SocialPanelConfigDialog.superclass.render.apply(this, arguments);

                                    this.store.load();
                                }
                            });

                            Ext.reg('socialpanelconfig', Sage.SalesLogix.Controls.SocialPanelConfigDialog);

                            ; (function($) {

                                $.fn.twitterize = function() {
                                    this.each(function() {
                                        var text = $(this).text().replace(/http:\/\/(.*?)(?=\s+|\.\s+|\.$|$)/g, function(s) {
                                            return String.format('<a href="{0}" target="new">{0}</a>', s);
                                        }).replace(/@(\w+)/g, function(s, g1) {
                                            return String.format('<a href="http://www.twitter.com/{0}" target="new">@{0}</a>', g1);
                                        }).replace(/#(\w+)/g, function(s, g1) {
                                            return String.format('<a href="http://search.twitter.com/search?q={0}" target="new">#{1}</a>', encodeURIComponent(g1), g1);
                                        });

                                        $(this).text(text);
                                    });
                                };

                            })(jQuery);


                            function createStandarProblem(area, selected) {

                                //

                            }