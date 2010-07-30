using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using Sage.Platform.WebPortal;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Entity.Interfaces;

public partial class SmartParts_TaskPane_CommonTasks_Twitter : System.Web.UI.UserControl
{
    private IEntityContextService _entityService;
    /// <summary>
    /// Gets or sets the entity service.
    /// </summary>
    /// <value>The entity service.</value>
    [ServiceDependency]
    public IEntityContextService EntityService
    {
        get { return _entityService; }
        set { _entityService = value; }
    }

    EntityPage entityPage;

    protected void Page_Load(object sender, EventArgs e)
    {
        entityPage = Page as EntityPage;

        txtTwitterId.Attributes.Add("OnKeyUp", "TwitterDDChange()");
    }

    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);

        TwitterIdDropDown();
        chkRecordMsg.Checked = false;
        txtTwitterId.Text = "";

        if (entityPage.IsNewEntity)
        {
            TwitterPanel.Update();
            chkRecordMsg.Checked = false;
            txtTwitterId.Text = "";
        }
    }

    protected void cmdUpdateStatus_Click(object sender, EventArgs e)
    {
        IUserOptionsService userOption =
            Sage.Platform.Application.ApplicationContext.Current.Services.Get<IUserOptionsService>();
        
        string userName = userOption.GetCommonOption("UserName", "Twitter");
	    string passWord = userOption.GetCommonOption("Password", "Twitter");
	
	    if (!String.IsNullOrEmpty(userName) & !String.IsNullOrEmpty(passWord) & !String.IsNullOrEmpty(txtStatus.Text))
	    {
            try
            {
                Twitterizer.Framework.Twitter t = new Twitterizer.Framework.Twitter(userName, passWord);
                t.Status.Update(txtStatus.Text);
            }
            catch (Exception ex)
            {

            }
	    }
    }

    protected void cmdDirectMessage_Click(object sender, EventArgs e)
    {
        SendMessage();
    }

    protected void SendMessage()
    {
         //First get your Twitter info
        IUserOptionsService userOption =
            Sage.Platform.Application.ApplicationContext.Current.Services.Get<IUserOptionsService>();
        string userName = userOption.GetCommonOption("UserName", "Twitter");
        string passWord = userOption.GetCommonOption("Password", "Twitter");

        //Make sure we have all the info we need to send this direct message
        if (!String.IsNullOrEmpty(userName) & !String.IsNullOrEmpty(passWord))
        {
            try
            {
                //Id to send message to
                string id = "";

                if (String.IsNullOrEmpty(txtTwitterId.Text))
                    id = ddlTwitterIds.Text;
                else
                    id = txtTwitterId.Text.Trim();

                //Create and send direct message
                if (id != "")
                {
                    if (id != "noid")
                    {
                        if (!String.IsNullOrEmpty(txtDirectMessage.Text))
                        {
                            Twitterizer.Framework.Twitter t = new Twitterizer.Framework.Twitter(userName, passWord);
                            t.DirectMessages.New(id, txtDirectMessage.Text);
           
                            if (chkRecordMsg.Checked)
                            {
                                CreateHistory(id);
                            }
                        }
                        else
                        {
                            throw new Sage.Platform.Application.ValidationException("A message is required");
                        } 
                    }
                    else
                    {
                        throw new Sage.Platform.Application.ValidationException("A Twitter Id is required");
                    }
                }
                else
                {
                    throw new Sage.Platform.Application.ValidationException("A Twitter Id is required");
                }
            }
            catch (Exception ex)
            {
                throw new Sage.Platform.Application.ValidationException(ex.Message);
            }
        }
        else
        {
            throw new Sage.Platform.Application.ValidationException("Please goto user options and set your Twitter username and password");
        }
    }

    protected void CreateHistory(string TwitterId)
    {
        IContact currContact = Sage.Platform.EntityFactory.GetRepository<IContact>().FindFirstByProperty("TwitterId", TwitterId);

        if (currContact != null)
        {
            //Get logged in user
            Sage.Platform.Security.IUserService userService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            
            //Create new history object
            Sage.Entity.Interfaces.IHistory newHistory = Sage.Platform.EntityFactory.Create<Sage.Entity.Interfaces.IHistory>();
            
            newHistory.AccountId = currContact.Account.Id.ToString();
            newHistory.ContactId = currContact.Id.ToString();
            newHistory.Category = "Twitter Direct Msg";
            newHistory.Description = "Twitter Direct Msg";
            newHistory.Notes = txtDirectMessage.Text;
            newHistory.Type = Sage.Entity.Interfaces.HistoryType.atMessageBox;
            newHistory.UserId = userService.UserId;
            newHistory.Save(); 
        }
    }

    protected void TwitterIdDropDown()
    {
        EntityPage entityPage = Page as EntityPage;

        ddlTwitterIds.Items.Clear();
        if (!entityPage.IsListMode)
        {

            switch (entityPage.EntityContext.EntityType.Name)
            {
                case "IContact":
                    IContact currContact = Sage.Platform.EntityFactory.GetById<IContact>(entityPage.EntityContext.EntityID);
                    if (!String.IsNullOrEmpty(currContact.TwitterId))
                    {
                        ListItem newItem = new ListItem();
                        newItem.Selected = true;
                        newItem.Text = currContact.TwitterId;
                        newItem.Value = currContact.TwitterId;
                        ddlTwitterIds.Items.Add(newItem);
                        ddlTwitterIds.Enabled = true;
                        chkRecordMsg.Enabled = true;
                    }
                    else
                    {
                        ddlTwitterIds.Items.Add(new ListItem("No Twitter Id...", "noid"));
                        ddlTwitterIds.Enabled = false;
                        chkRecordMsg.Checked = false;
                        chkRecordMsg.Enabled = false;
                    }
                    break;
                case "IAccount":
                    IAccount currAccount = Sage.Platform.EntityFactory.GetById<IAccount>(entityPage.EntityContext.EntityID);

                    foreach (IContact c in currAccount.Contacts)
                    {
                        if (!String.IsNullOrEmpty(c.TwitterId))
                        {
                            ListItem newItem = new ListItem();
                            newItem.Text = c.TwitterId;
                            newItem.Value = c.TwitterId;
                            ddlTwitterIds.Items.Add(newItem);
                        }
                    }

                    if (ddlTwitterIds.Items.Count > 0)
                    {
                        ddlTwitterIds.Enabled = true;
                        chkRecordMsg.Enabled = true;
                        ddlTwitterIds.Items[0].Selected = true;
                    }
                    else
                    {
                        ddlTwitterIds.Items.Add(new ListItem("No Twitter Id...", "noid"));
                        ddlTwitterIds.Enabled = false;
                        chkRecordMsg.Checked = false;
                        chkRecordMsg.Enabled = false;
                    }
                    
                    
                    break;
                default:
                    break;
            }
        }
        else 
        {
            ddlTwitterIds.Items.Add(new ListItem("No Twitter Id...", "noid"));
            ddlTwitterIds.Enabled = false;
            chkRecordMsg.Checked = false;
            chkRecordMsg.Enabled = false;
        }
    }
}
