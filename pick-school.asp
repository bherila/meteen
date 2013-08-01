<%@LANGUAGE="VBSCRIPT" CODEPAGE="1252"%>
<%
Dim schools__x
schools__x = "NAXX"
If (Request("state")  <> "") Then 
  schools__x = Request("state") 
End If
%>
<%
Dim schools
Dim schools_numRows

Set schools = Server.CreateObject("ADODB.Recordset")
schools.ActiveConnection = "dsn=bombness-mysql;uid=root;pwd=eggbert;"
schools.Source = "SELECT *  FROM schools  WHERE name like '" + Replace(schools__x, "'", "''") + "%' order by name asc"
schools.CursorType = 0
schools.CursorLocation = 2
schools.LockType = 1
schools.Open()

schools_numRows = 0
%>
<%
Dim Repeat1__numRows
Dim Repeat1__index

Repeat1__numRows = 10
Repeat1__index = 0
schools_numRows = schools_numRows + Repeat1__numRows
%>
<%
'  *** Recordset Stats, Move To Record, and Go To Record: declare stats variables

Dim schools_total
Dim schools_first
Dim schools_last

' set the record count
schools_total = schools.RecordCount

' set the number of rows displayed on this page
If (schools_numRows < 0) Then
  schools_numRows = schools_total
Elseif (schools_numRows = 0) Then
  schools_numRows = 1
End If

' set the first and last displayed record
schools_first = 1
schools_last  = schools_first + schools_numRows - 1

' if we have the correct record count, check the other stats
If (schools_total <> -1) Then
  If (schools_first > schools_total) Then
    schools_first = schools_total
  End If
  If (schools_last > schools_total) Then
    schools_last = schools_total
  End If
  If (schools_numRows > schools_total) Then
    schools_numRows = schools_total
  End If
End If
%>
<%
Dim MM_paramName 
%>
<%
' *** Move To Record and Go To Record: declare variables

Dim MM_rs
Dim MM_rsCount
Dim MM_size
Dim MM_uniqueCol
Dim MM_offset
Dim MM_atTotal
Dim MM_paramIsDefined

Dim MM_param
Dim MM_index

Set MM_rs    = schools
MM_rsCount   = schools_total
MM_size      = schools_numRows
MM_uniqueCol = ""
MM_paramName = ""
MM_offset = 0
MM_atTotal = false
MM_paramIsDefined = false
If (MM_paramName <> "") Then
  MM_paramIsDefined = (Request.QueryString(MM_paramName) <> "")
End If
%>
<%
' *** Move To Record: handle 'index' or 'offset' parameter

if (Not MM_paramIsDefined And MM_rsCount <> 0) then

  ' use index parameter if defined, otherwise use offset parameter
  MM_param = Request.QueryString("index")
  If (MM_param = "") Then
    MM_param = Request.QueryString("offset")
  End If
  If (MM_param <> "") Then
    MM_offset = Int(MM_param)
  End If

  ' if we have a record count, check if we are past the end of the recordset
  If (MM_rsCount <> -1) Then
    If (MM_offset >= MM_rsCount Or MM_offset = -1) Then  ' past end or move last
      If ((MM_rsCount Mod MM_size) > 0) Then         ' last page not a full repeat region
        MM_offset = MM_rsCount - (MM_rsCount Mod MM_size)
      Else
        MM_offset = MM_rsCount - MM_size
      End If
    End If
  End If

  ' move the cursor to the selected record
  MM_index = 0
  While ((Not MM_rs.EOF) And (MM_index < MM_offset Or MM_offset = -1))
    MM_rs.MoveNext
    MM_index = MM_index + 1
  Wend
  If (MM_rs.EOF) Then 
    MM_offset = MM_index  ' set MM_offset to the last possible record
  End If

End If
%>
<%
' *** Move To Record: if we dont know the record count, check the display range

