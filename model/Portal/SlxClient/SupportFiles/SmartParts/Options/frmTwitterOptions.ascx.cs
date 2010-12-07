using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Application.UI;
using Sage.Platform.Application.Services;
using Sage.Platform.Application;

public partial class SmartParts_Options_frmTwitterOptions : System.Web.UI.UserControl, ISmartPartInfoProvider
{

    string consumerKey = "Qc3pf17VKEVyxP74UlshA";
    string consumerSecret = "uBQlaMTzoN4YdMfbpel8GaMsLL4QSyKyuHNIDVDCLPQ";

    protected void Page_Load(object sender, EventArgs e)
    {
        IUserOptionsService userOption = ApplicationContext.Current.Services.Get<IUserOptionsService>();
        
        string myTwitterId = userOption.GetCommonOption("MyTwitterId", "Twitter");
        string dashView = userOption.GetCommonOption("DashView", "Twitter");

        if (!String.IsNullOrEmpty(myTwitterId))
        {
            txtMyTwitterId.Text = myTwitterId;
        }

        if (!String.IsNullOrEmpty(dashView))
        {
            dlViews.Text = dashView;
        }

        if (!String.IsNullOrEmpty(Request.QueryString["oauth_verifier"]))
        {
            GetAccessToken();
        }

        string authId = userOption.GetCommonOption("AccessToken", "Twitter");

        if (!string.IsNullOrEmpty(authId))
        {
            btnRegister.Visible = false;
            lblRegistered.Visible = true;
        }
        else
        {
            btnRegister.Visible = true;
            lblRegistered.Visible = false;
        }

    }

    private void GetAccessToken()
    {
        TwitterVB2.TwitterOAuth auth = new TwitterVB2.TwitterOAuth(consumerKey, consumerSecret);
        auth.GetAccessToken(Request.QueryString["oauth_token"], Request.QueryString["oauth_verifier"]);

        
        IUserOptionsService userOption = ApplicationContext.Current.Services.Get<IUserOptionsService>();

        userOption.SetCommonOption("AccessToken", "Twitter", auth.Token, true);
        userOption.SetCommonOption("AccessTokenSecret", "Twitter", auth.TokenSecret, true);
        userOption.SetCommonOption("ConsumerKey", "Twitter", consumerKey, true);
        userOption.SetCommonOption("ConsumerSecret", "Twitter", consumerSecret, true);
    }

    protected void btnSave_Click(object sender, ImageClickEventArgs e)
    {
        SaveDetails();
    }

    protected void btnRegister_Click(object sender, EventArgs args)
    {
        SaveDetails();

        TwitterVB2.TwitterOAuth auth = new TwitterVB2.TwitterOAuth(consumerKey, consumerSecret, Request.Url.AbsoluteUri);
        Response.Redirect(auth.GetAuthorizationLink());

    }

    private void SaveDetails()
    {
        IUserOptionsService userOption = ApplicationContext.Current.Services.Get<IUserOptionsService>();
        userOption.SetCommonOption("MyTwitterId", "Twitter", txtMyTwitterId.Text, true);
        userOption.SetCommonOption("DashView", "Twitter", dlViews.Text, true);
    }


    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        tinfo.Description = "Twitter Options"; 
        tinfo.Title = "Twitter"; 
        foreach (Control c in this.LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        
        return tinfo;
    }

    #endregion
}
