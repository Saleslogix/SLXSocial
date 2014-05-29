using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Reflection;

namespace Saleslogix.Social.Mashups.Processors
{
    /// <summary>
    /// Enforces a 10 second timeout of the web client, to avoid requests taking too long. 
    /// Also works around a security feature in the .NET framework that prevents sending URL containing an escaped slash character.
    /// </summary>
    public class TimeoutWebClient : WebClient
    {
        private const int DEFAULT_TIMEOUT = 10000;  // 10 s

        protected override WebRequest GetWebRequest(Uri address)
        {
            ForceCanonicalPathAndQuery(address);           
            HttpWebRequest req = (HttpWebRequest) base.GetWebRequest(address);
            req.Timeout = DEFAULT_TIMEOUT;

            // FIDDLER - do not enable in production
            //req.Proxy = new WebProxy("localhost", 8888);
            //ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

            return req;
        }

        // Hack to prevent the unescaping of the %2F character in the URL - see http://stackoverflow.com/questions/781205/getting-a-url-with-an-url-encoded-slash
        static void ForceCanonicalPathAndQuery(Uri uri)
        {
            string paq = uri.PathAndQuery; // need to access PathAndQuery
            FieldInfo flagsFieldInfo = typeof(Uri).GetField("m_Flags", BindingFlags.Instance | BindingFlags.NonPublic);
            ulong flags = (ulong)flagsFieldInfo.GetValue(uri);
            flags &= ~((ulong)0x30); // Flags.PathNotCanonical|Flags.QueryNotCanonical
            flagsFieldInfo.SetValue(uri, flags);
        }
    }
}
