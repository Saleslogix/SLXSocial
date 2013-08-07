using Sage.Platform.Mashups.Records;
using System;
using System.Collections.Generic;

namespace UKPSG.Social.Mashups.Processors
{
    public interface ISocialExecutor
    {
        IRecord[] Execute(string query,
                          int? maximumResults,
                          string OAuthConsumerKey,
                          string OAuthConsumerSecret,
                          string OAuthToken,
                          string OAuthTokenSecret,
                          System.Collections.Generic.IDictionary<string, object> parameters,
                          System.Collections.Generic.IList<string> aliases);
    }
}
