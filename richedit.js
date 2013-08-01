/*
 +-------------------------------------------------------------------+
 |                 J S - R I C H E D I T   (v1.1)                    |
 |                                                                   |
 | Copyright Gerd Tentler               www.gerd-tentler.de/tools    |
 | Created: Jun. 2, 2003                Last modified: Sep. 27, 2005 |
 +-------------------------------------------------------------------+
 | This program may be used and hosted free of charge by anyone for  |
 | personal purpose as long as this copyright notice remains intact. |
 |                                                                   |
 | Obtain permission before selling the code for this program or     |
 | hosting this software on a commercial website or redistributing   |
 | this software over the Internet or in any other medium. In all    |
 | cases copyright must remain intact.                               |
 +-------------------------------------------------------------------+

===========================================================================================================
 This script was tested with the following systems and browsers:

 - Windows XP: Internet Explorer 6, Netscape Navigator 7, Opera 7, Firefox 1
 - Mac OS X:   Internet Explorer 5, Safari 1

 If you use another browser or system, this script may not work for you - sorry.

 Generally, richtext editing should work on Windows with Internet Explorer 4+ and with browsers using the
 Mozilla 1.3+ engine, i.e. all browsers that support "designMode".

 NOTE: The following browsers have been tested and do NOT support richtext editing: NN 7.0 and Opera 7.0
 on Windows, IE 5.2 and Safari 1.0 on Mac OS. However, the script works with them, too - a simple text-area
 will replace the richtext editor.
===========================================================================================================
*/

var OP = (navigator.userAgent.indexOf('Opera') != -1) ? true : false;
var IE = (navigator.userAgent.indexOf('MSIE') != -1 && !OP) ? true : false;
var GK = (navigator.userAgent.indexOf('Gecko') != -1) ? true : false;
var DM = (document.designMode && document.execCommand) ? true : false;

var rto = new Array();
var mouseX, mouseY;

//---------------------------------------------------------------------------------------------------------
// Language settings
//---------------------------------------------------------------------------------------------------------
  var txtParagraph       = "Paragraph";
  var txtNormal          = "Normal";
  var txtHeading         = "Heading";
  var txtClearFormatting = "Clear Formatting";
  var txtJustifyLeft     = "Justify Left";
  var txtJustifyCenter   = "Justify Center";
  var txtJustifyRight    = "Justify Right";
  var txtOrderedList     = "Ordered List";
  var txtUnorderedList   = "Unordered List";
  var txtInsertTable     = "Insert Table";
  var txtInsertGraph     = "Insert Graph";
  var txtInsertBullet    = "Insert Bullet-Point";
  var txtInsertImage     = "Insert Image";
  var txtInsertText      = "Insert text here";
  var txtFont            = "Font";
  var txtSize            = "Size";
  var txtBold            = "Bold";
  var txtItalic          = "Italic";
  var txtUnderline       = "Underline";
  var txtFontColor       = "Font Color";
  var txtBGColor         = "Background Color";
  var txtHyperlink       = "Hyperlink";
  var txtCut             = "Cut";
  var txtCopy            = "Copy";
  var txtPaste           = "Paste";
  var txtUndo            = "Undo";
  var txtRedo            = "Redo";
  var txtBorder          = "Border";
  var txtBorderColor     = "Border Color";
  var txtCellColor       = "Cell Color";
  var txtCellSpacing     = "Cell Spacing";
  var txtCellPadding     = "Cell Padding";
  var txtColumns         = "Columns";
  var txtRows            = "Rows";
  var txtCreate          = "Create";
  var txtCancel          = "Cancel";
  var txtValues          = "Values";
  var txtLabels          = "Labels";
  var txtBarColor        = "Bar Color";
  var txtLabelColor      = "Label Color";
  var txtViewValues      = "View Values";
  var txtLegend          = "Legend";

