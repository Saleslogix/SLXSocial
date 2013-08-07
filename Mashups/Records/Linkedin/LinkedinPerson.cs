using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace UKPSG.Social.Mashups.Records.Linkedin
{
    public class LinkedinPerson : SocialProfileRecord
    {
        // how many schools to show in results
        private const int SHOW_SCHOOLS = 3;
        // how many previous employers to show in results
        private const int SHOW_PREVIOUS_EMPLOYERS = 3;
        private const int EDUCATION_MAX_LENGTH = 128;
        private const int EMPLOYER_MAX_LENGTH = 128;

        public LinkedinPerson(XElement personNode)
        {
            UserID = personNode.Element("id").Value;
            if(personNode.Element("first-name") != null)
                FirstName = personNode.Element("first-name").Value;
            if(personNode.Element("last-name") != null)
                LastName = personNode.Element("last-name").Value;
            if (personNode.Element("headline") != null)
                Title = personNode.Element("headline").Value;
            else
                Title = "";
            if(personNode.Element("site-standard-profile-request") != null)
                ProfileUrl = personNode.Element("site-standard-profile-request").Element("url").Value;
            else if(personNode.Element("public-profile-url") != null)
                ProfileUrl = personNode.Element("public-profile-url").Value;
            if(personNode.Element("picture-url") != null)
                ProfileImageUrl = personNode.Element("picture-url").Value;
            if(personNode.Element("formatted-name") != null)
                FormattedName = personNode.Element("formatted-name").Value;
            if (String.IsNullOrEmpty(FormattedName))
                FormattedName = String.Format("{0} {1}", FirstName, LastName);
            Description = String.Format("{0}, {1}", FormattedName, Title);
            ScreenName = FormattedName;
            if (personNode.Element("industry") != null)
                Industry = personNode.Element("industry").Value;
            if (personNode.Element("summary") != null)
                Summary = personNode.Element("summary").Value;
            if (personNode.Element("specialties") != null)
                Specialties = personNode.Element("specialties").Value.Split('\n');
            if (personNode.Element("location") != null)
                Location = personNode.Element("location").Element("name").Value;
            if (personNode.Element("positions") != null)
            {
                ParsePositionsNode(personNode.Element("positions"));
            }
            if (personNode.Element("educations") != null)
            {
                ParseEducationNode(personNode.Element("educations"));
            }
        }

        private void ParseEducationNode(XElement educations)
        {
            String education = null;
            int count = 0;
            foreach (XElement posNode in educations.Elements("position"))
            {
                if (posNode.Element("school-name") != null)
                {
                    if (++count > SHOW_SCHOOLS)
                        break;
                    if (education == null)
                    {
                        education = posNode.Element("school-name").Value;
                    }
                    else
                    {
                        education += ", " + posNode.Element("school-name").Value;
                    }
                }
            }
            if (education != null && education.Length > EDUCATION_MAX_LENGTH)
                education = education.Substring(0, EDUCATION_MAX_LENGTH);

            this.Education = education;            
        }

        private void ParsePositionsNode(XElement positions)
        {
            String current=null, previous=null;
            int count = 0;
            foreach (XElement posNode in positions.Elements("position"))
            {
                if (posNode.Element("company") != null)
                {
                    String company = posNode.Element("company").Element("name").Value;
                    if (posNode.Element("is-current").Value == "true")
                    {
                        current = company;
                    }
                    else
                    {

                        if (++count > SHOW_PREVIOUS_EMPLOYERS)
                            break;
                        if (previous == null)
                        {
                            previous = company;
                        }
                        else
                        {
                            previous += ", " + company;
                        }
                    }
                }
            }
            if (previous != null && previous.Length > EMPLOYER_MAX_LENGTH)
                previous = previous.Substring(0, EMPLOYER_MAX_LENGTH);

            CurrentEmployer = current;
            PreviousEmployers = previous;
        }

        public override string ToString()
        {
            return String.Format("<a href='{0}'>{1}</a>, {2}", ProfileUrl, FormattedName, Title);
        }
    }
}
