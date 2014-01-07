using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;

public partial class SmartParts_Social_WebUserControl : System.Web.UI.UserControl
{
    protected void Page_Load(object sender, EventArgs e)
    {
        ScriptManager.RegisterStartupScript(this, GetType(), "SocialQueueApp", String.Format(@"
require({{ packages: [ {{ name: 'SLXSocial', location: '../../../SmartParts/Social/js' }} ] }}, 
    ['SLXSocial/SocialBuzz/App', 'dojo/ready'], 
    function(App, ready) {{
        ready(10000, function() {{
            var app = new App(document.getElementById('{0}'));
            app.startAll();
        }});
    }}
);
", content.ClientID) , true);
    }
}
