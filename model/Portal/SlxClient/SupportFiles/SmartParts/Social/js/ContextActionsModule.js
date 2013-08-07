define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/string', './Utility', 'dojo/i18n!./nls/Resources'],
function (declare, lang, djString, Utility, Resources) {
    return declare([], {
        _app: null,

        initModule: function (sb) {
            this._app = sb;
            sb.subscribe("ContextMenu/NewLead", lang.hitch(this, "_newLead"));
            sb.subscribe("ContextMenu/NewNote", lang.hitch(this, "_newNote"));
            sb.subscribe("ContextMenu/NewCompetitiveThreat", lang.hitch(this, "_newCompetitiveThreat"));
            sb.subscribe("ContextMenu/NewSilverBullet", lang.hitch(this, "_newSilverBullet"));
            sb.subscribe("ContextMenu/NewPhoneCall", lang.hitch(this, "_newPhoneCall"));
            sb.subscribe("ContextMenu/NewTodo", lang.hitch(this, "_newTodo"));
            sb.subscribe("ContextMenu/NewTicket", lang.hitch(this, "_newTicket"));
            sb.subscribe("ContextMenu/NewOpportunity", lang.hitch(this, "_newOpportunity"));
            sb.subscribe("ContextMenu/NewFeatureRequest", lang.hitch(this, "_newFeatureRequest"));
        },

        _newOpportunity: function (status) {
            this._redirectToAction("InsertOpportunity.aspx?ModeId=Insert",
            {
                OpportunityDescription: this._expandVariables(Resources.opportunityDescription, status),
                OpportunityNotes: this._expandVariables(Resources.opportunityNotes, status)
            });
        },

        _newLead: function (status) {
            this._redirectToAction("InsertLead.aspx?ModeId=Insert",
                { LeadNotes: this._expandVariables(Resources.activityNotesText, status),
                    LeadName: status.user.name,
                    LeadUrl: status.user.url,
                    LeadBusinessDescription: status.user.description
                });
        },

        _newNote: function (status) {
            // TODO
            var notes = this._expandVariables(Resources.activityNotesText, status);
            // there is no method provided to insert a note with a set of given defaults, so we just emulate what is in the ActivityService.insertNote method
            var svc = Sage.Services.getService('ActivityService');
            svc._ensureHistoryEditor();
            svc._historyEditor.set('activityType', 'Note');
            svc._historyEditor.set('mode', 'New');
            svc._historyEditor.set('historyId', '');
            svc._historyEditor.show({ LongNotes: notes });
        },

        _newCompetitiveThreat: function (status) {
            var notes = this._expandVariables(Resources.activityNotesText, status);
            this._redirectToAction("InsertStandardProblem.aspx?ModeId=insert",
                { ProblemNotes: notes, ProblemDescription: Resources.competitiveThreatText });
        },

        _newSilverBullet: function (status) {
            var notes = this._expandVariables(Resources.activityNotesText, status);
            this._redirectToAction("InsertStandardProblem.aspx?ModeId=insert",
                { ProblemNotes: notes, ProblemDescription: Resources.silverBulletText });
        },

        _newPhoneCall: function (status) {
            var notes = this._expandVariables(Resources.activityNotesText, status);

            var activityService = Sage.Services.getService('ActivityService');
            activityService.scheduleActivity({ type: 'PhoneCall', preConfigured: { LongNotes: notes} });
        },

        _newTodo: function (status) {
            var notes = this._expandVariables(Resources.activityNotesText, status);

            var activityService = Sage.Services.getService('ActivityService');
            activityService.scheduleActivity({ type: 'ToDo', preConfigured: { LongNotes: notes} });
        },

        _newFeatureRequest: function (status) {
            var subject = this._expandVariables(Resources.featureRequestSubject, status);
            var description = this._expandVariables(Resources.activityNotesText, status);
            this._redirectToAction("InsertDefect.aspx?ModeId=insert",
                { DefectSubject: subject, DefectNotes: description });
        },

        _newTicket: function (status) {
            var subject = this._expandVariables(Resources.ticketSubject, status);
            var notes = this._expandVariables(Resources.activityNotesText, status);
            // TODO: this should pass the user's id so that we can do a search and fetch the corresponding account
            this._redirectToAction("InsertTicket.aspx?ModeId=insert",
                { TicketSubject: subject, TicketProblem: notes });
        },

        _redirectToAction: function (page, parameters) {
            // Populate NewEntityParameters in the session, then redirect to the specified page
            this._saveEntityParameters(parameters)
                .then(function () {
                    // XXX should we do window.open?
                    window.location.href = page;
                });
        },

        _saveEntityParameters: function (parameters) {
            return this._app.ajax.xhrPost("SmartParts/Social/SaveEntityParameters.ashx", parameters);
        },

        _expandVariables: function (template, status) {
            var result = djString.substitute(template, { user: status.user.name, text: status.text, source: status.source });
            result = Utility.stripHTML(result);
            return result;
        }
    });
});