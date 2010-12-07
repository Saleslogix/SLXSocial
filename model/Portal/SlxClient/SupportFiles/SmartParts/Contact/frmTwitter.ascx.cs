using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Sage.Platform.WebPortal.SmartParts;
using System.Web.UI;
using Sage.Platform.Security;
using Sage.Platform.Application;
using Sage.Entity.Interfaces;
using Sage.Platform.WebPortal.Binding;
using Sage.Platform;
using Sage.Platform.Application.Services;
using System.Reflection;
using TwitterVB2;
using Sage.Platform.Application.UI;

/// <summary>
/// Summary description for frmTwitter
/// </summary>
public partial class frmTwitter : EntityBoundSmartPartInfoProvider
{

    private IRoleSecurityService _roleSecurityService;
    /// <summary>
    /// Gets or sets the role security service.
    /// </summary>
    /// <value>The role security service.</value>
    [ServiceDependency]
    public IRoleSecurityService RoleSecurityService
    {
        set
        {
            _roleSecurityService = ApplicationContext.Current.Services.Get<IRoleSecurityService>(true);
        }
        get
        {
            return _roleSecurityService;
        }
    }

    public override Type EntityType
    {
        get { return typeof(IContact); }
    }

    protected override void OnAddEntityBindings()
    {
        BindingSource.Bindings.Add(new WebEntityBinding("TwitterId", QFTextBox, "Text"));
    }

    protected void cdmSaveTwitterId_ClickAction(object sender, EventArgs e)
    {
        IContact _entity = BindingSource.Current as IContact;
        if (_entity != null)
        {
            object _parent = GetParentEntity();
            if (DialogService.ChildInsertInfo != null)
            {
                if (_parent != null)
                {
                    if (DialogService.ChildInsertInfo.ParentReferenceProperty != null)
                    {
                        DialogService.ChildInsertInfo.ParentReferenceProperty.SetValue(_entity, _parent, null);
                    }
                }
            }
            bool shouldSave = true;
            Sage.Platform.WebPortal.EntityPage page = Page as Sage.Platform.WebPortal.EntityPage;
            if (page != null)
            {
                if (IsInDialog() && page.ModeId.ToUpper() == "INSERT")
                {
                    shouldSave = false;
                }
            }

            if (shouldSave)
            {
                _entity.Save();
            }

            if (_parent != null)
            {
                if (DialogService.ChildInsertInfo != null)
                {
                    if (DialogService.ChildInsertInfo.ParentsCollectionProperty != null)
                    {
                        MethodInfo _add = DialogService.ChildInsertInfo.ParentsCollectionProperty.PropertyType.GetMethod("Add");
                        _add.Invoke(DialogService.ChildInsertInfo.ParentsCollectionProperty.GetValue(_parent, null), new object[] { _entity });
                    }
                }
            }
        }

    }

