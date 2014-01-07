define({
    root: {
        justNowText: 'just now',
        oneMinuteAgoText: '1 minute ago',
        minutesAgoText: 'minutes ago',
        oneHourAgoText: '1 hour ago',
        hoursAgoText: 'hours ago',
        yesterdayText: 'Yesterday',
        daysAgoText: 'days ago',
        weeksAgoText: 'weeks ago',

        // dialog strings
        setupNowText: 'Setup Now',
        cancelText: 'Cancel',
        configureText: 'Configure',
        removeText: 'Remove',

        // strings for the menu
        newNoteText: 'New Note',
        newLeadText: 'New Lead',
        newOpportunityText: 'New Opportunity',
        newCompetitiveThreatText: 'New Competitive Threat',
        newSilverBulletText: 'New Silver Bullet',
        phoneCallText: 'Phone Call',
        todoText: 'To-Do',
        ticketText: 'Ticket',
        competitiveThreatText: 'Competitive Threat',
        newActivityText: 'New Activity',
        silverBulletText: 'Silver Bullet',
        featureRequestText: 'Feature Request',

        // strings for the context actions

        // I guess those could just be using the base Sage strings..?
        activityNotesText: '${source} user: ${user} \n posted: ${text}',
        ticketSubject: 'Follow up on ${source} post from: ${user}',
        opportunityDescription: 'Follow up on ${source} post from: ${user}',
        opportunityNotes: '${source} user: ${user} \n posted: ${text}',
        featureRequestSubject: 'Feature Request submitted from ${source} post by: ${user}',

        // Social queue
        searchText: "Twitter Search",
        loadingText: 'Loading...',
        welcomeToSaleslogixBuzz1: 'Welcome to Saleslogix Social Buzz!  Search Twitter for the latest updates and save searches.  When you see something important, you can take action on it and associate it with your Saleslogix information.',
        welcomeToSaleslogixBuzz2: 'If you do not currently have a Twitter account, <a href="https://twitter.com/signup" target="_blank">click here</a> to sign up for one, so you can join the conversation!',
        welcomeToSaleslogixBuzz3: 'If you do have a Twitter account and want to start taking advantage of the Saleslogix Social Buzz, make sure you set it up under <a href="UserOptions.aspx">Tools &gt; Options &gt; Authorize Services</a>.',

        // Social timeline 
        follow: "Follow Tags:",
        saveDefaultsTooltip: "Save currently selected words as default for this entity",
        saveDefaultsText: "Save Defaults",
        addTagText: "Add",
        addTagTooltip: "Add tag to display on the timeline",
        nothingSelected: 'Nothing selected',
        removeTagTooltip: "Remove Tag",
        socialProfileTitle: "Social Profile",
        
        // Social Profile
        socialNetworkNotAuthenticated: "No authentication information for this social network (or the current authentication may have expired) - please configure authorization under your user options",
        socialProfileInvalidUser: "Specified username cannot be found on this network (or your user does not have access)",
        socialProfileInvalidUserWithProfileLink: "You do not have access to that user's feed - <a href='${url}' target='_blank'>visit their profile</a> on the social site to connect with them",
        lblPersonSearch: "Person Search",
        lblScreenName: "@Screen Name",
        moreThan1MatchPleaseSelectUser: "More than 1 users match this name - please select the appropriate one:",
        notConfigured: "Not configured",
        userPictureText: "User Picture",
        specialtiesText: "Specialties",
        companySizeText: "Company Size",
        rightClickForOptions: "Right-click for options",
        websiteText: "Website",
        foundedText: "Founded",
        profilePicture: "Profile Picture",
        viewProfileText: "View Full Profile on Social Network",
        refreshText: "Refresh Profile from Social Network",
        errorRetrievingNetworkUpdates: "Error retrieving network updates",
        configureProfileText: "Configure Profile",
        unableToLoadUsersSocialFeedText: "Unable to load ${network} updates for the selected user - you may not have access to their feed, or your <a href='UserOptions.aspx'>service authorization</a> has expired",
        unableToLoadSocialFeedText: "Unable to load social network updates - did you authorize access to the service under your <a href='UserOptions.aspx'>user options</a>?",
        previousEmployerText: "Previous Employers",
        educationText: "Education",
        addProfileText: "Add Profile",
        noSocialProfileConfiguredText: "No social profile has been configured for this record - please use the 'Add Profile' link to add one",
        socialNetworkSignup: "<a href='${signup_url}' target='_blank'>Sign Up</a> for a new ${network_name} account?"
    }
});