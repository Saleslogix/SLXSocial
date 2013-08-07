using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UKPSG.Social.Mashups.Records
{
    /// <summary>
    /// Represent a status update (e.g. a tweet)
    /// </summary>
    public class StatusUpdateRecord
    {
        public String StatusID { get; set; }
        public String Text{ get; set; }
        public String StatusUrl{ get; set; }
        public String PictureUrl{ get; set; }
        public DateTime CreatedAt { get; set; }
        public String Icon { get; set; }
        public SocialProfileRecord User { get; set; }

        public StatusUpdateRecord()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
}
