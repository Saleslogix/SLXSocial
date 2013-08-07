<%@ WebHandler Language="C#" Class="SaveEntityParameters" %>

using System;
using System.Web;
using System.Collections.Generic;
using Sage.Platform.Application;

/// <summary>
/// Save parameters to the session so they can be used when creating the entity
/// </summary>
public class SaveEntityParameters : IHttpHandler, System.Web.SessionState.IReadOnlySessionState
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        Dictionary<String, string> entityParameters = new Dictionary<string, string>();
        foreach (String k in context.Request.Form.AllKeys)
        {
            // the stuff is always passed as HTML encoded, but within the entity model we want to save it as unescaped text
            entityParameters[k] = HttpUtility.HtmlDecode(context.Request.Form[k]);
        }
        var appCtx = ApplicationContext.Current.Services.Get<IContextService>(true);
        appCtx["NewEntityParameters"] = entityParameters;
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}