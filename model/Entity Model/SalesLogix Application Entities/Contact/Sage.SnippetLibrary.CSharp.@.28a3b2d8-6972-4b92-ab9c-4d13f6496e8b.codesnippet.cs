/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="28a3b2d8-6972-4b92-ab9c-4d13f6496e8b">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>TwitterUpdateStatusStep</name>
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
   <hintPath>%BASEBUILDPATH%\assemblies\Twitterizer.Framework.dll</hintPath>
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
        public static void TwitterUpdateStatusStep( IContact contact,  String UserName,  String Password,  String Message)
        {
            // TODO: Complete business rule implementation
			try
            {
				Twitterizer.Framework.Twitter t = new Twitterizer.Framework.Twitter(UserName, Password);
            	t.Status.Update(Message);
			}
            catch (Exception ex)
            {
                
            }
        }
    }
}
