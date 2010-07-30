<%@ Control Language="C#" AutoEventWireup="true" CodeFile="Twitter.ascx.cs" Inherits="SmartParts_TaskPane_CommonTasks_Twitter" %>

<script type="text/javascript">

    function TwitterDDChange()
    {
    //alert("Hello");
        var str = $("#<%=txtTwitterId.ClientID %>").val();
        var val = $("#<%=ddlTwitterIds.ClientID %>").val();
        
        if(str == "")
        {
            if(val != "noid")
            {
                $("#<%=ddlTwitterIds.ClientID %>").attr('disabled', false);
                $("#<%=chkRecordMsg.ClientID %>").attr('disabled', false);
            }
        }
        else
        {
            $("#<%=ddlTwitterIds.ClientID %>").attr('disabled', true);
            $("#<%=chkRecordMsg.ClientID %>").attr('disabled', true).attr('checked',false);
        }
    }


</script>


<div>
    <asp:UpdatePanel ID="TwitterPanel" runat="server" UpdateMode="Conditional">
        <ContentTemplate>
            <div>
                <asp:Label ID="Label1" runat="server" Text="Direct msg to:"></asp:Label>
            </div>
            <div style="padding-top:5px;">
                <asp:DropDownList ID="ddlTwitterIds" runat="server" Width="200px">
                </asp:DropDownList>
            </div>
            <div style="padding-top:5px;">
                <asp:Label ID="Label3" runat="server" Text="or free type direct msg to:"></asp:Label>
            </div>
            <div style="padding-top:5px;">
            <asp:TextBox ID="txtTwitterId" runat="server" Width="200px" EnableViewState="False"></asp:TextBox>
            </div>
            <div style="padding-top:5px;">
                <asp:CheckBox ID="chkRecordMsg" runat="server" Text="Record in history" 
                    EnableViewState="False" />
            </div>
            <div style="padding-top:5px;">
                <asp:TextBox ID="txtDirectMessage" runat="server" Height="65px" 
                    TextMode="MultiLine" Width="200px"></asp:TextBox>
            </div>
            <div style="padding-top:5px;">
                <asp:Button ID="cmdDirectMessage" runat="server" Text="Send Direct Msg" 
                    CssClass="slxbutton" onclick="cmdDirectMessage_Click" />
            </div>
            <div style="padding-top:5px;"
                <asp:Label ID="Label2" runat="server" Text="Change your status to:"></asp:Label>
            </div>
            <div style="padding-top:5px;">
                <asp:TextBox ID="txtStatus" runat="server" Width="200px" Height="65px" 
                    TextMode="MultiLine"></asp:TextBox>
            </div>
            <div style="padding-top:5px;">
                <asp:Button ID="cmdUpdateStatus" runat="server" Text="Update Status" 
                    CssClass="slxbutton" onclick="cmdUpdateStatus_Click" />
            </div>
            
        </ContentTemplate>
    </asp:UpdatePanel>

</div>