using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;

public partial class SmartParts_Social_SocialProfile : EntityBoundSmartPartInfoProvider
{
    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo ti = new ToolsSmartPartInfo();
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
    ['SLXSocial/SocialProfile/SocialProfileTab'], 
    function(SocialProfileTab) {{
        var app = new SocialProfileTab(document.getElementById('{0}'), '{1}');
        app.startAll();
    }}
);
", placeholder.ClientID, EntityPage.EntityContext.EntityID), true);
    }


    protected override void OnAddEntityBindings()
    {
    }
}