<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SocialMedia.ascx.cs" Inherits="SmartParts_Options_SocialMedia" %>
 <table>
  <tr>
    <td class="highlightedCell" style="border:solid 1px darkgray; text-align:center" colspan="2">
        <img src="images/icons/Linked-In-24x24.png" 
            style="width: 24px; height: 24px" align="left" /><asp:Label ID="Label4" runat="server" Text="LinkedIn"></asp:Label>
    </td>
 </tr>
  <tr>
    <td>
        <asp:Label ID="Label5" runat="server" Text="User Name:"></asp:Label>
        
    </td>
    <td>
        <asp:TextBox ID="txtLinkedInUsername" runat="server"></asp:TextBox>
    </td>
 </tr>
  <tr>
    <td>
        <asp:Label ID="Label6" runat="server" Text="Password:"></asp:Label>
    </td>
    <td>
        <asp:TextBox ID="txtLinkedInPassword" runat="server" TextMode="Password"></asp:TextBox>
    </td>
 </tr>
  <tr>
    <td colspan="2">
        <asp:Button ID="cmdLinkedInSave" runat="server" CssClass="slxbutton" 
            Text="LinkedIn Save" onclick="cmdLinkedInSave_Click" />
    </td>
 </tr>
 
 <tr><td><div>&nbsp;</div></td><td><div>&nbsp;</div></td></tr>
  <tr>
    <td class="highlightedCell" style="border:solid 1px darkgray;" colspan="2" 
          align="center">
        <img align="left" src="images/icons/FaceBook-24x24.png" 
            style="width: 24px; height: 24px" /><asp:Label ID="Label7" runat="server" Text="FaceBook"></asp:Label>
    </td>
 </tr>
  <tr>
    <td>
        <asp:Label ID="Label8" runat="server" Text="User Name:"></asp:Label>
    </td>
    <td>
        <asp:TextBox ID="txtFaceBookUserName" runat="server"></asp:TextBox>
    </td>
 </tr>
  <tr>
    <td>
        <asp:Label ID="Label9" runat="server" Text="Password:"></asp:Label>
    </td>
    <td>
        <asp:TextBox ID="txtFaceBookPassword" runat="server" TextMode="Password"></asp:TextBox>
    </td>
 </tr>
  <tr>
    <td colspan="2">
        <asp:Button ID="cmdFaceBookSave" runat="server" CssClass="slxbutton" 
            Text="FaceBook Save" onclick="cmdFaceBookSave_Click" />
    </td>
 </tr>
 
 </table>   

