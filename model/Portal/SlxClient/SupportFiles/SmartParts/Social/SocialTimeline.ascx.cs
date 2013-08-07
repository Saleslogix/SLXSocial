using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.WebPortal.Binding;
using Sage.Platform.Orm.Interfaces;

public partial class SmartParts_Social_SocialTimeline : EntityBoundSmartPartInfoProvider
{
    protected override void OnFormBound()
    {
        base.OnFormBound();

        ScriptManager.RegisterStartupScript(this, GetType(), "SocialTimelineApp", String.Format(@"
require({{ packages: [ {{ name: 'SLXSocial', location: '../../../SmartParts/Social/js' }} ] }}, 
    ['SLXSocial/SocialTimeline/App'], 
    function(App) {{
        var app = new App(document.getElementById('{0}'), '{1}');
        app.startAll();
    }}
);
", placeholder.ClientID, cmdFilter.ClientID), true);
    }

    public override Type EntityType
    {
        get { return EntityPage.EntityContext.EntityType; }
    }

    protected override void OnAddEntityBindings()
    {
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var ti = new ToolsSmartPartInfo();
        ti.RightTools.Add(cmdFilter);
        return ti;
    }

}