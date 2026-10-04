// Inverse UTM on WGS84. Source does not identify datum: use only an explicit region estimate.
module.exports=function(easting,northing,zone){
 const a=6378137,e2=0.0066943799901413165,k0=.9996,ep2=e2/(1-e2),e1=(1-Math.sqrt(1-e2))/(1+Math.sqrt(1-e2));
 const m=northing/k0,mu=m/(a*(1-e2/4-3*e2*e2/64-5*e2**3/256));
 const phi=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1**2/16-55*e1**4/32)*Math.sin(4*mu)+151*e1**3/96*Math.sin(6*mu)+1097*e1**4/512*Math.sin(8*mu);
 const n=a/Math.sqrt(1-e2*Math.sin(phi)**2),t=Math.tan(phi)**2,cc=ep2*Math.cos(phi)**2,r=a*(1-e2)/(1-e2*Math.sin(phi)**2)**1.5,d=(easting-500000)/(n*k0);
 const lat=phi-n*Math.tan(phi)/r*(d*d/2-(5+3*t+10*cc-4*cc*cc-9*ep2)*d**4/24+(61+90*t+298*cc+45*t*t-252*ep2-3*cc*cc)*d**6/720);
 const lon=((zone-1)*6-180+3)*Math.PI/180+(d-(1+2*t+cc)*d**3/6+(5-2*cc+28*t-3*cc*cc+8*ep2+24*t*t)*d**5/120)/Math.cos(phi);
 return {lng:lon*180/Math.PI,lat:lat*180/Math.PI};
};
