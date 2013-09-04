using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using Sage.Platform.Mashups.Records;

namespace Saleslogix.Social.Mashups.Records.Linkedin
{
    /// <summary>
    /// Company updates
    /// </summary>
    public class LinkedinCompanyShare : StatusUpdateRecord
    {
        private LinkedinCompanyShare()
        {
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="source">Update node</param>
        public static LinkedinCompanyShare MakeRecord(XElement source, IRecord profileRecord)
        {
            LinkedinCompanyShare result = new LinkedinCompanyShare();
            result.StatusID = source.Element("update-key").Value;
            result.CreatedAt = ConvertUnixTimestamp(source.Element("timestamp").Value);
            result.SocialNetwork = "LinkedIn";
            result.User = new SocialProfileRecord
            {
                PictureUrl = (String)profileRecord["PictureUrl"],
                ProfileUrl = (String)profileRecord["ProfileUrl"],
                FormattedName = (String)profileRecord["FormattedName"],
                ScreenName = (String)profileRecord["ScreenName"],
                LastName = (String)profileRecord["LastName"]
            };
            XElement contentNode = source.Element("update-content");
            XElement personUpdateNode = contentNode.Element("company-person-update");
            if (personUpdateNode != null)
            {
                result.PopulatePersonUpdate(personUpdateNode);
                return result;
            }
            XElement statusUpdateNode = contentNode.Element("company-status-update");
            if (statusUpdateNode != null)
            {
                result.PopulateStatusUpdate(statusUpdateNode);
                return result;
            }
            XElement productUpdateNode = contentNode.Element("company-product-update");
            if(productUpdateNode != null)
            {
                result.PopulateProductUpdate(productUpdateNode);
                return result;
            }
            XElement jobUpdateNode = contentNode.Element("company-job-update");
            if(jobUpdateNode != null)
            {
                result.PopulateJobUpdate(jobUpdateNode);
                return result;
            }
            return null;
        }

        private void PopulateProductUpdate(XElement productUpdateNode)
        {
            Text = String.Format(Properties.Resources.LinkedinProcessor_NewProduct,
                productUpdateNode.Element("product").Element("name").Value);
        }

        private void PopulateStatusUpdate(XElement statusUpdateNode)
        {
            XElement contentNode = statusUpdateNode.Element("share").Element("content");
            this.PictureUrl = contentNode.Element("submitted-image-url").SafeValue();
            this.Text = contentNode.Element("description").SafeValue();
            this.StatusUrl = contentNode.Element("submitted-url").SafeValue();
        }

        private void PopulatePersonUpdate(XElement personUpdateNode)
        {
            String actionCode = personUpdateNode.Element("action").Element("code").Value;
            LinkedinPerson person = new LinkedinPerson(personUpdateNode.Element("person"));
            if (actionCode == "joined")
            {
                Text = String.Format(Properties.Resources.LinkedProcessor_NewHire,
                    person.ToString(), personUpdateNode.Element("new-position").Element("title").Value);
            }
            else if (actionCode == "changed-position")
            {
                Text = String.Format(Properties.Resources.LinkedProcessor_ChangedPosition,
                    person.ToString(), personUpdateNode.Element("new-position").Element("title").Value);
            }
        }

        private void PopulateJobUpdate(XElement jobUpdateNode)
        {
            try
            {
                StatusUrl = jobUpdateNode.Element("job").Element("site-job-request").Element("url").Value;
            }
            catch (NullReferenceException) { }
            Text = String.Format(Properties.Resources.LinkedinProcessor_NewJob,
                jobUpdateNode.Element("job").Element("position").Element("title").SafeValue(),
                jobUpdateNode.Element("job").Element("location-description").SafeValue(),
                jobUpdateNode.Element("job").Element("description").SafeValue());
        }


        private static DateTime ConvertUnixTimestamp(string timestamp)
        {
            long ts = long.Parse(timestamp);
            return new DateTime(1970, 1, 1, 0, 0, 0, 0).AddMilliseconds(ts);
        }
    }
}
