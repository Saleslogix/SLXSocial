/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="c03d95e5-91f3-419d-b477-2ea3ef2b09e2">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>SLXSocial_OnCreateStep</name>
 <references>
  <reference>
   <assemblyName>Sage.Entity.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\interfaces\bin\Sage.Entity.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Form.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\formInterfaces\bin\Sage.Form.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Platform.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\assemblies\Sage.Platform.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.SalesLogix.API.dll</assemblyName>
  </reference>
 </references>
</snippetHeader>
*/


#region Usings
using System;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.SalesLogix.API;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class OpportunityBusinessRules
    {
        public static void SLXSocial_OnCreateStep( IOpportunity opportunity)
        {
			var appCtx = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.IContextService>();
			if(appCtx.HasContext("NewEntityParameters")){
				var entityParams = appCtx["NewEntityParameters"] as System.Collections.Generic.Dictionary<String,String>;
				if(entityParams != null && entityParams.ContainsKey("OpportunityDescription")) {					
					opportunity.Description = (String)entityParams["OpportunityDescription"];					
				}
				if(entityParams != null && entityParams.ContainsKey("OpportunityNotes")) {					
					opportunity.Notes = (String)entityParams["OpportunityNotes"];
				}
				appCtx.RemoveContext("NewEntityParameters");
			}
        }
    }
}
