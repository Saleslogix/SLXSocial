<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SocialUpdates.ascx.cs" Inherits="SmartParts_Social_SocialUpdates" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<SalesLogix:SmartPartToolsContainer runat="server" ID="tools" ToolbarLocation="right">
    <asp:ImageButton runat="server" ID="cmdFilter" ImageUrl="~/images/icons/Filter_16x16.png" AlternateText="Filter" />
</SalesLogix:SmartPartToolsContainer>
<div runat="server" id="placeholder">
</div>