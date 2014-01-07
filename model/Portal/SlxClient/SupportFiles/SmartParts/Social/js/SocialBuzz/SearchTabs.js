// Interface for the tab view.
// Tabs at the top controls which view is displayed in the result panel below.
// In addition we have a "Search" tab which displays a welcome text (including a search box to define a new search)
// If no view is configured, we just display the welcome text.

// Events in:
//  - Data/SearchTabs/Loaded  - when the tabs for the current user have been loaded, we draw the tabs and display the first one
//  - Data/Loaded - when a search is loaded we create the tab for it (if there wasn't one yet), activate it, display the result panel if not currently active,
//                  and call Data/SearchTabs/Save so the search result is saved
//  - Data/Search - make sure the result panel is activated when a search starts
//
// Events out:
//  - Data/SearchTabs/Save
//  - Data/SearchTabs/Delete
//  - Data/Search  (from the welcome screen or when they activate a tab)


define(['dojo/_base/declare', 'dojo/string', 'dojo/_base/lang', 'dijit/_Widget', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
    "dijit/layout/TabContainer", "dijit/layout/ContentPane", 'dojo/aspect', 'dojo/dom-construct', 'dijit/MenuItem',
    './ResultPanel', './FilterPanel', '../SocialProfile/DefineSocialNetworks',
    "dojo/text!./html/_SearchPanel.html", 'dojo/i18n!../nls/Resources'],
function (declare, djString, lang, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, TabContainer,
    ContentPane, aspect, domConstruct, MenuItem,
    ResultPanel, FilterPanel, DefineSocialNetworks,
    searchPanelTemplate, Resources) {
    var SocialSearchModel = declare(null, {
        constructor: function (options) {
            lang.mixin(this, options);
        },
        $key: "",
        SearchName: "",
        SearchTerms: "",
        Userid: "",
        LastSearchDate: null,
        LastSearchCount: 0,

        getFilter: function () {
            return { tabName: this.SearchName, query: this.SearchTerms };
        }
    });

    var welcomeTab = new SocialSearchModel();
    welcomeTab.SearchName = "Search";

    var InitialSearchPanel = declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // welcome screen for the search
        templateString: djString.substitute(searchPanelTemplate, Resources),
        txtSearchTerms: null,
        sandbox: null,

        initModule: function (sb) {
            this.sandbox = sb;
        },

        onSearchClick: function () {
            var terms = this.txtSearchTerms.get('value');
            if (terms)
                this.sandbox.publish("Data/Search", { query: terms });
        }
    });

    var SearchResultPanel = declare([_Widget], {
        initModule: function (sb) {
            var filter = this._filterPanel = new FilterPanel({});
            var result = this._resultPanel = new ResultPanel({});
            this.domNode.appendChild(filter.domNode);
            this.domNode.appendChild(result.domNode);
            sb.addModule(filter);
            sb.addModule(result);
        },

        setCurrentFilter: function (filter) {
            this._filterPanel.setCurrentFilter(filter);
        }
    });

    var TabBar = declare([_Widget], {
        searchTabs: null,
        _tabContainer: null,

        buildRendering: function () {
            this.inherited(arguments);
            var div = document.createElement("div");
            this.domNode.appendChild(div);
            var tc = this._tabContainer = new TabContainer({
                style: "height: 100%; width: 100%",
                useMenu: false
            }, div);
            var welcome = new ContentPane({ title: "Search", socialSearch: welcomeTab });
            tc.addChild(welcome);
            this.domNode.appendChild(tc.domNode);

            tc.startup();
            var mb = dojo.marginBox(this.domNode);
            mb.l = 0;
            mb.t = 0;
            tc.resize(mb);

            var br = document.createElement("br");
            br.style.clear = "both";
            this.domNode.appendChild(br);

            aspect.after(tc, "selectChild", lang.hitch(this, function (tab) {
                this.searchTabs.onTabActivated(tab);
            }), true);

            aspect.after(tc, "removeChild", lang.hitch(this, function (tab) {
                this.searchTabs.onTabRemoved(tab.socialSearch);
            }), true);

            aspect.after(tc, "addChild", lang.hitch(this, "_onAddTab"), true);


            tc.selectChild(welcome);
        },

        _onAddTab: function (page) {
            // add share menu for the newly created tab button
            if (page.socialSearch !== welcomeTab) {
                var tabButton = this._tabContainer.tablist.pane2button[page.id];
                // To do in phase 2?
                //                tabButton._closeMenu.addChild(new MenuItem({
                //                    label: "Share",
                //                    dir: tabButton.dir,
                //                    lang: tabButton.lang,
                //                    textDir: tabButton.textDir,
                //                    onClick: lang.hitch(this, "onShareButtonClick", page)
                //                }));
            }
        },

        showTab: function (tabName) {
            // activate specified tab (create a new one if none there yet)
            // return tab object
            var tabs = this._tabContainer.getChildren();
            for (var i = 1; i < tabs.length; i++) {
                // start at 1 to skip the welcome tab
                if (tabs[i].title == tabName) {
                    if (!tabs[i].selected) {
                        this._tabContainer.selectChild(tabs[i]);
                    }
                    return tabs[i];
                }
            }
            var model = new SocialSearchModel({
                SearchName: tabName, SearchTerms: tabName
            });
            var tab = new ContentPane({
                title: tabName, socialSearch: model, closable: true
            });
            this._tabContainer.addChild(tab);
            this._tabContainer.selectChild(tab);
            return tab;
        },

        addSearchTabs: function (searches) {
            // display the specified tabs
            for (var i = 0; i < searches.length; i++) {
                var socialSearch = new SocialSearchModel(searches[i]);
                var tab = new ContentPane({
                    title: searches[i].SearchName, socialSearch: socialSearch, closable: true
                });
                this._tabContainer.addChild(tab);
            }
        },

        onShareButtonClick: function (page) {

        },

        _drawTab: function (tab) {
            var div = document.createElement("div");
            div.innerHTML = tab.SearchName;
            this.domNode.appendChild(div);
        }
    });

    var SearchTabs = declare([_Widget], {
        _resultPanel: null,
        _searchPanel: null,
        _tabBar: null,
        _app: null,
        _currentQuery: null,  // keep track of the query that is currently displayed so we avoid needlessly redisplaying when tab is selected

        initModule: function (app) {
            this._app = app;
            app.addModule(this._resultPanel);
            app.addModule(this._searchPanel);
            app.subscribe("Data/Search", lang.hitch(this, "_onDataSearch"));
            app.subscribe("Data/Loaded", lang.hitch(this, "_onDataLoaded"));
            app.subscribe("Data/SearchTabs/Loaded", lang.hitch(this, "_onSearchTabsLoaded"));
            app.subscribe("App/Start", lang.hitch(this, "_onAppStart"));
        },

        buildRendering: function () {
            this.inherited(arguments);
            // XXX do we need this extra div?
            //            var div = document.createElement("div");
            //            div.style.width = "99%";
            //            div.style.height = "100%";

            //            this.domNode.appendChild(div);

            this._resultPanel = new SearchResultPanel({ style: "" });
            this._searchPanel = new InitialSearchPanel({ style: "" });

            this._tabBar = new TabBar({ searchTabs: this }, this.domNode);
        },

        onTabActivated: function (tab) {
            // perform the search for this tab, or show welcome screen if the tab is the welcome tab
            if (tab.socialSearch === welcomeTab) {
                domConstruct.place(this._searchPanel.domNode, tab.containerNode, "only");
            } else {
                var filter = tab.socialSearch.getFilter();
                this._showResultPanel(filter, tab);
                if (this._currentQuery != filter.query) {
                    this._currentQuery = filter.query;
                    this._app.publish("Data/Search", filter);
                }
            }
        },

        onTabRemoved: function (tabModel) {
            if (tabModel.$key)
                this._app.publish("Data/SearchTabs/Delete", tabModel);
        },

        _onAppStart: function () {
            // check the user's authentication to Twitter (note social network is hard-coded right now)
            var cnf = DefineSocialNetworks(this._app);
            cnf.Twitter.checkAuthentication();            
        },

        _onSearchTabsLoaded: function (searches) {
            this._tabBar.addSearchTabs(searches);
        },

        _onDataSearch: function (filter) {
            this._currentQuery = filter.query;
            var search = this._showResultPanel(filter);
        },

        _onDataLoaded: function (texts, filter) {
            this._currentQuery = filter.query;
            var search = this._showResultPanel(filter);
            search.LastSearchDate = new Date();
            search.LastSearchCount = texts.length;
            this._app.publish("Data/SearchTabs/Save", search);
        },

        _showResultPanel: function (filter, tab) {
            // show result panel, return socialsearch object
            // if tab is not provided the tab bar showTab method will be called
            if (!tab)
                tab = this._tabBar.showTab(filter.tabName || filter.query);
            domConstruct.place(this._resultPanel.domNode, tab.containerNode, "only");
            filter.tabName = tab.socialSearch.SearchName;
            this._resultPanel.setCurrentFilter(filter);
            return tab.socialSearch;
        }
    });

    return SearchTabs;
});