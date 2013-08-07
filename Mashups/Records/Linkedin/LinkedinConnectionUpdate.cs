using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using UKPSG.Social.Mashups.Records;

namespace UKPSG.Social.Mashups.Records.Linkedin
{
    /// <summary>
    /// Represent a CONN update (a new Linkedin connection)
    /// </summary>
    public class LinkedinConnectionUpdate : StatusUpdateRecord
    {
        public SocialProfileRecord Connection;

        public LinkedinConnectionUpdate(XElement source)
        {
            StatusID = source.Element("update-key").Value;
            this.CreatedAt = ConvertUnixTimestamp(source.Element("timestamp").Value);
            XElement authorNode = source
                .Element("update-content")
                .Element("person");
            User = new LinkedinPerson(authorNode);
            Connection = new LinkedinPerson(authorNode.Element("connections").Element("person"));
            Text = String.Format("{0} is now connected with {1}",
                User.ToString(), Connection.ToString());
        }

        private DateTime ConvertUnixTimestamp(string timestamp)
        {
            long ts = long.Parse(timestamp);
            return new DateTime(1970, 1, 1, 0, 0, 0, 0).AddMilliseconds(ts);
        }
    }
}
