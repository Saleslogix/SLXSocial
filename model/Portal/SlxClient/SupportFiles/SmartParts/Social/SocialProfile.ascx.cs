using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;

public partial class SmartParts_Social_SocialProfile : EntityBoundSmartPartInfoProvider
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
        String useBusiness = "false";
        if (EntityType == typeof(IAccount))
        {
            useBusiness = "true";
        }
        ScriptManager.RegisterStartupScript(this, GetType(), "SocialProfileApp", String.Format(@"
require({{ packages: [ {{ name: 'SLXSocial', location: '../../../SmartParts/Social/js' }} ] }}, 
    ['SLXSocial/SocialProfile/SocialProfileTab', 'dojo/ready'], 
    function(SocialProfileTab, ready) {{
        ready(10000, function() {{
            var app = new SocialProfileTab(document.getElementById('{0}'), '{1}', '{2}', {3});
            app.startAll(); 
        }});
    }}
);
", placeholder.ClientID, cmdFilter.ClientID, cmdAddProfile.ClientID, useBusiness), true);
    }


    protected override void OnAddEntityBindings()
    {
    }
}