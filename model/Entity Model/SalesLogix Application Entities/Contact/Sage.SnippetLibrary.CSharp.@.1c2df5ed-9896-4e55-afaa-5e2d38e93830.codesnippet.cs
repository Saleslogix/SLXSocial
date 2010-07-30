/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="1c2df5ed-9896-4e55-afaa-5e2d38e93830">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>TwitterDirectMessageStep</name>
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
        public static void TwitterDirectMessageStep( IContact contact,  String UserName,  String Password,  String Message,  String TwitterId)
        {
            // TODO: Complete business rule implementation
			try
            {
				Twitterizer.Framework.Twitter t = new Twitterizer.Framework.Twitter(UserName, Password);
            	t.DirectMessages.New(TwitterId, Message);
			}
            catch (Exception ex)
            {
                
            }
        }
    }
}
