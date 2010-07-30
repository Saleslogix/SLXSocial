/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="2d2f8607-ec4e-443f-8445-f6241e2b8c0e">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>TwitterUserTweetsStep</name>
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
   <assemblyName>Twitterizer.Framework.dll</assemblyName>
   <hintPath>c:\SocialDependencies\Twitterizer.Framework.dll</hintPath>
  </reference>
 </references>
</snippetHeader>
*/


#region Usings
using System;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	public static partial class ContactBusinessRules
	{
		public static void TwitterUserTweetsStep(IContact contact, out object result)
		{
			// TODO: Complete business rule implementation
			
			Sage.Platform.Application.Services.IUserOptionsService userOption = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Application.Services.IUserOptionsService>();
			string userName = userOption.GetCommonOption("UserName", "Twitter");
			string passWord = userOption.GetCommonOption("Password", "Twitter");
			
			Twitterizer.Framework.Twitter t = new Twitterizer.Framework.Twitter(userName, passWord);
			
			if(t != null & !String.IsNullOrEmpty(contact.TwitterId))
			{
				Twitterizer.Framework.TwitterParameters tp = new Twitterizer.Framework.TwitterParameters();
				tp.Add(Twitterizer.Framework.TwitterParameterNames.ID, contact.TwitterId);
				Twitterizer.Framework.TwitterStatusCollection tsc = t.Status.UserTimeline(tp);

				result = tsc;
			}
			else
			{
				result = null;
			}
		}
	}
}
