<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SocialTimeline.ascx.cs" Inherits="SmartParts_Social_SocialTimeline" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<SalesLogix:SmartPartToolsContainer runat="server" ID="tools" ToolbarLocation="right">
    <asp:ImageButton runat="server" ID="cmdFilter" ImageUrl="~/images/icons/Filter_16x16.png" AlternateText="Filter" />
</SalesLogix:SmartPartToolsContainer>
<div id="placeholder" runat="server" style="width: 100%; height: 350px">    
</div>
