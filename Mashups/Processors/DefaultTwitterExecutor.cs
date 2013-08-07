using NHibernate;
using NHibernate.Engine;
using NHibernate.Engine.Query;
using NHibernate.Type;
using Sage.Common.Syndication;
using Sage.Platform.Exceptions;
using Sage.Platform.Mashups.Linq;
using Sage.Platform.Mashups.Records;
using Sage.Platform.Orm;
using Sage.Platform.Utility;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using LinqToTwitter;
using Sage.Platform.Mashups;
using UKPSG.Social.Mashups.Linq;
using System.Net;
using UKPSG.Social.Mashups.Records;
using System.Text.RegularExpressions;
using System.Web;

namespace UKPSG.Social.Mashups.Processors
{
    public class DefaultTwitterExecutor : ISocialExecutor
    {
        private const string TWITTER_STATUS_URL = "http://twitter.com/{0}/status/{1}";

        public IRecord[] Execute(string query,
                          int? maximumResults,
                          string OAuthConsumerKey,
                          string OAuthConsumerSecret,
                          string OAuthToken,
                          string OAuthTokenSecret,
                          System.Collections.Generic.IDictionary<string, object> parameters,
                          System.Collections.Generic.IList<string> aliases)
        {
            Guard.ArgumentNotNull(query, "query");
            IRecord[] result = null;


            if (parameters != null)
            {
                foreach (System.Collections.Generic.KeyValuePair<string, object> parameter in parameters)
                {
                    if (parameter.Value != null)
                        query = query.Replace(":" + parameter.Key, parameter.Value.ToString());
                    else
                        if (query.IndexOf(":" + parameter.Key) >= 0)
                            // this means the query has the parameter, but no value was passed
                            // in that case best to not actually run the query since we don't have parameters filled in
                            return new IRecord[] {};
                }
            }

            var auth = new SingleUserAuthorizer();
            auth.OAuthTwitter.OAuthConsumerKey = OAuthConsumerKey;
            auth.OAuthTwitter.OAuthConsumerSecret = OAuthConsumerSecret;
            auth.OAuthTwitter.OAuthToken = OAuthToken;
            auth.OAuthTwitter.OAuthTokenSecret = OAuthTokenSecret;
            var twitterCtx = new TwitterContext(auth);

            LinqCompiler lc = new LinqCompiler("");
            lc.Query = query;
            lc.AddSource("Status", twitterCtx.Status);
            lc.AddSource("User", twitterCtx.User);
            lc.AddSource("Search", twitterCtx.Search);

            object oresult = null;
            try
            {
                oresult = lc.Evaluate();

                if (oresult.GetType() == typeof(TwitterQueryable<LinqToTwitter.Status>))
                {
                    TwitterQueryable<LinqToTwitter.Status> q = (TwitterQueryable<LinqToTwitter.Status>)oresult;
                    //result = q.ToList().Cast<object>().SafeSelect((object item) => DefaultTwitterExecutor.CreateRecord(item, aliases)).ToArray<IRecord>();
                    result = q.ToList().SafeSelect(item => CreateStatusRecord(item)).ToArray<IRecord>();
                }

                if (oresult.GetType() == typeof(TwitterQueryable<LinqToTwitter.User>))
                {
                    TwitterQueryable<LinqToTwitter.User> q = (TwitterQueryable<LinqToTwitter.User>)oresult;
                    result = q.ToList().Cast<object>().SafeSelect((object item) => DefaultTwitterExecutor.CreateRecord(item, aliases)).ToArray<IRecord>();
                }

                if (oresult.GetType() == typeof(TwitterQueryable<LinqToTwitter.Search>))
                {
                    TwitterQueryable<LinqToTwitter.Search> q = (TwitterQueryable<LinqToTwitter.Search>)oresult;
                    // for the search operation, select the statuses as an array
                    result = q.ToList()[0].Statuses.SafeSelect(item => CreateStatusRecord(item)).ToArray<IRecord>();
                }


            }
            catch (TwitterQueryException ex)
            {
                WebException webEx = ex.InnerException as WebException;
                if (webEx != null)
                {
                    HttpWebResponse response = webEx.Response as HttpWebResponse;
                    if (response != null && response.StatusCode == HttpStatusCode.NotFound)
                    {
                        // twitter returns a 404 if no matching user
                        return new IRecord[] { };
                    }
                }
            }
            catch (Exception ex)
            {
                throw new MashupException(string.Format("{0}{1}{2}", UKPSG.Social.Mashups.Properties.Resources.DefaultQueryExecutor_UnableToExecuteQuery, System.Environment.NewLine, ex.Message), ex);
            }

            return result;




            //using (SessionScopeWrapper sessionScopeWrapper = new SessionScopeWrapper())
            //{
            //    IQuery query2 = sessionScopeWrapper.CreateQuery(query);
            //    if (maximumResults.HasValue)
            //    {
            //        query2.SetMaxResults(maximumResults.Value);
            //    }
            //    if (parameters != null)
            //    {
            //        ISessionFactoryImplementor sessionFactoryImplementor = (ISessionFactoryImplementor)sessionScopeWrapper.SessionFactory;
            //        ParameterMetadata parameterMetadata = (sessionFactoryImplementor != null && sessionFactoryImplementor.QueryPlanCache != null) ? sessionFactoryImplementor.QueryPlanCache.GetHQLQueryPlan(query, false, null).ParameterMetadata : null;
            //        foreach (System.Collections.Generic.KeyValuePair<string, object> current in parameters)
            //        {
            //            if (parameterMetadata != null)
            //            {
            //                NamedParameterDescriptor namedParameterDescriptor = parameterMetadata.GetNamedParameterDescriptor(current.Key);
            //                PrimitiveType primitiveType = namedParameterDescriptor.ExpectedType as PrimitiveType;
            //                object val = (primitiveType != null) ? ConvertEx.ChangeType(current.Value, primitiveType.PrimitiveClass, null) : current.Value;
            //                query2.SetParameter(current.Key, val, namedParameterDescriptor.ExpectedType);
            //            }
            //            else
            //            {
            //                query2.SetParameter(current.Key, current.Value);
            //            }
            //        }
            //    }
            //    try
            //    {
            //        result = query2.List().Cast<object>().SafeSelect((object item) => DefaultQueryExecutor.CreateRecord(item, aliases)).ToArray<IRecord>();
            //    }
            //    catch (QueryException ex)
            //    {
            //        throw new MashupException(string.Format("{0}{1}{2}", Resources.DefaultQueryExecutor_UnableToExecuteQuery, System.Environment.NewLine, ex.Message), ex);
            //    }
            //}

        }
        private static IRecord CreateRecord(object item, System.Collections.Generic.IList<string> aliases)
        {
            System.Collections.ICollection collection = item as System.Collections.ICollection;
            if (collection != null)
            {
                System.Collections.Generic.List<object> list = collection.Cast<object>().ToList<object>();
                if (aliases != null && aliases.Count != list.Count)
                {
                    aliases = null;
                }
                if (list.Count != 1)
                {
                    int counter = 0;
                    DictionaryRecord record = new DictionaryRecord();
                    list.ForEach(delegate(object obj)
                    {
                        record.SetValue((aliases != null) ? aliases[counter++] : ("Value" + ++counter), obj);
                    });
                    return record;
                }
                if (aliases != null)
                {
                    aliases[0] = Pluralizer.ToSingular(aliases[0]);
                }
                item = list[0];
            }
            if (aliases == null || aliases.Count != 1)
            {
                return RecordBase.CreateRecord(item);
            }
            return RecordBase.CreateRecord(item, aliases[0]);
        }