If (MM_rsCount = -1) Then

  ' walk to the end of the display range for this page
  MM_index = MM_offset
  While (Not MM_rs.EOF And (MM_size < 0 Or MM_index < MM_offset + MM_size))
    MM_rs.MoveNext
    MM_index = MM_index + 1
  Wend

  ' if we walked off the end of the recordset, set MM_rsCount and MM_size
  If (MM_rs.EOF) Then
    MM_rsCount = MM_index
    If (MM_size < 0 Or MM_size > MM_rsCount) Then
      MM_size = MM_rsCount
    End If
  End If

  ' if we walked off the end, set the offset based on page size
  If (MM_rs.EOF And Not MM_paramIsDefined) Then
    If (MM_offset > MM_rsCount - MM_size Or MM_offset = -1) Then
      If ((MM_rsCount Mod MM_size) > 0) Then
        MM_offset = MM_rsCount - (MM_rsCount Mod MM_size)
      Else
        MM_offset = MM_rsCount - MM_size
      End If
    End If
  End If

  ' reset the cursor to the beginning
  If (MM_rs.CursorType > 0) Then
    MM_rs.MoveFirst
  Else
    MM_rs.Requery
  End If

  ' move the cursor to the selected record
  MM_index = 0
  While (Not MM_rs.EOF And MM_index < MM_offset)
    MM_rs.MoveNext
    MM_index = MM_index + 1
  Wend
End If
%>
<%
' *** Move To Record: update recordset stats

' set the first and last displayed record
schools_first = MM_offset + 1
schools_last  = MM_offset + MM_size

If (MM_rsCount <> -1) Then
  If (schools_first > MM_rsCount) Then
    schools_first = MM_rsCount
  End If
  If (schools_last > MM_rsCount) Then
    schools_last = MM_rsCount
  End If
End If

' set the boolean used by hide region to check if we are on the last record
MM_atTotal = (MM_rsCount <> -1 And MM_offset + MM_size >= MM_rsCount)
%>
<%
' *** Go To Record and Move To Record: create strings for maintaining URL and Form parameters

Dim MM_keepNone
Dim MM_keepURL
Dim MM_keepForm
Dim MM_keepBoth

Dim MM_removeList
Dim MM_item
Dim MM_nextItem

' create the list of parameters which should not be maintained
MM_removeList = "&index="
If (MM_paramName <> "") Then
  MM_removeList = MM_removeList & "&" & MM_paramName & "="
End If

MM_keepURL=""
MM_keepForm=""
MM_keepBoth=""
MM_keepNone=""

' add the URL parameters to the MM_keepURL string
For Each MM_item In Request.QueryString
  MM_nextItem = "&" & MM_item & "="
  If (InStr(1,MM_removeList,MM_nextItem,1) = 0) Then
    MM_keepURL = MM_keepURL & MM_nextItem & Server.URLencode(Request.QueryString(MM_item))
  End If
Next

' add the Form variables to the MM_keepForm string
For Each MM_item In Request.Form
  MM_nextItem = "&" & MM_item & "="
  If (InStr(1,MM_removeList,MM_nextItem,1) = 0) Then
    MM_keepForm = MM_keepForm & MM_nextItem & Server.URLencode(Request.Form(MM_item))
  End If
Next

' create the Form + URL string and remove the intial '&' from each of the strings
MM_keepBoth = MM_keepURL & MM_keepForm
If (MM_keepBoth <> "") Then 
  MM_keepBoth = Right(MM_keepBoth, Len(MM_keepBoth) - 1)
End If
If (MM_keepURL <> "")  Then
  MM_keepURL  = Right(MM_keepURL, Len(MM_keepURL) - 1)
End If
If (MM_keepForm <> "") Then
  MM_keepForm = Right(MM_keepForm, Len(MM_keepForm) - 1)
End If

' a utility function used for adding additional parameters to these strings
Function MM_joinChar(firstItem)
  If (firstItem <> "") Then
    MM_joinChar = "&"
  Else
    MM_joinChar = ""
  End If
End Function
%>
<%
' *** Move To Record: set the strings for the first, last, next, and previous links

Dim MM_keepMove
Dim MM_moveParam
Dim MM_moveFirst
Dim MM_moveLast
Dim MM_moveNext
Dim MM_movePrev

Dim MM_urlStr
Dim MM_paramList
Dim MM_paramIndex
Dim MM_nextParam

MM_keepMove = MM_keepBoth
MM_moveParam = "index"