function EDITOR() {
//---------------------------------------------------------------------------------------------------------
// Configuration
//---------------------------------------------------------------------------------------------------------
  this.editorBGColor = "buttonface";            // editor background color
  this.editorBorder = "2px groove";             // editor border (CSS-spec: "size style color")

  this.textWidth = "100%";                         // text field width (pixels)
  this.textHeight = 250;                        // text field height (pixels)
  this.textBGColor = "white";                   // text field background color
  this.textBorder = "2px inset";                // text field border (CSS-spec: "size style color")
  this.textFont = "Verdana, Arial, Helvetica";  // text field font family (CSS-spec)
  this.textFontSize = 12;                       // text field font size (pixels)

  this.setFocus = false;                        // focus text field on load (true or false)
  this.fieldName = "richEdit";                  // default field name

//---------------------------------------------------------------------------------------------------------
// Functions
//---------------------------------------------------------------------------------------------------------
  this.bulletpoint = 'bp.gif';
  this.editor = 0;
  this.id = 0;
  this.actSelection = 0;
  this.field = '';

  this.getEditor = function() {
    var e = false;
    if(GK) e = document.getElementById('idEdit' + this.id).contentWindow;
    else if(IE) e = document.frames('idEdit' + this.id);
    if(e && !DM) e = false;
    return e;
  }

  this.getObj = function(id) {
    var obj = false;
    if(document.getElementById) obj = document.getElementById(id);
    else if(document.all) obj = document.all[id];
    return obj;
  }

  this.wordWrap = function(string, col, prefix) {
    if(col == null) col = 100;
    if(prefix == null) prefix = '';
    var text = line = newline = word = '';
    var row = col - prefix.length;
    var i, j, cnt;
    var words = new Array();
    var lines = new Array();
    lines = string.split('\n');

    if(row > 0) {
      for(i = 0; i < lines.length; i++) {
        line = lines[i];

        if(line.length > row) {
          newline = '';
          words = line.split(' ');

          for(j = 0; j < words.length; j++) {
            word = words[j];

            if(word.length > row) {
              if(newline) {
                text += prefix + newline + '\n';
                newline = '';
              }
              text += prefix + word + '\n';
            }
            else if(newline.length + word.length > row) {
              newline.replace(/ +$/, '');
              text += prefix + newline + '\n';
              newline = word + ' ';
            }
            else newline += word + ' ';
          }
          newline.replace(/ +$/, '');
          text += prefix + newline + '\n';
        }
        else {
          line.replace(/ +$/, '');
          text += prefix + line + '\n';
        }
      }
    }
    return text.replace(/\n$/, '');
  }

  this.initEditor = function(content) {
    if(this.editor = this.getEditor()) {
      var html = '<html><head><style> ' +
                 'BODY { ' +
                 'margin: 4px; ' +
                 'background-color: ' + this.textBGColor + '; ' +
                 '} ' +
                 'BODY, TD, TH { ' +
                 'color: black; ' +
                 'font-family: ' + this.textFont + '; ' +
                 'font-size: ' + this.textFontSize + 'px; ' +
                 '} ' +
                 'TD { border: 1px dashed silver; } ' +
                 '</style></head>' +
                 '<body>' + content + '</body></html>';
      this.editor.document.designMode = 'on';
      if(GK) this.editor.document.execCommand('useCSS', false, false);
      this.editor.document.open();
      this.editor.document.write(this.wordWrap(html));
      this.editor.document.close();
      if(this.setFocus) this.editor.focus();

      for(var i = document.forms.length - 1; i > 0 && !this.field; i--) {
        if(document.forms[i].elements[this.fieldName + this.id]) {
          this.field = document.forms[i].elements[this.fieldName + this.id];
        }
      }
    }
    else alert("Sorry, your browser does not support richtext editing!");
  }

  this.pickColor = function(color, mode) {
    var obj = this.getObj('dlg' + mode);
    if(obj) obj.style.visibility = 'hidden';
    if(mode == 'FontColor') this.fnExec('foreColor', color);
    else this.fnExec((GK ? 'hiliteColor' : 'backColor'), color);
  }

  this.changeColor = function(mode) {
    document.forms['f' + mode].id.value = this.id;
    this.viewDialog(mode);
  }

  this.viewDialog = function(mode) {
    var obj = this.getObj('dlg' + mode);
    if(obj) {
      if(obj.style.visibility == 'visible') obj.style.visibility = 'hidden';
      else {
        var obj2 = this.getObj('dlgBGColor');
        obj2.style.visibility = 'hidden';
        obj2 = this.getObj('dlgFontColor');
        obj2.style.visibility = 'hidden';
        obj2 = this.getObj('dlgImage');
        obj2.style.visibility = 'hidden';
        obj2 = this.getObj('dlgTable');
        obj2.style.visibility = 'hidden';
        obj2 = this.getObj('dlgGraph');
        obj2.style.visibility = 'hidden';

        obj.style.left = (mouseX - 64) + 'px';
        obj.style.top = (mouseY + 16) + 'px';
        obj.style.visibility = 'visible';
      }
    }
  }

  this.pasteSel = function(content) {
    if(IE) {
      this.editor.focus();
      if(!this.actSelection) this.actSelection = this.editor.document.selection.createRange();
      this.actSelection.pasteHTML(content);
      this.actSelection = 0;
    }
    else this.fnExec('insertHTML', content);
  }

  this.fnExec = function(command, option) {
    if(this.editor) {
      this.editor.focus();
      if(option == 'removeFormat') {
        command = option;
        option = null;
      }
      try {
        this.editor.document.execCommand(command, false, option);
      }
      catch(e) {
        alert(command + ": not supported");
      }
    }
  }

  this.insertLink = function() {
    if(IE) this.fnExec('createLink');
    else {
      var url = prompt('URL:', 'http://');
      if(url && url != 'http://') this.fnExec('createLink', url);
    }
  }

  this.insertImage = function() {
    if(IE) {
      this.editor.focus();
      this.actSelection = this.editor.document.selection.createRange();
    }
    document.fImage.id.value = this.id;
    this.viewDialog('Image');
  }

  this.insertBullet = function() {
    var html = '<table cellspacing=0 cellpadding=0><tr><td valign=top><img src="' + this.bulletpoint + '"></td><td>' + txtInsertText + '</td></tr></table>';
    this.pasteSel(html);
  }

  this.insertTable = function() {
    if(IE) {
      this.editor.focus();
      this.actSelection = this.editor.document.selection.createRange();
    }
    document.fTable.id.value = this.id;
    this.viewDialog('Table');
  }

  this.insertGraph = function() {
    if(IE) {
      this.editor.focus();
      this.actSelection = this.editor.document.selection.createRange();
    }
    document.fGraph.id.value = this.id;
    this.viewDialog('Graph');
  }

  this.createImage = function() {
    var obj = this.getObj('dlgImage');
    if(obj) obj.style.visibility = 'hidden';
    var f = document.fImage;
    if(f.URL.value && f.URL.value != 'http://') this.fnExec('insertImage', f.URL.value);
  }

  this.createTable = function() {
    var obj = this.getObj('dlgTable');
    if(obj) obj.style.visibility = 'hidden';
    var f = document.fTable;
    if(f.Cols.value && f.Rows.value) {
      var border = f.Border.options[f.Border.selectedIndex].value;
      var html = '<table border=' + border;
      if(f.Spacing.value) html += ' cellspacing=' + f.Spacing.value;
      if(f.Padding.value) html += ' cellpadding=' + f.Padding.value;
      if(f.BorderColor.value && border > 0) html += ' bordercolor=' + f.BorderColor.value;
      html += '>';

      for(var i = j = 0; i < f.Rows.value; i++) {
        html += '<tr' + (f.CellColor.value ? ' bgcolor=' + f.CellColor.value : '') + '>';
        for(j = 0; j < f.Cols.value; j++) html += '<td>' + txtInsertText + '</td>';
        html += '</tr>';
      }
      html += '</table>';
      this.pasteSel(html);
    }
  }

  this.createGraph = function() {
    var obj = this.getObj('dlgGraph');
    if(obj) obj.style.visibility = 'hidden';
    var f = document.fGraph;
    if(f.Values.value) {
      var html = this.barGraph(f.Values.value, f.Labels.value, f.BarColor.value, f.LabelColor.value,
                               f.ViewValues.options[f.ViewValues.selectedIndex].value, f.Legend.value);
      this.pasteSel(html);
    }
  }

  this.store = function() {
    if(this.field) this.field.value = this.editor.document.body.innerHTML;
  }

  this.buildEditor = function() {
    document.writeln('<style> ' +
                     '.cssEditor' + this.id + ' { ' +
                     'position: relative; ' +
                     'background-color: ' + this.editorBGColor + '; ' +
                     'width: ' + (this.textWidth) + '; ' +
                     'height: ' + (this.textHeight + 60) + 'px; ' +
                     'margin: 0px; ' +
                     'padding: 4px; ' +
                     'border: ' + this.editorBorder + '; ' +
                     'text-align: left; ' +
                     '} ' +
                     '.cssIFrame' + this.id + ' { ' +
                     'margin: 0px; ' +
                     'padding: 0px; ' +
                     'width: ' + this.textWidth + '; ' +
                     'height: ' + this.textHeight + 'px; ' +
                     'border: ' + this.textBorder + '; ' +
                     '} ' +
                     '.cssBtnBar' + this.id + ' { ' +
                     'background-color: ' + this.editorBGColor + '; ' +
                     'border: 1px solid ' + this.editorBGColor + '; ' +
                     'padding: 2px; ' +
                     '} ' +
                     '.cssRaised' + this.id + ' { ' +
                     'border-top: 1px solid buttonhighlight; ' +
                     'border-left: 1px solid buttonhighlight; ' +
                     'border-bottom: 1px solid buttonshadow; ' +
                     'border-right: 1px solid buttonshadow; ' +
                     'background-color: ' + this.editorBGColor + '; ' +
                     'padding: 2px; ' +
                     '} ' +
                     '.cssPressed' + this.id + ' { ' +
                     'border-top: 1px solid buttonshadow; ' +
                     'border-left: 1px solid buttonshadow; ' +
                     'border-bottom: 1px solid buttonhighlight; ' +
                     'border-right: 1px solid buttonhighlight; ' +
                     'background-color: ' + this.editorBGColor + '; ' +
                     'padding-left: 3px; ' +
                     'padding-top: 3px; ' +
                     'padding-bottom: 1px; ' +
                     'padding-right: 1px; ' +
                     '} ' +
                     '</style>');

    document.writeln('<input type=hidden name="' + this.fieldName + this.id + '" value="">');

    document.writeln('<div class="cssEditor' + this.id + '">');

    document.writeln('<table border=0 cellspacing=2 cellpadding=0><tr align=center>' +
                     '<td><select style="font:menu" onChange="rto[' + this.id + '].fnExec(\'formatBlock\', this[this.selectedIndex].value); this.selectedIndex=0">' +
                     '<option style="background-color:' + this.editorBGColor + '">' + txtParagraph + ':' +
                     '<option value="<P>">' + txtNormal + ' &lt;P&gt;' +
                     '<option value="<H1>">' + txtHeading + ' 1 &lt;H1&gt;' +
                     '<option value="<H2>">' + txtHeading + ' 2 &lt;H2&gt;' +
                     '<option value="<H3>">' + txtHeading + ' 3 &lt;H3&gt;' +
                     '<option value="<H4>">' + txtHeading + ' 4 &lt;H4&gt;' +
                     '<option value="<H5>">' + txtHeading + ' 5 &lt;H5&gt;' +
                     '<option value="<H6>">' + txtHeading + ' 6 &lt;H6&gt;' +
                     '<option value="removeFormat">' + txtClearFormatting +
                     '</select></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'justifyLeft\')"><img src="icons/justify_left.gif" width=16 height=16 alt="' + txtJustifyLeft + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'justifyCenter\')"><img src="icons/justify_center.gif" width=16 height=16 alt="' + txtJustifyCenter + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'justifyRight\')"><img src="icons/justify_right.gif" width=16 height=16 alt="' + txtJustifyRight + '"></td>');
    document.writeln('<td><div style="width:1px; height:15px; border:1px inset"></div></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'insertOrderedList\')"><img src="icons/ol.gif" width=16 height=16 alt="' + txtOrderedList + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'insertUnorderedList\')"><img src="icons/ul.gif" width=16 height=16 alt="' + txtUnorderedList + '"></td>');
    document.writeln('<td><div style="width:1px; height:15px; border:1px inset"></div></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].insertBullet()"><img src="icons/bulletpoint.gif" width=16 height=16 alt="' + txtInsertBullet + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].insertImage()"><img src="icons/image.gif" width=16 height=16 alt="' + txtInsertImage + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].insertTable()"><img src="icons/table.gif" width=16 height=16 alt="' + txtInsertTable + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].insertGraph()"><img src="icons/graph.gif" width=16 height=16 alt="' + txtInsertGraph + '"></td>');
    document.writeln('</tr></table>');

    document.writeln('<div style="border:1px inset"></div>');

    document.writeln('<table border=0 cellspacing=2 cellpadding=0><tr align=center>' +
                     '<td><select style="font:menu" onChange="rto[' + this.id + '].fnExec(\'fontName\', this[this.selectedIndex].value); this.selectedIndex=0">' +
                     '<option style="background-color:' + this.editorBGColor + '">' + txtFont + ':' +
                     '<option value="Arial, Helvetica">Arial' +
                     '<option value="Verdana, Arial, Helvetica">Verdana' +
                     '<option value="Times New Roman, Times, Serif">Times' +
                     '<option value="Comic Sans MS">Comic' +
                     '<option value="MS Sans Serif, sans-serif">Sans-Serif' +
                     '<option value="Courier New, Courier, Monospace">Courier' +
                     '<option value="Trebuchet MS, Arial, Helvetica">Trebuchet' +
                     '</select></td>');
    document.writeln('<td><select style="font:menu" onChange="rto[' + this.id + '].fnExec(\'fontSize\', this[this.selectedIndex].text); this.selectedIndex=0">' +
                     '<option style="background-color:' + this.editorBGColor + '">' + txtSize + ':' +
                     '<option value="1">1' +
                     '<option value="2">2' +
                     '<option value="3">3' +
                     '<option value="4">4' +
                     '<option value="5">5' +
                     '<option value="6">6' +
                     '<option value="7">7' +
                     '</select></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'bold\')"><img src="icons/bold.gif" width=16 height=16 alt="' + txtBold + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'italic\')"><img src="icons/italic.gif" width=16 height=16 alt="' + txtItalic + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'underline\')"><img src="icons/underline.gif" width=16 height=16 alt="' + txtUnderline + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].changeColor(\'BGColor\')"><img src="icons/bgcolor.gif" width=16 height=16 alt="' + txtBGColor + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].changeColor(\'FontColor\')"><img src="icons/color.gif" width=16 height=16 alt="' + txtFontColor + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].insertLink()"><img src="icons/link.gif" width=16 height=16 alt="' + txtHyperlink + '"></td>');
    document.writeln('<td><div style="width:1px; height:15px; border:1px inset"></div></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'cut\')"><img src="icons/cut.gif" width=16 height=16 alt="' + txtCut + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'copy\')"><img src="icons/copy.gif" width=16 height=16 alt="' + txtCopy + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'paste\')"><img src="icons/paste.gif" width=16 height=16 alt="' + txtPaste + '"></td>');
    document.writeln('<td><div style="width:1px; height:15px; border:1px inset"></div></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'undo\')"><img src="icons/undo.gif" width=16 height=16 alt="' + txtUndo + '"></td>');
    document.writeln('<td class="cssBtnBar' + this.id + '" width=20 height=20 onMouseOver="this.className=\'cssRaised' + this.id + '\'" onMouseOut="this.className=\'cssBtnBar' + this.id + '\'" onMouseDown="this.className=\'cssPressed' + this.id + '\'" onMouseUp="this.className=\'cssRaised' + this.id + '\'" onClick="rto[' + this.id + '].fnExec(\'redo\')"><img src="icons/redo.gif" width=16 height=16 alt="' + txtRedo + '"></td>');
    document.writeln('</tr></table>');

    document.writeln('<iframe id="idEdit' + this.id + '" frameborder=0 class="cssIFrame' + this.id + '"></iframe>');

    document.writeln('</div>');
  }

  this.create = function(content) {
    if(content == null) content = '';
    this.id = rto.length;
    if(rto[this.id] = this) {
      if((IE || GK) && DM) {
        this.buildEditor();
        this.initEditor(content);
      }
      else {
        //var cols = Math.round(this.textWidth / 10);
        //var rows = Math.round(this.textHeight / 20);
        document.write('<textarea name="' + this.fieldName + this.id + '" wrap=virtual>' +
                       content +
                       '</textarea>');
      }
    }
    else alert("Could not create editor!");
  }

  this.barGraph = function(values, labels, bColor, lColor, showVal, legend, graphcnt, bSize, bBorder, bLen) {
    showVal = parseInt(showVal);
    var colors = new Array('#0000FF', '#FF0000', '#00E000', '#A0A0FF', '#FFA0A0', '#00A000');
    var d = (typeof(values) == 'string') ? this.makeArray(values) : values;
    if(labels) var r = (typeof(labels) == 'string') ? this.makeArray(labels) : labels;
    else var r = new Array();
    var label = graph = '';
    var percent = 0;
    if(bColor) var drf = (typeof(bColor) == 'string') ? this.makeArray(bColor) : bColor;
    else var drf = new Array();
    var drw, val = new Array();
    var bc = new Array();
    if(lColor) {
      if(lColor.indexOf(',') != -1) var lc = lColor.split(',');
      else {
        lColor = lColor.replace(/\s+/g, ' ');
        var lc = lColor.split(' ');
      }
    }
    else var lc = new Array();
    if(lc[0]) lc[0] = lc[0].replace(/\s+/, '');
    else lc[0] = '#C0E0FF';
    if(lc[1]) lc[1] = lc[1].replace(/\s+/, '');
    var bars = (d.length > r.length) ? d.length : r.length;

    if(legend) graph += '<table border=0 cellspacing=0 cellpadding=0><tr valign=top><td>';

    if(graphcnt > 1) {
      var divide = Math.ceil(bars / graphcnt);
      graph += '<table border=0 cellspacing=0 cellpadding=6><tr valign=top><td>';
    }
    else var divide = 0;

    var sum = max = max_neg = max_dec = ccnt = lcnt = chart = 0;
    val[chart] = new Array();

    for(var i = 0; i < bars; i++) {
      if(divide && i && !(i % divide)) {
        lcnt = 0;
        chart++;
        val[chart] = new Array();
      }
      if(typeof(d[i]) == 'string') drw = d[i].split(';');
      else {
        drw = new Array();
        drw[0] = d[i];
      }
      val[chart][lcnt] = new Array();

      for(var j = v = 0; j < drw.length; j++) {
        val[chart][lcnt][j] = v = drw[j] ? parseFloat(drw[j]) : 0;

        if(v > max) max = v;
        else if(v < max_neg) max_neg = v;

        if(v < 0) v *= -1;
        sum += v;

        v = v.toString();
        if(v.indexOf('.') != -1) {
          v = v.substr(v.indexOf('.') + 1);
          dec = v.length;
          if(dec > max_dec) max_dec = dec;
        }

        if(!bc[j]) {
          if(ccnt >= colors.length) ccnt = 0;
          bc[j] = (!drf[j] || drf[j].length < 3) ? colors[ccnt++] : drf[j];
        }
      }
      lcnt++;
    }

    if(!showVal) showVal = 0;
    if(!bBorder) bBorder = '2px outset white';
    if(!bSize) bSize = 15;
    if(!bLen) bLen = 1.0;
    else if(bLen < 0.1) bLen = 0.1;
    else if(bLen > 2.9) bLen = 2.9;

    var border = parseInt(bBorder);
    var mPerc = sum ? Math.round(max * 100 / sum) : 0;
    var mul = mPerc ? 100 / mPerc : 1;
    mul *= bLen;
    if(showVal < 2) var valSpace = 25;
    else var valSpace = 0;
    var spacer = maxSize = Math.round(mPerc * mul + valSpace + border * 2);
    var bHeight = bSize + (border * 2);

    if(max_neg) {
      var mPerc_neg = sum ? Math.round(-max_neg * 100 / sum) : 0;
      var spacer_neg = Math.round(mPerc_neg * mul + valSpace + border * 2);
      maxSize += spacer_neg;
    }

    for(chart = lcnt = 0; chart < val.length; chart++) {
      graph += '<table border=0 cellspacing=2 cellpadding=0>';

      for(i = 0; i < val[chart].length; i++, lcnt++) {
        label = (lcnt < r.length) ? r[lcnt] : lcnt+1;
        graph += '<tr><td rowspan=' + val[chart][i].length + ' bgcolor=' + lc[0] + ' align=center style="font:10px Verdana,Arial,Helvetica">';
        graph += '&nbsp;' + label + '&nbsp;</td>';

        for(j = 0; j < val[chart][i].length; j++) {
          percent = sum ? val[chart][i][j] * 100 / sum : 0;

          if(showVal == 1 || showVal == 2) {
            graph += this.showValue(val[chart][i][j], max_dec, lc[0], 0, 'right');
          }

          if(percent < 0) {
            percent *= -1;
            graph += '<td bgcolor=' + lc[0] + ' align=right nowrap style="font:10px Verdana,Arial,Helvetica">';
            if(showVal < 2) graph += '<span style="height:' + bHeight + 'px">' + Math.round(percent) + '%&nbsp;</span>';
            graph += '<span style="height:' + bHeight + 'px; border:' + bBorder + '; background-color:' + bc[j] + '">';
            graph += '<img height=0 width=' + Math.round(percent * mul) + '></span>';
            graph += '</td><td' + (lc[1] ? ' bgcolor=' + lc[1] : '') + '>&nbsp;</td>';
          }
          else {
            if(max_neg) graph += '<td style="background-color:' + lc[0] + '">&nbsp;</td>';
            graph += '<td' + (lc[1] ? ' bgcolor=' + lc[1] : '') + ' nowrap style="font:10px Verdana,Arial,Helvetica">';
            if(percent) {
              graph += '<span style="height:' + bHeight + 'px; border:' + bBorder + '; background-color:' + bc[j] + '">';
              graph += '<img height=0 width=' + Math.round(percent * mul) + '></span>';
            }
            else graph += '<span style="height:' + bHeight + 'px; border-width:' + border + 'px"></span>';
            if(showVal < 2) graph += '<span style="height:' + bHeight + 'px">&nbsp;' + Math.round(percent) + '%</span>';
            graph += '</td>';
          }
          graph += '</tr>';
        }
      }
      graph += '</table>';

      if(chart < graphcnt - 1 && val[chart+1].length) graph += '</td><td>';
    }

    if(graphcnt > 1) graph += '</td></tr></table>';

    if(legend) {
      graph += '</td><td width=10>&nbsp;</td><td><div style="padding:4px; background-color:#F0F0F0; border:1px solid #808080; font:10px Verdana,Arial,Helvetica">';
      var l = (typeof(legend) == 'string') ? this.makeArray(legend) : legend;

      for(i = 0; i < bc.length; i++) {
        graph += '<span style="font:8px Arial,Helvetica; background-color:' + bc[i] + '; border:' + bBorder + '; height:15px"><img width=10 height=0></span>';
        graph += '&nbsp;<span style="height:15px">' + (l[i] ? l[i] : '') + '</span><br>';
      }
      graph += '</div></td></tr></table>';
    }
    return graph;
  }

  this.makeArray = function(str) {
    var arr = new Array();
    if(str.indexOf(',') != -1) arr = str.split(',');
    else {
      str = str.replace(/\s+/g, ' ');
      arr = str.split(' ');
    }
    return arr;
  }

  this.formatValue = function(val, dec) {
    if(val < 0) {
      var neg = true;
      val *= -1;
    }
    else var neg = false;
    var v = (Math.round(val * Math.pow(10, dec))).toString();
    if(v.length <= dec) for(var i = 0; i < dec - v.length + 1; i++) v = '0' + v;
    v = v.substr(0, v.length - dec) + '.' + v.substr(v.length - dec);
    if(v.substr(0, 1) == '.') v = '0' + v;
    if(neg) v = '-' + v;
    return v;
  }

  this.showValue = function(val, max_dec, color, sum, align) {
    val = max_dec ? this.formatValue(val, max_dec) : val;
    if(sum) sum = max_dec ? this.formatValue(sum, max_dec) : sum;
    value = '<td bgcolor=' + color;
    if(align) value += ' align=' + align;
    value += ' nowrap style="font:10px Verdana,Arial,Helvetica">';
    value += '&nbsp;' + val + (sum ? ' / ' + sum : '') + '&nbsp;</td>';
    return value;
  }
}

