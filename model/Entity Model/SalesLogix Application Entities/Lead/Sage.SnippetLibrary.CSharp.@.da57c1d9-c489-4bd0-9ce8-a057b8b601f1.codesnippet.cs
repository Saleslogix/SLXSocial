/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="da57c1d9-c489-4bd0-9ce8-a057b8b601f1">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>SLXSocial_OnLeadCreate</name>
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
    public static partial class LeadBusinessRules
    {
        public static void SLXSocial_OnLeadCreate( ILead lead)
        {
            var appCtx = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.IContextService>();
			if(appCtx.HasContext("NewEntityParameters")){
				var entityParams = appCtx["NewEntityParameters"] as System.Collections.Generic.Dictionary<String,String>;
				if(entityParams != null && entityParams.ContainsKey("LeadNotes")) {
					lead.Notes = (String)entityParams["LeadNotes"];
					lead.BusinessDescription = (String)entityParams["LeadBusinessDescription"];
					lead.WebAddress = (String)entityParams["LeadUrl"];
					String name = (String)entityParams["LeadName"];
					String[] nameParts = name.Split(new char[] { ' ' }, 2);
					if(nameParts.Length == 2) {
						lead.FirstName = nameParts[0];
						lead.LastName = nameParts[1];						
					} else {
						lead.LastName = name;
					}
					lead.Company = name;
				}
				appCtx.RemoveContext("NewEntityParameters");
			}
        }
    }
}
