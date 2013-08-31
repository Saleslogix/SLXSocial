using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace Saleslogix.Social.Mashups.Records
{
    public static class XElementExtension
    {
        public static String SafeValue(this XElement source)
        {
            if (source == null)
                return null;
            return source.Value;
        }
    }
}