    protected void cmdDirectMessage_ClickAction(object sender, EventArgs e)
    {
        IContact currContact = this.BindingSource.Current as IContact;
        string id = currContact.TwitterId;
        TwitterAPI api = GetTwitterAPI();

        if (api != null && !String.IsNullOrEmpty(id))
        {

            try
            {
                api.SendDirectMessage(id, txtDirectMessage.Text);

                IUserService currUser = ApplicationContext.Current.Services.Get<IUserService>();

                IActivity newActivityRec = EntityFactory.Create<IActivity>();
                newActivityRec.AccountId = currContact.Account.Id.ToString();
                newActivityRec.ContactId = currContact.Id.ToString();


                IUserOptionsService userOption = ApplicationContext.Current.Services.Get<IUserOptionsService>();
                string myTwitterId = userOption.GetCommonOption("MyTwitterId", "Twitter");
                newActivityRec.Description = "Twitter direct message sent from " + myTwitterId;

                newActivityRec.Notes = txtDirectMessage.Text;
                newActivityRec.Type = ActivityType.atNote;
                newActivityRec.Category = "Twitter DM";
                
                newActivityRec.Save();
                newActivityRec.Complete(currUser.UserId, "Completed", "", DateTime.UtcNow);


            }
            catch (Exception ex)
            {

            }
        }
    }

    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        cdmSaveTwitterId.Click += new EventHandler(cdmSaveTwitterId_ClickAction);
        cmdDirectMessage.Click += new EventHandler(cmdDirectMessage_ClickAction);
    }

    protected void quickformload0(object sender, EventArgs e)
    {

        Sage.Platform.Application.Services.IUserOptionsService userOption = ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
        string myTwitterId = userOption.GetCommonOption("MyTwitterId", "Twitter");
        string accessToken = userOption.GetCommonOption("AccessToken", "Twitter");

        if (String.IsNullOrEmpty(myTwitterId) & String.IsNullOrEmpty(accessToken))
        {
            cmdDirectMessage.Enabled = false;
        }

    }
    private bool _runActivating;
    protected override void OnActivating()
    {
        _runActivating = true;
    }
    private void DoActivating()
    {
        quickformload0(this, EventArgs.Empty);

    }
    protected override void OnFormBound()
    {
        Sage.Platform.WebPortal.EntityPage epage = Page as Sage.Platform.WebPortal.EntityPage;

        if (epage != null)
            _runActivating = (epage.IsNewEntity || _runActivating);

        if (_runActivating) DoActivating();

        ClientBindingMgr.RegisterSaveButton(cdmSaveTwitterId);

        LoadGridContents();

    }

    TwitterAPI GetTwitterAPI()
    {
        IUserOptionsService userOption = ApplicationContext.Current.Services.Get<IUserOptionsService>();

        string accessToken = userOption.GetCommonOption("AccessToken", "Twitter");
        string AccessTokenSecret = userOption.GetCommonOption("AccessTokenSecret", "Twitter");
        string ConsumerKey = userOption.GetCommonOption("ConsumerKey", "Twitter");
        string ConsumerSecret = userOption.GetCommonOption("ConsumerSecret", "Twitter");

        TwitterAPI api = new TwitterAPI();
        api.AuthenticateWith(ConsumerKey, ConsumerSecret, accessToken, AccessTokenSecret);

        return api;
    }

    private void LoadGridContents()
    {

        TwitterAPI api = GetTwitterAPI();

        if (api != null)
        {

            string id = ((Sage.Entity.Interfaces.IContact)BindingSource.Current).TwitterId;

            if (!string.IsNullOrEmpty(id))
            {
                try
                {
                    List<TwitterVB2.TwitterStatus> result = api.UserTimeline(id);
                    List<TwitterContainer> container = new List<TwitterContainer>();
                    foreach (var item in result)
                    {
                        container.Add(new TwitterContainer(item.Text, item.User.Name));
                    }

                    dgTweets.DataSource = container;
                    dgTweets.DataBind();
                }
                catch (Exception ex)
                {
                }
            }

        }
    }


    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (BindingSource != null)
        {
            if (BindingSource.Current != null)
            {
                tinfo.Description = BindingSource.Current.ToString();
                tinfo.Title = BindingSource.Current.ToString();
            }
        }

        foreach (Control c in Controls)
        {
            SmartPartToolsContainer cont = c as SmartPartToolsContainer;
            if (cont != null)
            {
                switch (cont.ToolbarLocation)
                {
                    case SmartPartToolsLocation.Right:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.RightTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Center:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.CenterTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Left:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.LeftTools.Add(tool);
                        }
                        break;
                }
            }
        }

        return tinfo;
    }


}

public class TwitterContainer
{
    public string Text { get; set; }
    public string ScreenName { get; set; }

    /// <summary>
    /// Initializes a new instance of the TwitterContainer class.
    /// </summary>
    public TwitterContainer(string text, string screenName)
    {
        Text = text;
        ScreenName = screenName;
    }
}