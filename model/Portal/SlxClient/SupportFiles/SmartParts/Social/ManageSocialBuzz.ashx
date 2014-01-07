<%@ WebHandler Language="C#" Class="ManageSocialBuzz" %>

using System;
using System.Web;
using System.Collections.Generic;

// Handle server side objects for Social Buzz
// (to be used for shares - not implemented yet)
//public class ManageSocialBuzz : IHttpHandler, System.Web.SessionState.IReadOnlySessionState
//{

//    public void ProcessRequest(HttpContext context)
//    {
//        object result = null;
//        switch (context.Request["action"])
//        {
//            case "list":
//                result = ListSocialSearches();
//                break;

//        }
//        if (result == null)
//        {
//            throw new Exception("Invalid request");
//        }
//        context.Response.ContentType = "application/json";
//        context.Response.Write(Sage.Common.Syndication.Json.JsonConvert.SerializeObject(result));
//    }

//    public bool IsReusable
//    {
//        get
//        {
//            return false;
//        }
//    }

//    private object ListSocialSearches()
//    {
//        List<SocialSearch> result = new List<SocialSearch>();
//        using (var sess = new Sage.Platform.Orm.SessionScopeWrapper())
//        {
//            String sql = "select pluginid, name, data, author from plugin where family = 'Social Buzz' and type=34 order by name, dev desc";
//            //if(((String)Sage.SalesLogix.API.MySlx.Security.CurrentSalesLogixUser.Id).Trim() == "ADMIN"){
//            //}
//            foreach (object[] resultRow in sess.CreateSQLQuery(sql).List<object[]>())
//            {
//            }
//        }
//        return result;
//    }

//    private class SocialSearch
//    {
//        public String SearchName;
//        public String SearchTerms;
//        public String Id;
//        public String UserId;
//    }
//}