using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;

namespace Saleslogix.Social.Mashups.Processors
{
    public class TimeoutWebClient : WebClient
    {
        private const int DEFAULT_TIMEOUT = 10000;  // 10 s

        protected override WebRequest GetWebRequest(Uri address)
        {
            HttpWebRequest req = (HttpWebRequest) base.GetWebRequest(address);
            req.Timeout = DEFAULT_TIMEOUT;
            return req;
        }
    }
}
