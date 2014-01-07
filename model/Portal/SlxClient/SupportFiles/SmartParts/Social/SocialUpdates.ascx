<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SocialUpdates.ascx.cs" Inherits="SmartParts_Social_SocialUpdates" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<SalesLogix:SmartPartToolsContainer runat="server" ID="tools" ToolbarLocation="right">
    <asp:ImageButton runat="server" ID="cmdAddProfile" ImageUrl="~/images/icons/plus_16x16.png" AlternateText="Add Profile" ToolTip="Add Profile" meta:resourcekey="cmdAddProfile" />
    <asp:ImageButton runat="server" ID="cmdFilter" ImageUrl="~/images/icons/options_16x16.gif" AlternateText="Options" ToolTip="Options" meta:resourcekey="cmdFilter" />
</SalesLogix:SmartPartToolsContainer>
<div runat="server" id="placeholder">
</div>