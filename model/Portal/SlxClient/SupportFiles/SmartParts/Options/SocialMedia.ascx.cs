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
using Sage.Platform.Application.UI;

public partial class SmartParts_Options_SocialMedia : System.Web.UI.UserControl, ISmartPartInfoProvider
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (! IsPostBack)
        {
            Sage.Platform.Application.Services.IUserOptionsService userOption = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
            string userName = userOption.GetCommonOption("UserName", "Twitter");
            string passWord = userOption.GetCommonOption("Password", "Twitter");
            
            txtTwitterId.Text = userName;
            txtTwitterPassword.Attributes.Add("value", passWord);

            userName = userOption.GetCommonOption("UserName", "LinkedIn");
            passWord = userOption.GetCommonOption("Password", "LinkedIn");

            txtLinkedInUsername.Text = userName;
            txtLinkedInPassword.Attributes.Add("value", passWord);

            userName = userOption.GetCommonOption("UserName", "FaceBook");
            passWord = userOption.GetCommonOption("Password", "FaceBook");

            txtFaceBookUserName.Text = userName;
            txtFaceBookPassword.Attributes.Add("value", passWord);
        }
    }
    protected void cmdTwitterSave_Click(object sender, EventArgs e)
    {
        Sage.Platform.Application.Services.IUserOptionsService userOption = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
        userOption.SetCommonOption("UserName", "Twitter", txtTwitterId.Text, true);
        userOption.SetCommonOption("Password", "Twitter", txtTwitterPassword.Text, true);
    }
    protected void cmdLinkedInSave_Click(object sender, EventArgs e)
    {
        Sage.Platform.Application.Services.IUserOptionsService userOption = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
        userOption.SetCommonOption("UserName", "LinkedIn", txtLinkedInUsername.Text, true);
        userOption.SetCommonOption("Password", "LinkedIn", txtLinkedInPassword.Text, true);
    }
    protected void cmdFaceBookSave_Click(object sender, EventArgs e)
    {
        Sage.Platform.Application.Services.IUserOptionsService userOption = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
        userOption.SetCommonOption("UserName", "FaceBook", txtFaceBookUserName.Text, true);
        userOption.SetCommonOption("Password", "FaceBook", txtFaceBookPassword.Text, true);
    }
	
	/// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        tinfo.Description = "Social Media Settings";
        tinfo.Title = "Social Media";
        return tinfo;
    }
}
