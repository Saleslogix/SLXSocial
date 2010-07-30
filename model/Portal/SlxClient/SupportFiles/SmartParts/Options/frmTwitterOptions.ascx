<%@ Control Language="C#" AutoEventWireup="true" CodeFile="frmTwitterOptions.ascx.cs" Inherits="SmartParts_Options_frmTwitterOptions" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<div style="display:none">
<asp:Panel ID="LitRequest_RTools" runat="server" meta:resourcekey="LitRequest_RToolsResource1">
   <asp:ImageButton runat="server" ID="btnSave"  ToolTip="Save" 
        ImageUrl="~/images/icons/Save_16x16.gif" meta:resourcekey="btnSaveResource1" 
        onclick="btnSave_Click" />
</asp:Panel>
</div>

<style type="text/css">
    .style1
    {
        width: 100%;
    }
</style>
<table border="0" cellpadding="1" cellspacing="0" class="formtable" style="margin-top:0px;">
<col width="50%" /><col width="50%" />
    <tr>
        <td>
        <span class="lbl"><asp:Label ID="Label1" runat="server" Text="User Name"></asp:Label></span>
        </td>
        <td>
        <span class="textcontrol"><asp:TextBox ID="txtUserName" runat="server"></asp:TextBox></span>
        </td>
    </tr>
    <tr>
        <td>
        <span class="lbl"><asp:Label ID="lblPassword"  runat="server" Text="Password"></asp:Label></span>
        </td>
        <td>
        <span class="textcontrol"><asp:TextBox ID="txtPassword" runat="server" TextMode="Password"></asp:TextBox></span>
        </td>
    </tr>
    <tr>
        <td>
        <span class="lbl"><asp:Label ID="Label3" runat="server" Text="My Twitter Id"></asp:Label></span>
        </td>
        <td>
        <span class="textcontrol"><asp:TextBox ID="txtMyTwitterId" runat="server"></asp:TextBox></span>
        </td>
    </tr>
    <tr>
        <td>
        <span class="lbl"><asp:Label ID="Label2" runat="server" Text="Dashboard Default"></asp:Label></span>
        </td>
        <td>
        <span class="textcontrol">
            <asp:DropDownList ID="dlViews" runat="server">
               <asp:ListItem Text="My Direct Messages" Value="My Direct Messages"></asp:ListItem>
               <asp:ListItem Text="My Timeline" Value="My Timeline"></asp:ListItem>
               <asp:ListItem Text="Following" Value="Following"></asp:ListItem>
               <asp:ListItem Text="Following Me" Value="Following Me"></asp:ListItem>
            </asp:DropDownList>
        </span>
        </td>
    </tr>
</table>


