//define(['dojo/_base/declare', 'dojo/_base/lang'],
//function (declare, lang) {
//    return declare(null, {
//        _hiddenFieldId: "", // where the tags are stored between postbacks
//        _saveButtonId: "",  // id of control to invoke when user requests to save the default tags

//        constructor: function (hiddenFieldId, saveButtonId) {
//            this._hiddenFieldId = hiddenFieldId;
//            this._saveButtonId = saveButtonId;
//        },

//        initModule: function (app) {
//            this._app = app;
//            var words = document.getElementById(this._hiddenFieldId).value;
//            if (words) {
//                app.publish("DefaultTags/Load", words);
//            }
//            app.subscribe("DefaultTags/Save", lang.hitch(this, function (words) {
//                document.getElementById(this._hiddenFieldId).value = words;
//                __doPostBack(this._saveButtonId);
//            }));
//        }
//    });
//});