/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="77145384-c97f-4e8f-9e12-cc6dde39269c">
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
    public static partial class DefectBusinessRules
    {
        public static void SLXSocial_OnCreate( IDefect defect)
        {
            var appCtx = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.IContextService>();
			if(appCtx.HasContext("NewEntityParameters")){
				var entityParams = appCtx["NewEntityParameters"] as System.Collections.Generic.Dictionary<String,String>;
				if(entityParams != null) {
					defect.Subject = (String)entityParams["DefectSubject"];
					defect.DefectProblem.Notes = (String)entityParams["DefectNotes"];
				}
				appCtx.RemoveContext("NewEntityParameters");
			}
        }
    }
}