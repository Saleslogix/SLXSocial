//define(['dijit/_Widget', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dojo/on',
//    'dijit/TooltipDialog', 'dijit/form/TextBox', 'dijit/popup',
//    'dojo/i18n!../nls/Resources'],
//function (_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, declare, lang, domConstruct, on,
//    TooltipDialog, TextBox, popup,
//    Resources) {
//    var TagWord = declare([_Widget], {
//        word: "",
//        parentList: null, // parent TagList object

//        buildRendering: function () {
//            this.inherited(arguments);
//            var a = document.createElement("a");
//            a.appendChild(document.createTextNode(this.word));
//            a.href = "https://twitter.com/search?q=" + encodeURIComponent(this.word);
//            a.target = "_blank";
//            this.domNode.appendChild(a);

//            var btn = document.createElement("img");
//            btn.src = "images/icons/delete_16x16.gif";  // TODO - find a cuter icon
//            btn.style.cursor = "pointer";
//            btn.width = 10;
//            btn.height = 10;
//            btn.title = Resources.removeTagTooltip;
//            this.domNode.appendChild(btn);
//            btn.onclick = lang.hitch(this, function () { this.parentList.removeWord(this.word); });

//            this.domNode.appendChild(document.createTextNode(" "));
//        }
//    });

//    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
//        _entityId: "",
//        _entityType: "",
//        _wordList: [],
//        _wordTagWidgets: [],

//        _app: null,

//        // TODO: this needs to be made prettier... also just get rid of the DropDownButton because it bugs out when they navigate to another page
//        templateString: "<div class='s-taglist'>" +
//            "<b>" + Resources.follow + " </b>" +
//            "<span data-dojo-attach-point='spnWordList'></span> " +
//            "<a class='s-actionlink' href='javascript:void(0)' data-dojo-attach-point='lnkAddWords' title='" + Resources.addTagTooltip + "'>" +
//            " <img style='vertical-align: top' src='images/icons/plus_16x16.gif' alt='" + Resources.addText + "' width='12' height='12'/> " + Resources.addTagText +
//            "</a> " +
//        // old code using a DropDownButton...
//        // problems: it doesn't look good, and it also bugs when navigating between records
//        //"<button data-dojo-type='dijit.form.DropDownButton' data-dojo-attach-point='btnAddWords'>" +
//        //"<span>" + Resources.addText + "</span>" +
//        //"<div style='background-color: white' data-dojo-type='dijit.layout.ContentPane'>" +
//        //"<input data-dojo-type='dijit.form.TextBox' data-dojo-attach-point='txtNewWords' style='width: 240px'/>" +
//        //"</div>" +
//        //"</button>" +
//            "<a class='s-actionlink' href='javascript:void(0)' data-dojo-attach-point='lnkSaveDefaults' title='" + Resources.saveDefaultsTooltip + "'>" +
//            " <img style='vertical-align: top' src='images/icons/options_16x16.gif' width='12' height='12' alt='" + Resources.saveDefaultsText + "'> " + Resources.saveDefaultsText +
//            "</a>" +
//            "</div>",

//        postMixInProperties: function () {
//            this.inherited(arguments);
//            this._wordList = [];
//        },

//        postCreate: function () {
//            this.inherited(arguments);
//            this._updateWordListDisplay();

//            on(this.lnkSaveDefaults, 'click', lang.hitch(this, "_saveDefaultTags"));

//            this._createAddWordDialog();
//        },

//        _createAddWordDialog: function () {
//            // create the tooltip to be triggered when they click the "Add" link
//            this.txtNewWords = new dijit.form.TextBox({});
//            this.txtNewWords.on('keypress', lang.hitch(this, function (key) {
//                if (key.keyCode == 13) {
//                    this._addNewWords();
//                    popup.close(tt);
//                } else if (key.keyCode == 27) {
//                    popup.close(tt);
//                }
//            }));
//            var tt = new TooltipDialog({
//                style: "padding: 0 !important; background-color: white !important",
//                content: this.txtNewWords.domNode,
//                onBlur: function () {
//                    popup.close(tt);
//                }
//            });
//            on(this.lnkAddWords, "click", lang.hitch(this, function () {
//                popup.open({
//                    popup: tt,
//                    around: this.lnkAddWords
//                });
//                this.txtNewWords.focus();
//            }));
//        },

//        initModule: function (app) {
//            this._app = app;
//            app.subscribe("DefaultTags/Load", lang.hitch(this, "_loadDefaultTags"));
//        },

//        removeWord: function (word) {
//            var i = this._wordList.indexOf(word);
//            if (i >= 0)
//                this._wordList.splice(i, 1);
//            this._updateWordListDisplay();
//            this._publishFilter();
//        },

//        _loadDefaultTags: function (words) {
//            this._wordList = words.split(/ +/);
//            this._updateWordListDisplay();
//            this._publishFilter();
//        },

//        _saveDefaultTags: function () {
//            this._app.publish("DefaultTags/Save", this._wordList.join(' '));
//        },

//        _updateWordListDisplay: function () {
//            if (this._wordTagWidgets) {
//                for (var i = 0; i < this._wordTagWidgets.length; i++) {
//                    this._wordTagWidgets[i].destroy();
//                }
//            }
//            this._wordTagWidgets = [];
//            if (this._wordList.length == 0) {
//                this.spnWordList.innerHTML = Resources.nothingSelected;
//            } else {
//                this.spnWordList.innerHTML = '';
//                for (var i = 0; i < this._wordList.length; i++) {
//                    var word = new TagWord({ word: this._wordList[i], parentList: this }, document.createElement("span"));
//                    this._wordTagWidgets.push(word);
//                    this.spnWordList.appendChild(word.domNode);
//                }
//            }
//        },

//        _addNewWords: function () {
//            var words = this.txtNewWords.get('value')
//                .replace(/^ */, "")
//                .replace(/ *$/, "")
//                .split(/ +/);
//            this.txtNewWords.set('value', '');
//            if (words.length > 0) {
//                var addedWord = false;
//                for (var i = 0; i < words.length; i++) {
//                    if (words[i] && this._wordList.indexOf(words[i]) < 0) {
//                        this._wordList.push(words[i]);
//                        addedWord = true;
//                    }
//                }
//                if (addedWord) {
//                    this._updateWordListDisplay();
//                    this._publishFilter();
//                }
//            }
//        },

//        _publishFilter: function () {
//            // broadcast filter to the app
//            // we do a small timeout to avoid sending requests repeatedly in case they remove several words at once
//            if (this._publishTimeout) {
//                clearTimeout(this._publishTimeout);
//            }
//            this._publishTimeout = setTimeout(lang.hitch(this, function () {
//                var filter = { query: this._wordList.join(' OR '), users: [] };

//                for (var i = 0; i < this._wordList.length; i++) {
//                    var word = this._wordList[i];
//                    if (word[0] == "@") {
//                        filter.users.push({ name: word.substring(1), proto: null });
//                    }
//                }
//                this._app.publish("Data/Search", filter);
//            }), 700);
//        }
//    });
//});