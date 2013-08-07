using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace UKPSG.Social.Mashups.Records.Linkedin
{
    public class LinkedinStatusUpdate : StatusUpdateRecord
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="source">Update node</param>
        public LinkedinStatusUpdate(XElement source)
        {
            StatusID = source.Element("update-key").Value;
            this.CreatedAt = ConvertUnixTimestamp(source.Element("timestamp").Value);
            XElement authorNode = source
                .Element("update-content")
                .Element("person");
            User = new LinkedinPerson(authorNode);
            if(authorNode.Element("current-status") != null)
                Text = authorNode.Element("current-status").Value;
        }

        private DateTime ConvertUnixTimestamp(string timestamp)
        {
            long ts = long.Parse(timestamp);
            return new DateTime(1970, 1, 1, 0, 0, 0, 0).AddMilliseconds(ts);
        }
    }
}
