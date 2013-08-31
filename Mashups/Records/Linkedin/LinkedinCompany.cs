using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace Saleslogix.Social.Mashups.Records.Linkedin
{
    public class LinkedinCompany : SocialProfileRecord
    {
        public String FoundedYear { get; set; }
        public String EndYear { get; set; }
        public String EmployeeCount { get; set; }
        public String Ticker { get; set; }

        public LinkedinCompany(XElement companyNode)
        {
            UserID = companyNode.Element("id").Value;
            FormattedName = LastName = companyNode.Element("name").Value;
            Description = companyNode.Element("description").SafeValue();
            Specialties = GetSpecialties(companyNode).ToArray();
            Location = GetLocation(companyNode);
            FoundedYear = companyNode.Element("founded-year").SafeValue();
            EndYear = companyNode.Element("end-year").SafeValue();
            EmployeeCount = GetEmployeeCount(companyNode.Element("employee-count-range").SafeValue());
            PictureUrl = companyNode.Element("square-logo-url").SafeValue();
            if(!String.IsNullOrEmpty(ProfileUrl))
                PictureUrl = companyNode.Element("logo-url").SafeValue();
            Ticker = companyNode.Element("ticker").SafeValue();
            ProfileUrl = companyNode.Element("website-url").SafeValue();
        }

        private String GetEmployeeCount(String range)
        {
            if (String.IsNullOrEmpty(range))
                return "";
            switch (range[0])
            {
                case 'A':
                    return "1";
                case 'B':
                    return String.Format("{0:n0}-{1:n0}", 2, 10);
                case 'C':
                    return String.Format("{0:n0}-{1:n0}", 11, 50);
                case 'D':
                    return String.Format("{0:n0}-{1:n0}", 51, 200);
                case 'E':
                    return String.Format("{0:n0}-{1:n0}", 201, 500);
                case 'F':
                    return String.Format("{0:n0}-{1:n0}", 501, 1000);
                case 'G':
                    return String.Format("{0:n0}-{1:n0}", 1001, 5000);
                case 'H':
                    return String.Format("{0:n0}-{1:n0}", 5001, 10000);
                case 'I':
                    return String.Format("{0:n0}+", 10001);
            }
            return "";
        }

        private string GetLocation(XElement companyNode)
        {
            XElement locsNode = companyNode.Element("locations");
            if (locsNode != null)
            {
                XElement locNode = locsNode.Element("location");
                if (locNode != null)
                {
                    if (locNode.Element("description") != null)
                        return locNode.Element("description").Value;
                    if (locNode.Element("address") != null)
                    {
                        XElement addrNode = locNode.Element("address");
                        String city = addrNode.Element("city").SafeValue();
                        String state = addrNode.Element("state").SafeValue();
                        String country = addrNode.Element("country").SafeValue();

                        String result = city ?? "";
                        if (!String.IsNullOrEmpty(state))
                        {
                            if (result != "")
                                result += ", ";
                            result += state;
                        }
                        if (!String.IsNullOrEmpty(country))
                        {
                            if (result != "")
                                result += ", ";
                            result += country;
                        }
                        if (result != "")
                            return result;
                    }
                }
            }
            return "";
        }

        private IEnumerable<string> GetSpecialties(XElement companyNode)
        {
            XElement specNode = companyNode.Element("specialties");
            if (specNode != null)
            {
                foreach (XElement spec in specNode.Elements("specialty"))
                {
                    yield return spec.Value;
                }
            }
        }
    }
}
