<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SocialSetup.ascx.cs" Inherits="SmartParts_Social_SocialSetup" %>

<table class="formtable">
<tr><td>
    <img src="SmartParts/Social/img/LinkedIn_Logo60px.png" alt="LinkedIn Icon" />
    <h3>LinkedIn</h3>
    <p>
        Follow these steps to create a free LinkedIn API key for the integration:
        <ul>
            <li>Log in to <a href="http://developer.linkedin.com" target="_blank">developer.linkedin.com</a>.</li>
            <li>Under Support, click "API Keys", then "Add New Application"</li>
            <li>Fill in your application information, making sure the following are selected:
                <ul>
                    <li><b>Website URL:</b> URL of your company's website</li>
                    <li><b>Application Use:</b> Sales (CRM), Marketing</li>
                    <li><b>Default Scope:</b> check r_fullprofile, rw_nus and r_network</li>
                    <li><b>OAuth 2.0 Redirect URLs:</b> include the URL of your Saleslogix site's options page: <asp:Label runat="server" ID="lblOptionsUrl" />.  If you have other Saleslogix site addresses,
                    include them here separated by commas.</li>
                </ul>
            </li>
            <li>Copy the <b>API Key</b> and <b>Secret Key</b> in the spaces below then click "Save".</li>
        </ul>
    </p>
    <div style="max-width: 450px">
        <label class="lbl">API Key:</label>
        <div class="textcontrol">
            <asp:TextBox ID="txtLinkedInClientId" runat="server" dojoType="Sage.UI.Controls.TextBox" required="true" />            
            <span style="color: Red">
            <asp:RequiredFieldValidator runat="server" Text="Please enter API key" ControlToValidate="txtLinkedInClientId" />
            </span>
        </div>
        <br style="clear: both"/>
        <label class="lbl">Secret Key:</label>
        <div class="textcontrol">
            <asp:TextBox ID="txtLinkedInSecret" runat="server" dojoType="Sage.UI.Controls.TextBox" required="true"/>
            <span style="color: Red">
            <asp:RequiredFieldValidator runat="server" Text="Please enter Secret Key" ControlToValidate="txtLinkedInSecret" />
            </span>
        </div>
    </div>
    <br style="clear: both"/>
    <img src="SmartParts/Social/img/twitter48.png" alt="Twitter Icon" />
    <h3>Twitter</h3>
    <p>No configuration is needed for Twitter integration</p>
    
    <div>
        <asp:Button runat="server" ID="btnSave" Text="Save" />
    </div>    
</td></tr>
</table>