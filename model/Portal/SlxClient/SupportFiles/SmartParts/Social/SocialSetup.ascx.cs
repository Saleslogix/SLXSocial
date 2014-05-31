using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using Sage.Platform;

public partial class SmartParts_Social_SocialSetup : SmartPart
{
    // hard coded API key for Twitter
    private const string TWITTER_CLIENTID = "3RXaGN1NbmxM07jzFUOjcw";
    private const string TWITTER_SECRET = "DAex9TgzB8Wg8IiMlFdNPkHoM90hqVWPBFBnEkNNE";

    protected void Page_Load(object sender, EventArgs e)
    {
        
    }

    protected override void OnInit(EventArgs e)
    {
        base.OnInit(e);
        btnSave.Click += new EventHandler(btnSave_Click);
    }

    void btnSave_Click(object sender, EventArgs e)
    {
        CreateLinkedInProvider(txtLinkedInClientId.Text, txtLinkedInSecret.Text);
        CreateTwitterProvider(TWITTER_CLIENTID, TWITTER_SECRET);
        ScriptManager.RegisterStartupScript(this, GetType(), "Redirect",
            @"var opts={title:'Saleslogix',query:'Configuration complete',callbackFn:function() { window.location.href = 'SocialBuzz.aspx'; },yesText:'OK',noText:false,scope:window,icon:'noIcon',style:{width:'700px'}};Sage.UI.Dialogs.raiseQueryDialogExt(opts);", true);
    }

    private void CreateTwitterProvider(string clientId, string secret)
    {
        IOAuthProvider provider = FindOrCreateOAuthProvider("Twitter", clientId, secret);
        provider.ProviderName = "Twitter";
        provider.UserApprovalUrl = "/oauth/authenticate";
        provider.Host = "https://api.twitter.com";
        provider.AccessTokenUrl = "/oauth/access_token";
        provider.RequiresAccessToken = true;
        provider.EndpointUrl = "https://api.twitter.com";
        provider.RequestTokenUrl = "/oauth/request_token";
        provider.RequestTokenMethod = "POST";
        provider.OAuthVersion = "1.0";
        provider.SupportsCallback = true;
        provider.Save();
    }

    private void CreateLinkedInProvider(string clientId, string secret)
    {
        IOAuthProvider provider = FindOrCreateOAuthProvider("LinkedIn", clientId, secret);
        provider.ProviderName = "LinkedIn";
        provider.UserApprovalUrl = "/authorization";
        provider.Host = "https://www.linkedin.com/uas/oauth2";
        provider.UserApprovalData = "?response_type=code&client_id={CLIENTID}&state={STATE}&redirect_uri={REDIRECT_URI}";
        provider.AccessTokenUrl = "/accessToken";
        provider.AccessTokenMethod = "POST";
        provider.AccessTokenData = "grant_type=authorization_code&code={TOKEN}&redirect_uri={REDIRECT_URI}&client_id={CLIENTID}&client_secret={CLIENTSECRET}";
        provider.RequiresAccessToken = true;        
        provider.EndpointUrl = "https://www.linkedin.com/uas/oauth2";
        provider.OAuthVersion = "2.0";
        provider.SupportsCallback = true;
        provider.Save();
    }

    private IOAuthProvider FindOrCreateOAuthProvider(string providerKey, string clientId, string secret)
    {
        IOAuthProvider provider = EntityFactory.GetRepository<IOAuthProvider>().FindFirstByProperty("ProviderKey", providerKey);
        if (provider == null)
        {
            provider = EntityFactory.Create<IOAuthProvider>();
            provider.ProviderKey = providerKey;
        }
        provider.ClientId = clientId;
        provider.Secret = secret;
        if (provider.Integration == null)
        {
            IIntegration integration = EntityFactory.GetRepository<IIntegration>().FindFirstByProperty("Name", providerKey);
            if (integration == null)
            {
                integration.Name = providerKey;
                integration.AuthorizationType = "OAuth";
                integration.Enabled = true;
                integration.Syncable = false;
            }
            provider.Integration = integration;
        }
        return provider;
    }
}