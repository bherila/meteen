function FCx(x){
  var min=15; // minimum minutes between interstitials (needs to be >15)
  if(x.indexOf('get.media')>0){
    x=unescape(x.substring(x.indexOf('&url=')+5,x.length));
  }else{
    if(document.cookie.indexOf('CxIC=1')<=0){
      x='http://media.fastclick.net/w/get.media?sid=19354&m=5&tp=6&url='+escape(x);
      var date_ob=new Date();
      date_ob.setTime(date_ob.getTime()+min*1000*60);
      document.cookie='FCxIC=1; path=/; expires='+date_ob.toGMTString();
    }
  }
  return x
}

function MM_reloadPage(init) {  //reloads the window if Nav4 resized
  if (init==true) with (navigator) {if ((appName=="Netscape")&&(parseInt(appVersion)==4)) {
    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; }}
  else if (innerWidth!=document.MM_pgW || innerHeight!=document.MM_pgH) location.reload();
}
MM_reloadPage(true);

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}


function setNavOver(obj)
{
obj.obgcolor = obj.style.backgroundColor;
obj.obgborder = obj.style.border;
obj.style.border = '1px solid #000000';
obj.style.backgroundColor = '#033394';
obj.style.padding = '0px';
}
function setNavOut(obj)
{
obj.style.border = obj.obgborder;
obj.style.backgroundColor = obj.obgcolor;
obj.style.padding = '1px';
}

//ValueClick Media PopUnder Code
var dc=document; var date_ob=new Date();
dc.cookie='h2=o; path=/;';var bust=date_ob.getSeconds();
if(dc.cookie.indexOf('e=llo') <= 0 && dc.cookie.indexOf('2=o') > 0){
dc.write('<scr'+'ipt language="javascript" src="http://media.fastclick.net');
dc.write('/w/pop.cgi?sid=19354&m=2&tp=2&v=1.8&c='+bust+'"></scr'+'ipt>');
date_ob.setTime(date_ob.getTime()+43200000);
dc.cookie='he=llo; path=/; expires='+ date_ob.toGMTString();} // -->
//End Popunder

//Casale Media Popunder
var casaleD=new Date();var casaleR=(casaleD.getTime()%8673806982)+Math.random();
var casaleU=escape(window.location.href);
var casaleHost=' type="text/javascript" src="http://as.casalemedia.com/s?s=';
document.write('<scr'+'ipt'+casaleHost+'62380&amp;u=');
document.write(casaleU+'&amp;f=1&amp;id='+casaleR+'"><\/scr'+'ipt>');
//End Casale