//---------------------------------------------------------------------------------------------------------
// Global functions
//---------------------------------------------------------------------------------------------------------
function buildColorChart(mode) {
  var c = new Array();
  // red
  c[0] = new Array('FFEEEE', 'FFCCCC', 'FFAAAA', 'FF8888', 'FF6666', 'FF4444', 'FF2222', 'FF0000',
                   'EE0000', 'CC0000', 'AA0000', '880000', '770000', '660000', '550000', '440000', '330000');
  // green
  c[1] = new Array('EEFFEE', 'CCFFCC', 'AAFFAA', '88FF88', '66FF66', '44FF44', '22FF22', '00FF00',
                   '00EE00', '00CC00', '00AA00', '008800', '007700', '006600', '005500', '004400', '003300');
  // blue
  c[2] = new Array('EEEEFF', 'CCCCFF', 'AAAAFF', '8888FF', '6666FF', '4444FF', '2222FF', '0000FF',
                   '0000EE', '0000CC', '0000AA', '000088', '000077', '000066', '000055', '000044', '000033');
  // yellow
  c[3] = new Array('FFFFEE', 'FFFFCC', 'FFFFAA', 'FFFF88', 'FFFF66', 'FFFF44', 'FFFF22', 'FFFF00',
                   'EEEE00', 'CCCC00', 'AAAA00', '888800', '777700', '666600', '555500', '444400', '333300');
  // pink
  c[4] = new Array('FFEEFF', 'FFCCFF', 'FFAAFF', 'FF88FF', 'FF66FF', 'FF44FF', 'FF22FF', 'FF00FF',
                   'EE00EE', 'CC00CC', 'AA00AA', '880088', '770077', '660066', '550055', '440044', '330033');
  // brown
  c[5] = new Array('FFF0D0', 'FFEECC', 'FFEEBB', 'FFDDAA', 'FFCC99', 'FFC090', 'EEBB88', 'DDAA77',
                   'CC9966', 'BB8855', 'AA7744', '886633', '775522', '664411', '553300', '442200', '331100');
  // cyan
  c[6] = new Array('EEFFFF', 'CCFFFF', 'AAFFFF', '88FFFF', '66FFFF', '44FFFF', '22FFFF', '00FFFF',
                   '00EEEE', '00CCCC', '00AAAA', '008888', '007777', '006666', '005555', '004444', '003333');
  // grey
  c[7] = new Array('FFFFFF', 'EEEEEE', 'DDDDDD', 'CCCCCC', 'BBBBBB', 'AAAAAA', 'A0A0A0', '999999',
                   '888888', '777777', '666666', '555555', '444444', '333333', '222222', '111111', '000000');

  var html = '<table border=0 cellspacing=1 cellpadding=0 bgcolor=#808080>';
  var i, j;

  for(i = 0; i < c.length; i++) {
    html += '<tr>';

    for(j = 0; j < c[i].length; j++) {
      html += '<td width=14 height=14 bgcolor=#' + c[i][j] + '>' +
              '<a href="javascript:rto[document.f' + mode + '.id.value].pickColor(\'#' + c[i][j] + '\', \'' + mode + '\')" ' +
              'title="#' + c[i][j] + '"><div style="width:14px; height:14px; font-size:1px; cursor:hand"></div></a></td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

function rtoStore() {
  for(var i = 0; i < rto.length; i++) rto[i].store();
}

function getMouse(e) {
  if(e && e.pageX) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
  else if(typeof event != 'undefined') {
    mouseX = event.clientX;
    mouseY = event.clientY + document.body.scrollTop;
  }
}

document.onmousemove = getMouse;

//---------------------------------------------------------------------------------------------------------
// Global styles / dialog boxes
//---------------------------------------------------------------------------------------------------------
if((IE || GK) && DM) {
  document.writeln('<style> ' +
                   'FORM { ' +
                   'margin: 0px; ' +
                   '} ' +
                   '.cssDialog { ' +
                   'position: absolute; ' +
                   'padding: 4px; ' +
                   'z-index: 99; ' +
                   'background-color: #E0E0E0; ' +
                   'border: 2px groove; ' +
                   'text-align: center; ' +
                   'visibility: hidden; ' +
                   '} ' +
                   '.cssFont1 { ' +
                   'font-family: Verdana, Arial, Helvetica; ' +
                   'font-size: 12px; ' +
                   'font-weight: bold; ' +
                   'margin-top: 0px; ' +
                   'margin-bottom: 4px; ' +
                   'padding: 2px; ' +
                   'background-color: #F0F0F0; ' +
                   'border: 2px groove; ' +
                   '} ' +
                   '.cssFont2 { ' +
                   'font-family: Verdana, Arial, Helvetica; ' +
                   'font-size: 11px; ' +
                   '} ' +
                   '.cssForm { ' +
                   'font-family: Courier New, Courier, Monospace; ' +
                   'font-size: 12px; ' +
                   'border: 2px groove; ' +
                   '} ' +
                   '.cssButton { ' +
                   'font-family: Verdana, Arial, Helvetica; ' +
                   'font-size: 11px; ' +
                   'font-weight: bold; ' +
                   'width: 100px; ' +
                   'margin-top: 4px; ' +
                   'background-color: #D0D0D0; ' +
                   '} ' +
                   '</style>');

  document.writeln('<div id="dlgBGColor" class="cssDialog"><center>' +
                   '<p class="cssFont1">' + txtBGColor + '</p>' +
                   '<form name="fBGColor"><input type=hidden name="id" value=""></form>' +
                   buildColorChart('BGColor') +
                   '<input type=button value="' + txtCancel + '" class="cssButton" onClick="rto[document.fBGColor.id.value].viewDialog(\'BGColor\')">' +
                   '</center></div>');

  document.writeln('<div id="dlgFontColor" class="cssDialog"><center>' +
                   '<p class="cssFont1">' + txtFontColor + '</p>' +
                   '<form name="fFontColor"><input type=hidden name="id" value=""></form>' +
                   buildColorChart('FontColor') +
                   '<input type=button value="' + txtCancel + '" class="cssButton" onClick="rto[document.fFontColor.id.value].viewDialog(\'FontColor\')">' +
                   '</center></div>');

  document.writeln('<div id="dlgImage" class="cssDialog"><center>' +
                   '<p class="cssFont1">' + txtInsertImage + '</p>' +
                   '<form name="fImage" action="javascript:rto[document.fImage.id.value].createImage()">' +
                   '<input type=hidden name="id" value="">' +
                   '<table border=0 cellspacing=0>');
  document.writeln('<tr><td class="cssFont2" nowrap>URL:</td><td>&nbsp;<input type=text name="URL" size=30 maxlength=100 class="cssForm" value="http://"></td></tr>');
  document.writeln('</table>' +
                   '<table border=0 cellspacing=0 cellpadding=0 width=230><tr>' +
                   '<td><input type=button value="' + txtCancel + '" class="cssButton" onClick="rto[document.fImage.id.value].viewDialog(\'Image\')"></td>' +
                   '<td align=right><input type=submit value="OK" class="cssButton"></td>' +
                   '</tr></table>' +
                   '</form>' +
                   '</center></div>');

  document.writeln('<div id="dlgTable" class="cssDialog"><center>' +
                   '<p class="cssFont1">' + txtInsertTable + '</p>' +
                   '<form name="fTable" action="javascript:rto[document.fTable.id.value].createTable(true)">' +
                   '<input type=hidden name="id" value="">' +
                   '<table border=0 cellspacing=0>');
  document.writeln('<tr><td class="cssFont2" nowrap>' + txtColumns + ':</td><td>&nbsp;<input type=text name="Cols" size=2 maxlength=2 class="cssForm"></td><td>&nbsp;</td><td class="cssFont2" nowrap>' + txtCellSpacing + ':</td><td>&nbsp;<input type=text name="Spacing" size=2 maxlength=2 class="cssForm" value="2"></td></tr>');
  document.writeln('<tr><td class="cssFont2" nowrap>' + txtRows + ':</td><td>&nbsp;<input type=text name="Rows" size=2 maxlength=2 class="cssForm"></td><td>&nbsp;</td><td class="cssFont2" nowrap>' + txtCellPadding + ':</td><td>&nbsp;<input type=text name="Padding" size=2 maxlength=2 class="cssForm" value="2"></td></tr>');
  document.writeln('<tr><td class="cssFont2" nowrap>' + txtBorder + ':</td><td>&nbsp;<select name="Border" class="cssForm"><option value="0">0<option value="1" selected>1<option value="2">2<option value="3">3<option value="4">4<option value="5">5</select></td><td>&nbsp;</td><td class="cssFont2" nowrap>' + txtBorderColor + ':</td><td>&nbsp;<input type=text name="BorderColor" size=10 maxlength=10 class="cssForm" value="#000000"></td></tr>');
  document.writeln('<tr><td colspan=3></td><td class="cssFont2" nowrap>' + txtCellColor + ':</td><td>&nbsp;<input type=text name="CellColor" size=10 maxlength=10 class="cssForm"></td></tr>');
  document.writeln('</table>' +
                   '<table border=0 cellspacing=0 cellpadding=0 width=230><tr>' +
                   '<td><input type=button value="' + txtCancel + '" class="cssButton" onClick="rto[document.fTable.id.value].viewDialog(\'Table\')"></td>' +
                   '<td align=right><input type=submit value="' + txtCreate + '" class="cssButton"></td>' +
                   '</tr></table>' +
                   '</form>' +
                   '</center></div>');

  document.writeln('<div id="dlgGraph" class="cssDialog"><center>' +
                   '<p class="cssFont1">' + txtInsertGraph + '</p>' +
                   '<form name="fGraph" action="javascript:rto[document.fGraph.id.value].createGraph(true)">' +
                   '<input type=hidden name="id" value="">' +
                   '<table border=0 cellspacing=0>');
  document.writeln('<tr><td class="cssFont2" nowrap>' + txtValues + ':</td><td>&nbsp;<input name="Values" type=text size=10 class="cssForm"></td><td>&nbsp;</td><td class="cssFont2" nowrap>' + txtBarColor + ':</td><td>&nbsp;<input type=text name="BarColor" size=10 class="cssForm"></td></tr>');
  document.writeln('<tr><td class="cssFont2" nowrap>' + txtLabels + ':</td><td>&nbsp;<input type=text name="Labels" size=10 class="cssForm"></td><td>&nbsp;</td><td class="cssFont2" nowrap>' + txtLabelColor + ':</td><td>&nbsp;<input type=text name="LabelColor" size=10 class="cssForm"></td></tr>');
  document.writeln('<tr><td class="cssFont2" nowrap>' + txtLegend + ':</td><td>&nbsp;<input type=text name="Legend" size=10 class="cssForm"></td><td>&nbsp;</td><td class="cssFont2" nowrap>' + txtViewValues + ':</td><td>&nbsp;<select name="ViewValues" class="cssForm"><option value="">%<option value="1">abs. + %<option value="2">abs.<option value="3">-</select></td></tr>');
  document.writeln('</table>' +
                   '<table border=0 cellspacing=0 cellpadding=0 width=230><tr>' +
                   '<td><input type=button value="' + txtCancel + '" class="cssButton" onClick="rto[document.fGraph.id.value].viewDialog(\'Graph\')"></td>' +
                   '<td align=right><input type=submit value="' + txtCreate + '" class="cssButton"></td>' +
                   '</tr></table>' +
                   '</form>' +
                   '</center></div>');
}

//---------------------------------------------------------------------------------------------------------
