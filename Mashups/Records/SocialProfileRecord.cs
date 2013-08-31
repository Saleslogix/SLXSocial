using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Sage.Platform.Mashups.Records;

namespace Saleslogix.Social.Mashups.Records
{
    /// <summary>
    /// Represent a person
    /// </summary>
    public class SocialProfileRecord
    {
        public String UserID { get; set; }
        public String LastName { get; set; }
        public String FirstName { get; set; }
        public String FormattedName { get; set; }
        public String Title { get; set; }
        public String PictureUrl { get; set; }
        public String ProfileUrl { get; set; }
        public String ScreenName { get; set; }
        public String Description { get; set; }
        public String Summary { get; set; }
        public String[] Specialties { get; set; }
        public String Location { get; set; }
        public String Industry { get; set; }
        public String CurrentEmployer { get; set; }
        public String PreviousEmployers { get; set; }
        public String Education { get; set; }
    }
}