' if the page has a repeated region, remove 'offset' from the maintained parameters
If (MM_size > 1) Then
  MM_moveParam = "offset"
  If (MM_keepMove <> "") Then
    MM_paramList = Split(MM_keepMove, "&")
    MM_keepMove = ""
    For MM_paramIndex = 0 To UBound(MM_paramList)
      MM_nextParam = Left(MM_paramList(MM_paramIndex), InStr(MM_paramList(MM_paramIndex),"=") - 1)
      If (StrComp(MM_nextParam,MM_moveParam,1) <> 0) Then
        MM_keepMove = MM_keepMove & "&" & MM_paramList(MM_paramIndex)
      End If
    Next
    If (MM_keepMove <> "") Then
      MM_keepMove = Right(MM_keepMove, Len(MM_keepMove) - 1)
    End If
  End If
End If

' set the strings for the move to links
If (MM_keepMove <> "") Then 
  MM_keepMove = Server.HTMLEncode(MM_keepMove) & "&"
End If

MM_urlStr = Request.ServerVariables("URL") & "?" & MM_keepMove & MM_moveParam & "="

MM_moveFirst = MM_urlStr & "0"
MM_moveLast  = MM_urlStr & "-1"
MM_moveNext  = MM_urlStr & CStr(MM_offset + MM_size)
If (MM_offset - MM_size < 0) Then
  MM_movePrev = MM_urlStr & "0"
Else
  MM_movePrev = MM_urlStr & CStr(MM_offset - MM_size)
End If
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>Select School</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<style type="text/css">
<!--
body,td,th {
	font-family: Arial, Helvetica, sans-serif;
	font-size: 10pt;
	color: #000000;
}
body {
	background-color: #FFFFE9;
	margin-left: 15px;
	margin-top: 15px;
	margin-right: 15px;
	margin-bottom: 15px;
}
-->
</style>

<script language="javascript">

function sel(id, name)
{
window.opener.document.getElementById('selSchool').innerHTML = name;
window.opener.document.getElementById('school').value = name;
window.opener.document.getElementById('schoolID').value = id;
self.close();
}

</script>

</head>

<body>
 <form action="" method="get" name="frmStates" id="frmStates">
<table width="100%"  border="0" cellspacing="0" cellpadding="0" ID="Table1">
  <tr>
    <td>Enter the name or first few letters of the school you are looking for:<br>
      <input name="state" type="text" id="state" maxlength="50">
      <input type="submit" name="Submit" value="Go" ID="Submit1"></td>
    <td align="right" valign="middle"><input name="sn" type="button" id="sn" value="Select None" onClick="sel('-1', '<font color=\'#587B51\'>None Selected</font>');"></td>
  </tr>
</table>
 </form>
  <table width="100%"  border="0" cellspacing="0" cellpadding="0" ID="Table2">
    <% 
While ((Repeat1__numRows <> 0) AND (NOT schools.EOF)) 
%>
    <tr>
        <td width="230" nowrap><a href="javascript:sel(<%=(schools.Fields.Item("id").Value)%>, '<%=Replace(schools.Fields.Item("name").Value, "'", "\'")%>');"><%=(schools.Fields.Item("name").Value)%></a></td>
        <td nowrap><%=(schools.Fields.Item("city").Value)%>, <%=(schools.Fields.Item("state").Value)%></td>
    </tr>
    <% 
  Repeat1__index=Repeat1__index+1
  Repeat1__numRows=Repeat1__numRows-1
  schools.MoveNext()
Wend
%>    <tr>
      <td colspan="2">&nbsp;
        <table border="0" width="100%" align="center" ID="Table3">
          <tr>
            <td width="31%" align="left">
              <% If MM_offset <> 0 Then %>
              <a href="<%=MM_movePrev%>"><img src="Previous.gif" border=0> Previous Page </a>
              <% End If ' end MM_offset <> 0 %>
            </td>
            <td width="23%" align="right">
              <% If Not MM_atTotal Then %>
              <a href="<%=MM_moveNext%>"> Next Page <img src="Next.gif" border=0></a>
              <% End If ' end Not MM_atTotal %>
            </td>
          </tr>
        </table></td>
    </tr>

  </table>
</body>
</html>
<%
schools.Close()
Set schools = Nothing
%>
