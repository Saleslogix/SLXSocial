define(['./SocialNetworkConfiguration', 'dojo/i18n!../nls/Resources'],
function (SocialNetworkConfiguration, Resources) {
    return function (app) {
        var ctxService = Sage.Services.getService('ClientEntityContext');
        var ctx = ctxService.getContext();

        var entityId = ctx.EntityId;

        var cnf = {};

        // add the available social networks here
        if (ctx.EntityTableName == "ACCOUNT") {
            // for LinkedIn we need a different profile for accounts (because they use the company API)
            cnf.LinkedIn = new SocialNetworkConfiguration({
                imageUrl: "SmartParts/Social/img/LinkedIn_Logo60px.png",
                inactiveImageUrl: "SmartParts/Social/img/LinkedIn_Logo60px_Inactive.png",
                name: "LinkedIn",
                signupUrl: "https://www.linkedin.com",
                userSearchMashupName: "LinkedInCompanySearch",
                updateFeedMashupName: "LinkedInCompanyFeed",
                profileMashupName: "LinkedInBusinessProfile",
                entityId: entityId
            });
        } else {
            cnf.LinkedIn = new SocialNetworkConfiguration({
                imageUrl: "SmartParts/Social/img/LinkedIn_Logo60px.png",
                inactiveImageUrl: "SmartParts/Social/img/LinkedIn_Logo60px_Inactive.png",
                name: "LinkedIn",
                signupUrl: "https://www.linkedin.com",
                userNameLabel: Resources.lblLinkedInUrl,
                userNamePrefix: "http://",
                userSearchMashupName: null,  // not available for contact
                updateFeedMashupName: "LinkedInSocialFeed",
                profileMashupName: "LinkedInProfile",
                entityId: entityId
            });
        }
        cnf.Twitter = new SocialNetworkConfiguration({
            enableSearch: true,
            imageUrl: "SmartParts/Social/img/twitter48.png",
            inactiveImageUrl: "SmartParts/Social/img/twitter48_Inactive.png",
            signupUrl: "https://www.twitter.com/signup",
            name: "Twitter",
            userNameLabel: Resources.lblScreenName,
            userNamePrefix: "@",
            userSearchMashupName: null,  // not needed for twitter
            updateFeedMashupName: "TwitterSearch",
            entityId: entityId
        });


        for (var k in cnf) {
            app.addModule(cnf[k]);
        }

        return cnf;
    }
});