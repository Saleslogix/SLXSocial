using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Sage.Platform.Orm;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Security;

namespace Saleslogix.Social.Mashups.Processors
{
    /// <summary>
    /// Used to hold the OAuth parameters that are stored in the database
    /// </summary>
    public class AuthenticationData
    {
        public String ConsumerKey;
        public String ConsumerSecret;
        /// <summary>
        /// Access token
        /// </summary>
        public String Token;
        /// <summary>
        /// Access token secret (for OAuth 1)
        /// </summary>
        public String TokenSecret;
        /// <summary>
        /// Refresh token (for OAuth 2)
        /// </summary>
        public String RefreshToken;

        public static AuthenticationData RetrieveAuthenticationData(String providerName)
        {
            using (var sess = new SessionScopeWrapper())
            {
                var prov = sess.CreateQuery("from OAuthProvider where ProviderName=?")
                    .SetString(0, providerName)
                    .List<IOAuthProvider>().FirstOrDefault();
                if (prov == null)
                {
                    throw new Exception(String.Format("Unable to locate {0} provider in the configured OAuth providers", providerName));
                }
                var userToken = sess.CreateQuery("from UserOAuthToken where OAuthProvider.Id=? and User.Id=?")
                    .SetString(0, prov.Id.ToString())
                    .SetString(1, ApplicationContext.Current.Services.Get<IUserService>().UserId)
                    .List<IUserOAuthToken>()
                    .FirstOrDefault();
                if (userToken == null || userToken.AccessToken == null)
                {
                    throw new Exception(String.Format("Unable to locate authorization token for current user under {0} provider", providerName));
                }
                if (userToken.ExpirationDate != null && userToken.ExpirationDate < DateTime.Now)
                {
                    // TODO: refresh, if possible??  (Not applicable to either Twitter or Linked in, though)
                    throw new Exception(String.Format("Authentication token for {0} provider has expired", providerName));
                }
                return new AuthenticationData
                {
                    ConsumerKey = prov.ClientId,
                    ConsumerSecret = prov.Secret,
                    Token = userToken.AccessToken,
                    TokenSecret = userToken.AccessTokenSecret,
                    RefreshToken = userToken.RefreshToken
                };
            }
        }
    }
}
