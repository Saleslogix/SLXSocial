using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace UKPSG.Social.Mashups.Records.Linkedin
{
    public class LinkedinGroupUpdate : LinkedinStatusUpdate
    {
        public String GroupId, GroupName, GroupUrl;

        public LinkedinGroupUpdate(XElement source) : base(source)
        {
            XElement groupNode = source.Descendants("member-group").FirstOrDefault();
            if (groupNode != null)
            {
                GroupId = groupNode.Element("id").Value;
                GroupName = groupNode.Element("name").Value;
                if(groupNode.Element("site-group-request") != null)
                    GroupUrl = groupNode.Element("site-group-request").Element("url").Value;
                Description = String.Format("{0} joined group <a href='{1}'>{2}</a>",
                    Author.ToString(), GroupUrl, GroupName);
            }
        }
    }
}