        /// <summary>
        /// Create record to represent a twitter status.
        /// The result is returned as a normalized "StatusUpdateRecord" (the same record type is used for the different social network providers, to 
        /// make the mashups easier to write and consume)
        /// </summary>
        /// <param name="search"></param>
        /// <returns></returns>
        private static IRecord CreateStatusRecord(LinqToTwitter.Status status)
        {
            if(String.IsNullOrEmpty(status.User.ScreenName))
                status.User.ScreenName = status.User.Identifier.ScreenName;
            if(String.IsNullOrEmpty(status.User.UserID))
                status.User.UserID = status.User.Identifier.UserID;
            return RecordBase.CreateRecord(new StatusUpdateRecord
            {
                User = new SocialProfileRecord
                {
                    UserID = status.User.UserID,
                    Description = status.User.Description,
                    LastName = status.User.Name,
                    ScreenName = status.User.ScreenName,
                    ProfileImageUrl = status.User.ProfileImageUrl,
                    ProfileImageUrlHttps = status.User.ProfileImageUrlHttps,
                    ProfileUrl = status.User.Url
                },
                StatusID = status.StatusID,
                Text = Twitterize(status.Text),
                CreatedAt = status.CreatedAt,
                Icon = "tweet.ico",
                StatusUrl = String.Format(TWITTER_STATUS_URL, status.User.ScreenName, status.StatusID)
            });            
        }

        private static String Twitterize(String text)
        {
            // TODO: this should be abstracted from Twitter
            var html = Regex.Replace(text, @"http:\/\/(.*?)(?=\s+|\.\s+|\.$|$)", delegate(Match m) {
                return String.Format("<a href='{0}' target='_blank'>{0}</a>", m.Groups[0].Value);
            });
            html = Regex.Replace(html, @"@(\w+)", delegate(Match m) {
                return String.Format("<a href='http://www.twitter.com/{0}' target='_blank'>@{1}</a>",
                    HttpUtility.UrlEncode(m.Groups[1].Value), HttpUtility.HtmlEncode(m.Groups[1].Value));
            });
            html = Regex.Replace(html, @"#(\w+)", delegate(Match m) {
                return String.Format("<a href='https://twitter.com/search?q={0}' target='_blank'>#{1}</a>", 
                    HttpUtility.UrlEncode(m.Groups[1].Value), HttpUtility.HtmlEncode(m.Groups[1].Value));
            });
            return html;
        }
    }
}
