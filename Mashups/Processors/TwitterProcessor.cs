using Sage.Platform.ComponentModel;

using Sage.Platform.Mashups;
using Sage.Platform.Mashups.Linq;
using Sage.Platform.Mashups.Records;
using Sage.Platform.Mashups.Processors;

using Sage.Platform.Projects;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Design;
using System.Drawing.Design;
using System.Linq;
using System.Threading;
using System.Xml;
using System.Xml.Serialization;

using UKPSG.Social.Mashups.Localization;


namespace UKPSG.Social.Mashups.Processors
{
    [SRDisplayName("TwitterProcessor_DisplayName"), System.Xml.Serialization.XmlRoot("queryProcessor")]
    public class TwitterProcessor : InputProcessorBase
    {
        private const String TWITTER_OAUTHPROVIDER_NAME = "Twitter OAuth";
        private readonly TemplateValue _query = new TemplateValue();
        private int? _maximumResults;
        private ISocialExecutor _executor;
        [System.ComponentModel.Design.HelpKeyword("752308")]
        public override System.Collections.Generic.ICollection<Parameter> Parameters
        {
            get
            {
                return base.Parameters;
            }
        }
        [SRDisplayName("TwitterProcessor_Query_DisplayName"), System.ComponentModel.Editor("Sage.Platform.Mashups.AdminModule.Design.SyntaxDialogTypeEditor+Hql, Sage.Platform.Mashups.AdminModule", typeof(UITypeEditor)), System.Xml.Serialization.XmlAttribute("query")]
        public string Query
        {
            get
            {
                return this._query.Value;
            }
            set
            {
                if (this._query.SetValue(value))
                {
                    this.NotifyPropertyChanged("Query");
                }
            }
        }


        [SRDisplayName("QueryProcessor_MaximumResults_DisplayName"), System.Xml.Serialization.XmlIgnore]
        public int? MaximumResults
        {
            get
            {
                return this._maximumResults;
            }
            set
            {
                this.SetProperty("MaximumResults", ref this._maximumResults, value);
            }
        }


        [System.ComponentModel.Browsable(false), System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never), System.Xml.Serialization.XmlAttribute("maximumResults")]
        public string MaximumResultsString
        {
            get
            {
                if (!this.MaximumResults.HasValue)
                {
                    return null;
                }
                return System.Xml.XmlConvert.ToString(this.MaximumResults.Value);
            }
            set
            {
                this.MaximumResults = new int?(System.Convert.ToInt32(value));
            }
        }
        public override System.Collections.Generic.IEnumerable<string> PropertyNames
        {
            get
            {
                //return this.ParseAliases() ?? System.Linq.Enumerable.Empty<string>();
                return new String[] {
                    "Text"
                };
            }
        }
        [System.ComponentModel.Browsable(false), System.Xml.Serialization.XmlIgnore]
        public ISocialExecutor Executor
        {
            get
            {
                bool flag = false;
                ISocialExecutor result;
                try
                {
                    System.Threading.Monitor.Enter(this, ref flag);
                    ISocialExecutor arg_24_0;
                    if ((arg_24_0 = this._executor) == null)
                    {
                        arg_24_0 = (this._executor = new DefaultTwitterExecutor());
                    }
                    result = arg_24_0;
                }
                finally
                {
                    if (flag)
                    {
                        System.Threading.Monitor.Exit(this);
                    }
                }
                return result;
            }
            set
            {
                this._executor = value;
            }
        }
        protected override System.Collections.Generic.IEnumerable<IRecord> OnProcessRecord(IRecord record, System.Collections.Generic.IDictionary<string, object> runtimeParams)
        {
            string text = this._query.Evaluate(base.Mashup, record, runtimeParams);

            AuthenticationData auth = AuthenticationData.RetrieveAuthenticationData(TWITTER_OAUTHPROVIDER_NAME);
            System.Collections.Generic.Dictionary<string, object> parameters = this.Parameters.ToDictionary((Parameter param) => param.Name, (Parameter param) => param.Evaluate(this.Mashup, record, runtimeParams));
            System.Collections.Generic.IList<string> aliases = this.ParseAliases();
            base.WriteLog("Executing {0}", new object[]
            {
                text.Replace("\r", " ").Replace("\n", " ").Replace("  ", " ")
            });
            return this.Executor.Execute(text,
                                         this._maximumResults,
                                         auth.ConsumerKey,
                                         auth.ConsumerSecret,
                                         auth.Token,
                                         auth.TokenSecret,
                                         parameters, aliases);
        }


        private System.Collections.Generic.IList<string> ParseAliases()
        {
            string text = " " + new string(this.Query.SafeSelect(delegate(char c)
            {
                if (!char.IsWhiteSpace(c))
                {
                    return c;
                }
                return ' ';
            }).ToArray<char>());
            int num = text.IndexOf(" select ", System.StringComparison.InvariantCultureIgnoreCase);
            if (num < 0)
            {
                return null;
            }
            int num2 = text.IndexOf(" from ", num, System.StringComparison.InvariantCultureIgnoreCase);
            if (num2 < 0)
            {
                return null;
            }
            num += 8;
            string text2 = text.Substring(num, num2 - num);
            string[] array = text2.Split(new char[]
            {
                ','
            });
            for (int i = 0; i < array.Length; i++)
            {
                string text3 = array[i].Trim();
                int num3 = text3.IndexOf(" as ", System.StringComparison.InvariantCultureIgnoreCase);
                if (num3 >= 0)
                {
                    text3 = text3.Substring(num3 + 4);
                }
                array[i] = text3.Trim();
            }
            return array;
        }
        protected override bool DoValidation(ErrorMessageList errorList)
        {
            bool result = base.DoValidation(errorList);
            if (string.IsNullOrEmpty(this.Query))
            {
                result = false;
                EditableBase.AddError(errorList, "Query", string.Format(UKPSG.Social.Mashups.Properties.Resources.PropertyCannotBeEmpty, SR.GetString("TwitterProcessor_Query_DisplayName")));
            }
            else
            {
                if (this._query.Error != null)
                {
                    result = false;
                    EditableBase.AddError(errorList, "Query", string.Format("{0}: {1}", SR.GetString("TwitterProcessor_Query_DisplayName"), this._query.Error));
                }
            }
            return result;
        }
    }
}