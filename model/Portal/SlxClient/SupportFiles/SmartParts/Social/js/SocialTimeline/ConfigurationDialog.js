//define(['dojo/_base/declare', 'dijit/_Widget', 'dijit/Dialog', 'dojo/_base/lang', 'dojo/dom-construct', 'dojo/on', 'dojo/_base/event',
//'./TagList', './SocialProfile'],
//function (declare, _Widget, Dialog, lang, domConstruct, on, event, TagList, SocialProfile) {
//    return declare([Dialog], {
//        triggerButtonId: null,
//        saveButtonId: null,
//        formPrefix: null,
//        _app: null,

//        postMixInProperties: function () {
//            this.inherited(arguments);
//            this.title = "Social Profile";
//        },

//        postCreate: function () {
//            this.inherited(arguments);
//            on(document.getElementById(this.triggerButtonId), "click", lang.hitch(this, "show"));
//            on(document.getElementById(this.triggerButtonId), "click", function (evt) { event.stop(evt) });
//        },

//        initModule: function (app) {
//            this._app = app;

//            var div = document.createElement("div");
//            div.style.width = "500px";
//            this.containerNode.appendChild(div);

//            var socialProfile = new SocialProfile({ formPrefix: this.formPrefix });
//            app.addSubModule(socialProfile);
//            div.appendChild(socialProfile.domNode);

//            // create OK/Cancel button panel
//            var buttonPanel = document.createElement("div");
//            buttonPanel.style.textAlign = "right";
//            var btnOk = document.createElement("button");
//            btnOk.appendChild(document.createTextNode("OK"));
//            btnOk.className = "slxbutton";
//            buttonPanel.appendChild(btnOk);
//            var btnCancel = document.createElement("button");
//            btnCancel.appendChild(document.createTextNode("Cancel"));
//            btnCancel.className = "slxbutton";
//            buttonPanel.appendChild(btnCancel);
//            div.appendChild(buttonPanel);

//            on(btnOk, "click", lang.hitch(this, "_onOkClick"));
//            on(btnCancel, "click", lang.hitch(this, "_onCancelClick"));
//        },

//        _onOkClick: function () {
//            this.hide();
//            this._app.publish("Configuration/Save");
//            __doPostBack(this.saveButtonId);
//        },

//        _onCancelClick: function () {
//            this._app.publish("Configuration/Reset");
//            this.hide();
//        }
//    });
//});