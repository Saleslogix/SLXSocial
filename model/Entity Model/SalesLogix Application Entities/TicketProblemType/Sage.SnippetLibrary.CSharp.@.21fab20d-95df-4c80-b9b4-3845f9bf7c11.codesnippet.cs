/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="21fab20d-95df-4c80-b9b4-3845f9bf7c11">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>SLXSocial_OnCreate</name>
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
    public static partial class TicketProblemTypeBusinessRules
    {
        public static void SLXSocial_OnCreate( ITicketProblemType ticketproblemtype)
        {
            var appCtx = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.IContextService>();
			if(appCtx.HasContext("NewEntityParameters")){
				var entityParams = appCtx["NewEntityParameters"] as System.Collections.Generic.Dictionary<String,String>;
				if(entityParams != null) {
					ticketproblemtype.Description = (String)entityParams["ProblemDescription"];
					ticketproblemtype.Notes = (String)entityParams["ProblemNotes"];
				}
				appCtx.RemoveContext("NewEntityParameters");
			}
        }
    }
}