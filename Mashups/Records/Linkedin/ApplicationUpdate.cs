using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace UKPSG.Social.Mashups.Records.Linkedin
{
    public class ApplicationUpdate : LinkedinStatusUpdate
    {
        public ApplicationUpdate(XElement source)
            : base(source)
        {
            XElement body = source.Descendants("body").FirstOrDefault();
            if (body != null)
            {
                Description = body.Value;
            }
        }
    }
}
