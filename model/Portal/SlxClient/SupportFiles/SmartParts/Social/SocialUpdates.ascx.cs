using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;


public partial class SmartParts_Social_SocialUpdates : EntityBoundSmartPartInfoProvider
{
    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo ti = new ToolsSmartPartInfo();
        ti.RightTools.Add(cmdAddProfile);
        ti.RightTools.Add(cmdFilter);
        return ti;
    }

    public override Type EntityType
    {
        get { return EntityPage.EntityContext.EntityType; }
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        ScriptManager.RegisterStartupScript(this, GetType(), "SocialProfileApp", String.Format(@"
require({{ packages: [ {{ name: 'SLXSocial', location: '../../../SmartParts/Social/js' }} ] }}, 
    ['SLXSocial/SocialUpdates/App', 'dojo/ready'], 
    function(SocialUpdatesTab, ready) {{
        ready(10000, function() {{
            var app = new SocialUpdatesTab(document.getElementById('{0}'), '{1}', '{2}');
            app.startAll(); 
        }});
    }}
);
", placeholder.ClientID, cmdFilter.ClientID, cmdAddProfile.ClientID), true);
    }


    protected override void OnAddEntityBindings()
    {
    }
}