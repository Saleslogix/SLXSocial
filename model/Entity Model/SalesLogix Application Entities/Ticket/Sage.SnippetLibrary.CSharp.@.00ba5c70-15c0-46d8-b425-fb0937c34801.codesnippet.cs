/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="00ba5c70-15c0-46d8-b425-fb0937c34801">
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
	public static partial class TicketBusinessRules
	{
		public static void SLXSocial_OnCreate(ITicket ticket)
		{
			var appCtx = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.IContextService>();
			if (appCtx.HasContext("NewEntityParameters")) {
				var entityParams = appCtx["NewEntityParameters"] as System.Collections.Generic.Dictionary<String, String>;
				if (entityParams != null) {
					ticket.TicketProblem.Notes = (String)entityParams["TicketProblem"];
					ticket.Subject = (String)entityParams["TicketSubject"];
				}
				appCtx.RemoveContext("NewEntityParameters");
			}
		}
	}
}
