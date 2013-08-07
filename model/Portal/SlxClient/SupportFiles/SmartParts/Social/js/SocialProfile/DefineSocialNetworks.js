define(['./SocialNetworkConfiguration'],
function (SocialNetworkConfiguration) {
    return function (app) {
        var ctxService = Sage.Services.getService('ClientEntityContext');
        var entityId = ctxService.getContext().EntityId;

        // add the available social networks here
        app.addModule(new SocialNetworkConfiguration({
            imageUrl: "images/Providers/LinkedIn_Logo60px.png",
            inactiveImageUrl: "images/Providers/LinkedIn_Logo60px_Inactive.png",
            name: "LinkedIn",
            userSearchMashupName: "LinkedInPeopleSearch",
            updateFeedMashupName: "LinkedInSocialFeed",
            profileMashupName: "LinkedInProfile",
            entityId: entityId
        }));
        app.addModule(new SocialNetworkConfiguration({
            enableSearch: true,
            imageUrl: "images/Providers/twitter48.png",
            inactiveImageUrl: "images/Providers/twitter48_Inactive.png",
            name: "Twitter",
            userSearchMashupName: null,  // not needed for twitter
            updateFeedMashupName: "TwitterSearch",
            entityId: entityId
        }));
    }
});