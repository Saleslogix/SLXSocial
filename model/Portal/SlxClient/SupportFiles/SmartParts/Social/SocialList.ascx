<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SocialList.ascx.cs" Inherits="SmartParts_Social_WebUserControl" %>

<style type="text/css">
.ext-ie TD input.x-form-combo
{
	top: 1px;
}
.social-menu h3
{
	margin: 0;
	background: #999999; /*#1C4187*/;
	color: #ffffff;
	padding: 3px;
	border: solid 1px #ffffff;
	border-style: inset;
}
.social-list .x-grid3-row *
{
    line-height: 2em;
    font-size: 1.0em;
}
.social-list .x-grid3-col-0
{
	text-align: left;
}
.social-list .x-grid3-col-0 img
{
	width: 48px;
	height: 48px;
}
.social-list .x-grid3-col-0 a
{
	text-decoration: none;
}
.social-list .x-grid3-col-0 span
{
    margin: 0 0 0 .5em;
}
.social-list .x-grid3-hd-id
{
    text-align: center;
    font-size:1.2em;
}
.social-list .x-grid3-hd-1 
{
    font-size: 1.2em;
}
.social-panel .s-row
{
    padding: 8px 8px;	
    border-bottom: dashed 1px #cccccc;
}
.social-panel .s-row:hover
{
	background: #f9f9f9;
}
.social-panel .s-row-last
{	
    border-bottom: none 0px #cccccc;
}
.social-panel .s-row p
{
	margin: 0 0 4px 56px;
}
.social-panel .s-row img
{
	width: 48px;
	height: 48px;
	float: left;
}
.social-panel .s-row .s-info
{
	margin: 0 0 0 56px;
	font-style: italic;
	color: #999999;	
}
.social-panel .s-row .s-clear
{
	clear: both;
}
.social-panel .s-tool-config
{
	background: url('images/icons/options_16x16.gif') no-repeat;
}
</style>

<script type="text/javascript">


$(function() {
    
    var social = new Sage.SalesLogix.Controls.SocialPanel({
        id: 'social_list',
        stateful: true,
        stateEvents: ['filterschanged'],
        filters: [
            {id: 0, text: 'SalesLogix', params: {q: 'saleslogix'}},
            {id: 1, text: 'Insights 2009', params: {q: '#sageinsights09 OR @sageinsights'}}
        ],
        activeFilter: 0
    });
    
    var panel = mainViewport.findById('center_panel_center');

    $(panel.getEl().dom)
        .find(".x-panel-body")
            .children()
            .hide();
    
    panel.add(social);
    panel.doLayout();       
});


</script>
