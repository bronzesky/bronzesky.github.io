// flow.js — resource flow SVG animation between cards and HCCA node
(function(){
'use strict';

window.initFlow=function(){
  const svg=document.getElementById('flow-svg');
  if(!svg)return;
  const W=svg.parentElement.offsetWidth;
  const H=svg.parentElement.offsetHeight;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);

  // Get center positions of each card and HCCA node
  function mid(el){
    const r=el.getBoundingClientRect();
    const pr=svg.parentElement.getBoundingClientRect();
    return{x:r.left+r.width/2-pr.left,y:r.top+r.height/2-pr.top};
  }

  const nodeIds=['card-carbon','card-tax','card-esg','hcca-node','card-alloc','card-ops'];
  const pos={};
  nodeIds.forEach(id=>{
    const el=document.getElementById(id);
    if(el)pos[id]=mid(el);
  });
  if(!pos['hcca-node'])return;

  const hc=pos['hcca-node'];
  const lines=[
    {from:'card-carbon',to:'hcca-node',color:'#5DCAA5'},
    {from:'card-tax',to:'hcca-node',color:'#85B7EB'},
    {from:'card-esg',to:'hcca-node',color:'#EF9F27'},
    {from:'hcca-node',to:'card-alloc',color:'#5DCAA5'},
    {from:'hcca-node',to:'card-ops',color:'rgba(93,202,165,0.5)'},
  ];

  svg.innerHTML='';
  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  svg.appendChild(defs);

  lines.forEach((ln,i)=>{
    const f=pos[ln.from],t=pos[ln.to];
    if(!f||!t)return;
    const cx=(f.x+t.x)/2;
    const d=`M${f.x},${f.y} Q${cx},${f.y} ${t.x},${t.y}`;
    // Path
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',d);
    path.setAttribute('fill','none');
    path.setAttribute('stroke',ln.color);
    path.setAttribute('stroke-width','1.5');
    path.setAttribute('stroke-dasharray','6 5');
    path.setAttribute('opacity','0.45');
    const pathLen=300;
    path.style.strokeDashoffset=pathLen;
    path.style.animation=`dash-flow ${2.2+i*.3}s linear infinite`;
    svg.appendChild(path);

    // Inject keyframes once
    if(i===0){
      const style=document.createElement('style');
      style.textContent=`@keyframes dash-flow{to{stroke-dashoffset:0;}}`;
      document.head.appendChild(style);
    }

    // Particle dots along path (3 per line)
    for(let p=0;p<3;p++){
      const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute('r','3');
      circle.setAttribute('fill',ln.color);
      circle.setAttribute('opacity','0');
      const anim=document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
      anim.setAttribute('dur',`${2.4+i*.25}s`);
      anim.setAttribute('begin',`${p*0.8}s`);
      anim.setAttribute('repeatCount','indefinite');
      anim.setAttribute('calcMode','linear');
      const mp=document.createElementNS('http://www.w3.org/2000/svg','mpath');
      // Use the same path
      const pathId=`flow-path-${i}`;
      path.setAttribute('id',pathId);
      mp.setAttribute('href',`#${pathId}`);
      anim.appendChild(mp);
      const aOpacity=document.createElementNS('http://www.w3.org/2000/svg','animate');
      aOpacity.setAttribute('attributeName','opacity');
      aOpacity.setAttribute('values','0;1;1;0');
      aOpacity.setAttribute('keyTimes','0;0.1;0.9;1');
      aOpacity.setAttribute('dur',`${2.4+i*.25}s`);
      aOpacity.setAttribute('begin',`${p*0.8}s`);
      aOpacity.setAttribute('repeatCount','indefinite');
      circle.appendChild(anim);
      circle.appendChild(aOpacity);
      svg.appendChild(circle);
    }
  });
};
})();
