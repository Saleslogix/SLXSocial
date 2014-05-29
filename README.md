# Installation

## Installation Instructions

1. Copy the DLL Saleslogix.Social.Mashups.dll (from the bundle) to C:\Program Files (x86)\SalesLogix\Platform.  **Bundle installation will fail with an XML error if that is not done.**
2. Install the bundle: _Saleslogix Social Buzz_ has the new social tabs.
3. Optionally, add the following directive to %ALLUSERSPROFILE%\Sage\Platform\Configuration\Global\MashupConfiguration.xml
(this will allow declaration of other mashups making used of the Linkedin and Twitter providers):  

    <processorType>Saleslogix.Social.Mashups.Processors.TwitterProcessor, Saleslogix.Social.Mashups</processorType>
    <processorType>Saleslogix.Social.Mashups.Processors.LinkedinProcessor, Saleslogix.Social.Mashups</processorType>

## Social Network Configuration

Twitter and LinkedIn are both supported but must be configured under Administration -> Authentication Providers, then the users 
need to authorize the service under Tools -> Options.

For Twitter, the provider must be named "Twitter OAuth", and the parameters are as follows:

Provider URL = https://api.twitter.com  
OAuth Version = 1.0  
Request URL suffix: /oauth/request_token  
Request token method: POST  
Supports Callback: true  
Secret: consumer secret obtained when registering Twitter application  
Client ID: client id obtained when registering Twitter application  
Host URL: https://api.twitter.com  
Approval URL Suffix: /oauth/authenticate  
Requires access token: true  
Access Url Suffix: /oauth/access_token  

For LinkedIn, the provider must be named "LinkedIn", and configured as follows:  

Provider URL = https://www.linkedin.com/uas/oauth2  
OAuth Version = 2.0  
Supports Callback = true  
Secret = consumer secret obtained when registering LinkedIn application  
Client Id = client id obtained when registering LinkedIn application  
Host Url = https://www.linkedin.com/uas/oauth2  
Approval Url Suffix = /authorization  
User Data String = ?response_type=code&client_id={CLIENTID}&state={STATE}&redirect_uri={REDIRECT_URI}  
Requires access token: true  
Access Url Suffix = /accessToken  
Access Data String = grant_type=authorization_code&code={TOKEN}&redirect_uri={REDIRECT_URI}&client_id={CLIENTID}&client_secret={CLIENTSECRET}  

When registering the application on LinkedIn developer network, set the default scopes as r_basicprofile, r_fullprofile, r_network, rw_nus.  
You must also specify a valid redirect URL under "OAuth 2.0 Redirect URLs".  The URL must point to the UserOptions.aspx page on the Saleslogix site, 
for example: http://localhost/SlxClient/UserOptions.aspx.  This address does not necessarily have to be accessible from outside of the network.  It 
must include the port number if not default (e.g. http://localhost:3001/SlxClient/UserOptions.aspx).

If there are multiple URLs used to access Saleslogix they must all be listed.

# SalesLogix Tabs

## Social Timeline

Displays updates retrieved from Social Network in a timeline
Limitations: limited # of days and updates from both Twitter and Linkedin
On some networks (e.g. Linkedin) updates cannot be retrieved if not connected to the person directly, if that happens there will be an error message “Unable to retrieve update for the selected user”

## Social Updates
Really the same as Social Timeline, but displayed as a list instead of a timeline widget

## Social Profile
Ability to configure and display “profile”, retrieved from social network.  This is typically available even if not connected, though the information will be more limited the more distant the connection is
Configuration is the same as the one used by the other tabs
Stored in the database in EntitySocialProfile

## Social Queue
A standalone page, distinct from the 3 tabs.
Allow searching for keywords, retrieving matching post, and taking action on them (e.g. creating opportunities)

## Steps for adding social network

Add OAuth provider
Add mashup processor
Create mashups for update feed, people search (if appropriate), profile (if available)
Add definition for network in DefineSocialNetwork.js


# Change Log

5/29/2014 - Nicolas Galler - Updated search in LinkedIn to prompt for public URL instead of using people search, as the people search API is no longer available.

11/2/2013 - Nicolas Galler - Updated LinktoTwitter library, removed OAuth bundle as it is no longer necessary with 8.0 HF4

8/9/2013 - Nicolas Galler - Added 3 new tabs: Social Updates, Social Profile, Social Timeline, and 1 navigation item: Social Queue.

4/24/2012 - Mark Dykun - Uploaded the VFS bundle that was updated for SalesLogix 7.5.4. Note that there will be merges requred for some of the support files ensuring that the core functionality is not overwritten between service packs.

12/7/2010 - Mark Dykun - This Accelerator provides Twitter support to Sage SalesLogix 7.5.3 Client. It requires the Standard Problem/Resolution accelerator be installed first as it integrates with the Ticket Problem Type dialogs. The functionality augments several stock smartparts (Lead, Ticket, Defect, Ticket Problem Type) as well as the Link Handler (C# and Javascript) files. Make sure that you back the ones you have up and determine the change sets to migrate across. oAuth support is added in this release and before the user can post to twitter they will need to go to options tab and register the application with Twitter. 

Apply the SocialFields SXB to add a new field to the Contact Table (TwitterId)

