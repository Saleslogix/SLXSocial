define(['dojo/_base/declare', 'dojo/_base/lang', 'dijit/_Widget', 'dijit/form/TextBox', 'dijit/form/ComboBox', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
    'dojo/i18n!../nls/Resources'],
function (declare, lang, _Widget, TextBox, ComboBox, _TemplatedMixin, _WidgetsInTemplateMixin, Resources) {
    // Filter panel - lets the user enter a keyword and raise a Data/Search event
    // TODO: should be some way to save searches in user options
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: "<div class='s-filter'>" +
            "<div data-dojo-type='dijit.form.ComboBox' data-dojo-attach-point='txtFilter' style='min-width: 250px'></div>" +
            "<div data-dojo-type='dijit.form.Button' data-dojo-attach-point='btnSearch'>" + Resources.searchText + "</div>" +
            "</div>",

        initModule: function (app) {
            this._app = app;
        },
        postCreate: function () {
            this.inherited(arguments);

            this.txtFilter.on('keypress', lang.hitch(this, function (key) {
                if (key.keyCode == 13) {
                    this._applyFilter();
                }
            }));
            this.btnSearch.on('click', lang.hitch(this, "_applyFilter"));
        },

        _applyFilter: function () {
            if (this.txtFilter.get('value'))
                this._app.publish('Data/Search', { query: this.txtFilter.get('value') });
        }
    });
});