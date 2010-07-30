using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Application.UI;

public partial class SmartParts_Options_frmTwitterOptions : System.Web.UI.UserControl, ISmartPartInfoProvider
{
    protected void Page_Load(object sender, EventArgs e)
    {
        Sage.Platform.Application.Services.IUserOptionsService userOption = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
        string userName = userOption.GetCommonOption("UserName", "Twitter");
        string passWord = userOption.GetCommonOption("Password", "Twitter");
        string myTwitterId = userOption.GetCommonOption("MyTwitterId", "Twitter");
        string dashView = userOption.GetCommonOption("DashView", "Twitter");

        if (!String.IsNullOrEmpty(userName))
        {
            txtUserName.Text = userName;
        }

        if (!String.IsNullOrEmpty(passWord))
        {
            lblPassword.Text = "Password set and hidden for security";
        }

        if (!String.IsNullOrEmpty(myTwitterId))
        {
            txtMyTwitterId.Text = myTwitterId;
        }

        if (!String.IsNullOrEmpty(dashView))
        {
            dlViews.Text = dashView;
        }
    }

    protected void btnSave_Click(object sender, ImageClickEventArgs e)
    {
        Sage.Platform.Application.Services.IUserOptionsService userOption = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
        userOption.SetCommonOption("UserName", "Twitter", txtUserName.Text, true);
        userOption.SetCommonOption("Password", "Twitter", txtPassword.Text, true);
        userOption.SetCommonOption("MyTwitterId", "Twitter", txtMyTwitterId.Text, true);
        userOption.SetCommonOption("DashView", "Twitter", dlViews.Text, true);
    }

    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        tinfo.Description = "Twitter Options"; // "Change Password";
        tinfo.Title = "Twitter"; // "Change Password";
        foreach (Control c in this.LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }

        //tinfo.ImagePath = Page.ResolveClientUrl("~/images/icons/Schdedule_To_Do_24x24.gif");
        return tinfo;
    }

    #endregion
}
