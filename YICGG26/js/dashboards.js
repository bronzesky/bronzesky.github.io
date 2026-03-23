// dashboards.js — 5 overlay dashboards with D3 charts and auto-play tickers
(function(){
'use strict';

// === SECTION INITIALIZATION ===
const pbIv={};
function stopPlayback(id){
  if(pbIv[id]){clearInterval(pbIv[id]);delete pbIv[id];}
}

// Initialize all sections on page load
document.addEventListener('DOMContentLoaded',()=>{
  initSectionA();
  initSectionB();
  initSectionC();
  initSectionD();
  initSectionE();
});

// === D3 HELPERS ===
function clearSvg(sel){d3.select(sel).selectAll('*').remove();}
function dims(sel){
  const el=document.querySelector(sel);
  if(!el)return{w:300,h:180};
  return{w:el.clientWidth||300,h:el.clientHeight||180};
}
const fmt=d3.format(',');
const fmtM=v=>v>=1e6?`$${(v/1e6).toFixed(1)}M`:v>=1e3?`$${(v/1e3).toFixed(0)}K`:`$${v}`;
const fmtCNY=v=>v>=1e6?`¥${(v/1e6).toFixed(1)}M`:v>=1e3?`¥${(v/1e3).toFixed(0)}K`:`¥${v}`;
// === SECTION A: CARBON TRADING ===
function initSectionA(){
  if(sectionsInitialized.A)return;
  sectionsInitialized.A=true;

  const D=window.HCCS;
  let tickIdx=0;
  const feed=document.getElementById('s-carbon-feed');
  if(feed)feed.innerHTML='';

  function addTick(){
    const rows=D.CARBON_TRADES;
    const r=rows[tickIdx%rows.length];
    if(!feed)return;
    const div=document.createElement('div');
    div.className='ticker-row';
    div.innerHTML=`<div class="t-time">${r.date} ${r.time}</div>
      <div class="t-main">${r.buyer} <span style="color:var(--text3)">→</span> ${r.site} &nbsp;
      <span style="color:var(--text2)">${fmt(r.qty)} tCO₂ &nbsp; ¥${r.price}/t</span> &nbsp;
      <span class="t-val">${fmtCNY(r.total)}</span></div>`;
    feed.prepend(div);
    while(feed.children.length>12)feed.removeChild(feed.lastChild);
    tickIdx++;
    updateProgressA(tickIdx%rows.length,rows.length);
  }
  addTick();
  pbIv.A=setInterval(addTick,1000);

  // Animated Charts - sliding window
  let dayOffset=0;
  function updateCharts(){
    const windowSize=30;
    const startIdx=dayOffset%D.CARBON_DAILY.length;
    const sliceData=[];
    for(let i=0;i<windowSize;i++){
      sliceData.push(D.CARBON_DAILY[(startIdx+i)%D.CARBON_DAILY.length]);
    }
    drawLine('#s-carbon-chart1',sliceData.map(r=>({x:r.date,y:r.vol})),'tCO₂','#5DCAA5');
    drawLine('#s-carbon-chart2',sliceData.map(r=>({x:r.date,y:r.rev})),'¥','#EF9F27');
    dayOffset++;
  }
  updateCharts();
  pbIv.A_chart=setInterval(updateCharts,2000);

  // Animated Pie Chart
  let pieIdx=0;
  const pieData=[
    [{label:'控排企业',v:0.52,color:'#5DCAA5'},{label:'CORSIA',v:0.31,color:'#85B7EB'},{label:'ESG自愿',v:0.17,color:'#EF9F27'}],
    [{label:'控排企业',v:0.48,color:'#5DCAA5'},{label:'CORSIA',v:0.35,color:'#85B7EB'},{label:'ESG自愿',v:0.17,color:'#EF9F27'}],
    [{label:'控排企业',v:0.55,color:'#5DCAA5'},{label:'CORSIA',v:0.28,color:'#85B7EB'},{label:'ESG自愿',v:0.17,color:'#EF9F27'}],
  ];
  function updatePie(){
    drawPie('#s-carbon-chart3',pieData[pieIdx%pieData.length]);
    pieIdx++;
  }
  updatePie();
  pbIv.A_pie=setInterval(updatePie,3000);
}
function updateProgressA(idx,total){
  const pct=idx/total*100;
  const fill=document.getElementById('s-carbon-pf');
  const D=window.HCCS;
  if(fill){fill.style.width=pct+'%';}
  const lbl=document.getElementById('s-carbon-plbl');
  if(lbl){const r=D.CARBON_TRADES[idx]||D.CARBON_TRADES[0];lbl.textContent=r.date+' '+r.time;}
}
// === SECTION B: TOURISM TAX ===
function initSectionB(){
  if(sectionsInitialized.B)return;
  sectionsInitialized.B=true;

  const D=window.HCCS;
  let idx=0;
  const feed=document.getElementById('s-tax-feed');
  if(feed)feed.innerHTML='';

  function addTick(){
    const rows=D.TAX_RECORDS;
    const r=rows[idx%rows.length];
    if(!feed)return;
    const div=document.createElement('div');
    div.className='ticker-row';
    div.innerHTML=`<div class="t-time">${r.date}</div>
      <div class="t-main">${r.site} &nbsp;
      <span style="color:var(--text2)">${fmt(r.visitors)}人</span> &nbsp;
      <span class="t-val">${fmtCNY(r.tax)}</span></div>`;
    feed.prepend(div);
    while(feed.children.length>14)feed.removeChild(feed.lastChild);
    idx++;
    const fill=document.getElementById('s-tax-pf');
    if(fill)fill.style.width=(idx%rows.length/rows.length*100)+'%';
  }
  addTick();
  pbIv.B=setInterval(addTick,800);

  // Animated Charts - sliding window
  let dayOffset=0;
  function updateCharts(){
    const windowSize=30;
    const startIdx=dayOffset%D.TAX_DAILY.length;
    const sliceData=[];
    for(let i=0;i<windowSize;i++){
      sliceData.push(D.TAX_DAILY[(startIdx+i)%D.TAX_DAILY.length]);
    }

    const siteRevMap={};
    const recordWindow=Math.floor(D.TAX_RECORDS.length*windowSize/D.TAX_DAILY.length);
    for(let i=0;i<recordWindow;i++){
      const r=D.TAX_RECORDS[(startIdx*10+i)%D.TAX_RECORDS.length];
      siteRevMap[r.site]=(siteRevMap[r.site]||0)+r.tax;
    }
    const siteRev=Object.entries(siteRevMap).map(([k,v])=>({site:k,rev:v})).sort((a,b)=>b.rev-a.rev).slice(0,15);
    drawHBar('#s-tax-chart1',siteRev.map(r=>({label:r.site,v:r.rev})),'#85B7EB');
    drawLine('#s-tax-chart2',sliceData.map(r=>({x:r.date,y:r.rev})),'¥','#85B7EB');
    dayOffset++;
  }
  updateCharts();
  pbIv.B_chart=setInterval(updateCharts,2000);

  // Animated Pie Chart
  let pieIdx=0;
  const pieData=[
    [{label:'文化遗址',v:0.58,color:'#85B7EB'},{label:'自然遗产',v:0.28,color:'#5DCAA5'},{label:'混合遗产',v:0.14,color:'#EF9F27'}],
    [{label:'文化遗址',v:0.55,color:'#85B7EB'},{label:'自然遗产',v:0.32,color:'#5DCAA5'},{label:'混合遗产',v:0.13,color:'#EF9F27'}],
    [{label:'文化遗址',v:0.60,color:'#85B7EB'},{label:'自然遗产',v:0.26,color:'#5DCAA5'},{label:'混合遗产',v:0.14,color:'#EF9F27'}],
  ];
  function updatePie(){
    drawPie('#s-tax-chart3',pieData[pieIdx%pieData.length]);
    pieIdx++;
  }
  updatePie();
  pbIv.B_pie=setInterval(updatePie,3000);
}

// === SECTION C: ESG ===
function initSectionC(){
  if(sectionsInitialized.C)return;
  sectionsInitialized.C=true;

  const D=window.HCCS;
  let idx=0;
  const feed=document.getElementById('s-esg-feed');
  if(feed)feed.innerHTML='';

  function addTick(){
    const rows=D.ESG_RECORDS;
    const r=rows[idx%rows.length];
    if(!feed)return;
    const div=document.createElement('div');
    div.className='ticker-row';
    div.innerHTML=`<div class="t-time">${r.date}</div>
      <div class="t-main">${r.company} &nbsp;
      <span style="color:var(--text2)">${r.type}</span> &nbsp;
      <span class="t-val">${fmtM(r.amount)}</span></div>`;
    feed.prepend(div);
    while(feed.children.length>14)feed.removeChild(feed.lastChild);
    idx++;
    const fill=document.getElementById('s-esg-pf');
    if(fill)fill.style.width=(idx%rows.length/rows.length*100)+'%';
  }
  addTick();
  pbIv.C=setInterval(addTick,1000);

  // Animated Charts - sliding window
  let dayOffset=0;
  function updateCharts(){
    const windowSize=30;
    const startIdx=dayOffset%D.ESG_DAILY.length;
    const sliceData=[];
    for(let i=0;i<windowSize;i++){
      sliceData.push(D.ESG_DAILY[(startIdx+i)%D.ESG_DAILY.length]);
    }

    const coRevMap={};
    const recordWindow=Math.floor(D.ESG_RECORDS.length*windowSize/D.ESG_DAILY.length);
    for(let i=0;i<recordWindow;i++){
      const r=D.ESG_RECORDS[(startIdx*10+i)%D.ESG_RECORDS.length];
      coRevMap[r.company]=(coRevMap[r.company]||0)+r.amount;
    }
    const coRev=Object.entries(coRevMap).map(([k,v])=>({label:k,v})).sort((a,b)=>b.v-a.v).slice(0,10);
    drawHBar('#s-esg-chart1',coRev,'#EF9F27');
    drawLine('#s-esg-chart2',sliceData.map(r=>({x:r.date,y:r.rev})),'$','#EF9F27');
    dayOffset++;
  }
  updateCharts();
  pbIv.C_chart=setInterval(updateCharts,2000);

  // Animated Pie Chart
  let pieIdx=0;
  const pieData=[
    [{label:'CCER履约',v:0.45,color:'#EF9F27'},{label:'CORSIA',v:0.32,color:'#F0997B'},{label:'ESG自愿',v:0.23,color:'#5DCAA5'}],
    [{label:'CCER履约',v:0.48,color:'#EF9F27'},{label:'CORSIA',v:0.30,color:'#F0997B'},{label:'ESG自愿',v:0.22,color:'#5DCAA5'}],
    [{label:'CCER履约',v:0.42,color:'#EF9F27'},{label:'CORSIA',v:0.35,color:'#F0997B'},{label:'ESG自愿',v:0.23,color:'#5DCAA5'}],
  ];
  function updatePie(){
    drawPie('#s-esg-chart3',pieData[pieIdx%pieData.length]);
    pieIdx++;
  }
  updatePie();
  pbIv.C_pie=setInterval(updatePie,3000);
}
// === SECTION D: FUND DETAIL ===
function initSectionD(){
  if(sectionsInitialized.D)return;
  sectionsInitialized.D=true;

  const D=window.HCCS;
  function fK(v){return v>=1e6?`$${(v/1e6).toFixed(1)}M`:v>=1e3?`$${(v/1e3).toFixed(0)}K`:`$${v}`;}
  const tot=D.FUND_DAILY.reduce((a,r)=>({in:a.in+r.inflow,out:a.out+r.outflow}),{in:0,out:0});
  function set(id,t){const e=document.getElementById(id);if(e)e.textContent=t;}
  set('kpi-bal',fK(D.finalBalance));
  set('kpi-in',fK(tot.in));
  set('kpi-out',fK(tot.out));
  set('kpi-net',(tot.in-tot.out>=0?'+':'')+fK(tot.in-tot.out));

  // Animated Charts - sliding window
  let dayOffset=0;
  function updateCharts(){
    const windowSize=30;
    const startIdx=dayOffset%D.FUND_DAILY.length;
    const sliceData=[];
    for(let i=0;i<windowSize;i++){
      sliceData.push(D.FUND_DAILY[(startIdx+i)%D.FUND_DAILY.length]);
    }
    drawWaterfall('#s-fund-chart1',sliceData.map(r=>({x:r.date,y:r.net})));
    drawStackedArea('#s-fund-chart2',sliceData,[
      {key:'inflow',label:'流入',color:'#5DCAA5'},
      {key:'outflow',label:'支出',color:'#EF9F27'}
    ]);
    drawLine('#s-fund-chart3',sliceData.map(r=>({x:r.date,y:r.balance})),'$','#85B7EB');
    drawDualLine('#s-fund-chart4',
      sliceData.map(r=>({x:r.date,y1:+(r.outflow/r.inflow*100).toFixed(1),y2:+(D.ALLOC_SITES.filter(s=>s.verif>=60).length/D.ALLOC_SITES.length*100).toFixed(1)})),
      '拨付率%','核查率%');
    dayOffset++;
  }
  updateCharts();
  pbIv.D_chart=setInterval(updateCharts,2000);
}
// === SECTION E: ALLOCATION ===
function initSectionE(){
  if(sectionsInitialized.E)return;
  sectionsInitialized.E=true;

  const D=window.HCCS;
  drawGeo('#s-allocation-map',D.ALLOC_SITES);
  const list=document.getElementById('s-allocation-list');
  if(list){
    list.innerHTML='';
    [...D.ALLOC_SITES].sort((a,b)=>b.score-a.score).forEach(s=>{
      const pLabel={'pre':'预拨','mid':'中期','final':'尾款'}[s.phase]||s.phase;
      const pClass={'pre':'phase-pre','mid':'phase-mid','final':'phase-final'}[s.phase]||'';
      const amt=Math.round(s.score*50000);
      const icon=s.verif>=90?'✓':s.verif>=60?'⏳':'◌';
      const div=document.createElement('div');
      div.className='alloc-item';
      div.innerHTML=`<div class="ai-name">${s.name} <span class="ai-score">${s.score}/10</span></div>
        <div class="ai-meta">${s.country} &nbsp; ${fmtM(amt)} &nbsp; <span class="${pClass}">${pLabel}</span></div>
        <div class="ai-status">${icon} 核查进度 ${s.verif}%</div>`;
      list.appendChild(div);
    });
    let st=0;
    pbIv.E=setInterval(()=>{
      st+=1;if(st>list.scrollHeight-list.clientHeight)st=0;
      list.scrollTop=st;
    },30);
  }
  [{id:'vb-unesco',v:87},{id:'vb-acha',v:74},{id:'vb-ai',v:61}].forEach(item=>{
    const bar=document.getElementById(item.id);
    if(bar)setTimeout(()=>{bar.style.width=item.v+'%';},300);
  });
}
// === D3 CHART RENDERERS ===
function drawLine(sel,data,unit,color){
  clearSvg(sel);
  const {w,h}=dims(sel);
  const mg={t:10,r:14,b:28,l:36};
  const iw=w-mg.l-mg.r,ih=h-mg.t-mg.b;
  const svg=d3.select(sel).append('svg').attr('width',w).attr('height',h);
  const g=svg.append('g').attr('transform',`translate(${mg.l},${mg.t})`);
  const x=d3.scalePoint().domain(data.map(d=>d.x)).range([0,iw]);
  const y=d3.scaleLinear().domain([0,d3.max(data,d=>d.y)*1.12]).range([ih,0]);
  g.append('g').attr('class','axis').attr('transform',`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((_,i)=>i%6===0)).tickSize(0))
    .select('.domain').remove();
  g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(4).tickFormat(v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v));
  const line=d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveMonotoneX);
  g.append('path').datum(data).attr('d',line).attr('fill','none').attr('stroke',color).attr('stroke-width',2.5).attr('opacity',.9);
  g.selectAll('.dot').data(data).join('circle').attr('class','dot')
    .attr('cx',d=>x(d.x)).attr('cy',d=>y(d.y)).attr('r',3)
    .attr('fill',color).attr('opacity',.8);
}

function drawBarLine(sel,data,unit,color){
  clearSvg(sel);
  const {w,h}=dims(sel);
  const mg={t:10,r:14,b:28,l:36};
  const iw=w-mg.l-mg.r,ih=h-mg.t-mg.b;
  const svg=d3.select(sel).append('svg').attr('width',w).attr('height',h);
  const g=svg.append('g').attr('transform',`translate(${mg.l},${mg.t})`);
  const x=d3.scaleBand().domain(data.map(d=>d.x)).range([0,iw]).padding(.25);
  const y=d3.scaleLinear().domain([0,d3.max(data,d=>d.y)*1.12]).range([ih,0]);
  g.append('g').attr('class','axis').attr('transform',`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((_,i)=>i%6===0)).tickSize(0))
    .select('.domain').remove();
  g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(4).tickFormat(v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v));
  g.selectAll('.bar').data(data).join('rect').attr('class','bar')
    .attr('x',d=>x(d.x)).attr('y',d=>y(d.y))
    .attr('width',x.bandwidth()).attr('height',d=>ih-y(d.y))
    .attr('fill',color).attr('rx',2).attr('opacity',.82);
}
function drawHBar(sel,data,color){
  clearSvg(sel);
  const {w,h}=dims(sel);
  const mg={t:4,r:14,b:4,l:72};
  const iw=w-mg.l-mg.r,ih=h-mg.t-mg.b;
  const svg=d3.select(sel).append('svg').attr('width',w).attr('height',h);
  const g=svg.append('g').attr('transform',`translate(${mg.l},${mg.t})`);
  const y=d3.scaleBand().domain(data.map(d=>d.label)).range([0,ih]).padding(.28);
  const x=d3.scaleLinear().domain([0,d3.max(data,d=>d.v)*1.1]).range([0,iw]);
  g.append('g').attr('class','axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
  g.selectAll('.hbar').data(data).join('rect').attr('class','hbar')
    .attr('y',d=>y(d.label)).attr('x',0)
    .attr('height',y.bandwidth()).attr('width',d=>x(d.v))
    .attr('fill',color).attr('rx',2).attr('opacity',.82);
}
function drawPie(sel,data){
  const svg=d3.select(sel).select('svg');
  const isUpdate=!svg.empty();

  if(!isUpdate){
    clearSvg(sel);
    const {w,h}=dims(sel);
    const r=Math.min(w*.38,h*.44);
    const newSvg=d3.select(sel).append('svg').attr('width',w).attr('height',h);
    const g=newSvg.append('g').attr('transform',`translate(${r+12},${h/2})`);
    const pie=d3.pie().value(d=>d.v).sort(null);
    const arc=d3.arc().innerRadius(r*.52).outerRadius(r);
    g.selectAll('path').data(pie(data)).join('path')
      .attr('d',arc).attr('fill',d=>d.data.color).attr('stroke','rgba(0,0,0,.3)').attr('stroke-width',1);
    const lg=newSvg.append('g').attr('transform',`translate(${r*2+28},${h/2-data.length*10})`);
    data.forEach((d,i)=>{
      const row=lg.append('g').attr('transform',`translate(0,${i*20})`);
      row.append('circle').attr('r',5).attr('fill',d.color);
      row.append('text').attr('x',10).attr('y',4).attr('fill','rgba(234,243,222,.7)').attr('font-size',10).text(`${d.label} ${(d.v*100).toFixed(0)}%`);
    });
  } else {
    const {w,h}=dims(sel);
    const r=Math.min(w*.38,h*.44);
    const g=svg.select('g');
    const pie=d3.pie().value(d=>d.v).sort(null);
    const arc=d3.arc().innerRadius(r*.52).outerRadius(r);
    g.selectAll('path').data(pie(data))
      .transition().duration(800)
      .attrTween('d',function(d){
        const i=d3.interpolate(this._current||d,d);
        this._current=i(1);
        return t=>arc(i(t));
      });
    const lg=svg.selectAll('g').filter(function(){return this!==g.node();});
    lg.selectAll('text').data(data)
      .transition().duration(800)
      .text(d=>`${d.label} ${(d.v*100).toFixed(0)}%`);
  }
}
function drawWaterfall(sel,data){
  clearSvg(sel);
  const {w,h}=dims(sel);
  const mg={t:10,r:14,b:28,l:40};
  const iw=w-mg.l-mg.r,ih=h-mg.t-mg.b;
  const svg=d3.select(sel).append('svg').attr('width',w).attr('height',h);
  const g=svg.append('g').attr('transform',`translate(${mg.l},${mg.t})`);
  const ext=d3.extent(data,d=>d.y);
  const ymax=Math.max(Math.abs(ext[0]),Math.abs(ext[1]))*1.15;
  const x=d3.scaleBand().domain(data.map(d=>d.x)).range([0,iw]).padding(.2);
  const y=d3.scaleLinear().domain([-ymax,ymax]).range([ih,0]);
  g.append('line').attr('x1',0).attr('x2',iw).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','rgba(255,255,255,.15)');
  g.append('g').attr('class','axis').attr('transform',`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((_,i)=>i%6===0)).tickSize(0)).select('.domain').remove();
  g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(4).tickFormat(v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v));
  g.selectAll('.wbar').data(data).join('rect')
    .attr('x',d=>x(d.x)).attr('y',d=>d.y>=0?y(d.y):y(0))
    .attr('width',x.bandwidth()).attr('height',d=>Math.abs(y(d.y)-y(0)))
    .attr('fill',d=>d.y>=0?'#5DCAA5':'#EF9F27').attr('rx',2).attr('opacity',.85);
}
function drawStackedArea(sel,data,keys){
  clearSvg(sel);
  const {w,h}=dims(sel);
  const mg={t:10,r:14,b:28,l:40};
  const iw=w-mg.l-mg.r,ih=h-mg.t-mg.b;
  const svg=d3.select(sel).append('svg').attr('width',w).attr('height',h);
  const g=svg.append('g').attr('transform',`translate(${mg.l},${mg.t})`);
  const x=d3.scalePoint().domain(data.map(d=>d.date)).range([0,iw]);
  const ymax=d3.max(data,d=>keys.reduce((s,k)=>s+d[k.key],0))*1.12;
  const y=d3.scaleLinear().domain([0,ymax]).range([ih,0]);
  g.append('g').attr('class','axis').attr('transform',`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((_,i)=>i%6===0)).tickSize(0)).select('.domain').remove();
  g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(4).tickFormat(v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v));
  let base=data.map(()=>0);
  keys.forEach(k=>{
    const areaData=data.map((d,i)=>({x:d.date,y0:base[i],y1:base[i]+d[k.key]}));
    const area=d3.area().x(d=>x(d.x)).y0(d=>y(d.y0)).y1(d=>y(d.y1)).curve(d3.curveMonotoneX);
    g.append('path').datum(areaData).attr('d',area).attr('fill',k.color).attr('opacity',.6);
    base=data.map((d,i)=>base[i]+d[k.key]);
  });
}
function drawDualLine(sel,data,l1,l2){
  clearSvg(sel);
  const {w,h}=dims(sel);
  const mg={t:10,r:44,b:28,l:40};
  const iw=w-mg.l-mg.r,ih=h-mg.t-mg.b;
  const svg=d3.select(sel).append('svg').attr('width',w).attr('height',h);
  const g=svg.append('g').attr('transform',`translate(${mg.l},${mg.t})`);
  const x=d3.scalePoint().domain(data.map(d=>d.x)).range([0,iw]);
  const y1=d3.scaleLinear().domain([0,d3.max(data,d=>d.y1)*1.2]).range([ih,0]);
  const y2=d3.scaleLinear().domain([0,100]).range([ih,0]);
  g.append('g').attr('class','axis').attr('transform',`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((_,i)=>i%6===0)).tickSize(0)).select('.domain').remove();
  g.append('g').attr('class','axis').call(d3.axisLeft(y1).ticks(4));
  g.append('g').attr('class','axis').attr('transform',`translate(${iw},0)`).call(d3.axisRight(y2).ticks(4));
  const line1=d3.line().x(d=>x(d.x)).y(d=>y1(d.y1)).curve(d3.curveMonotoneX);
  const line2=d3.line().x(d=>x(d.x)).y(d=>y2(d.y2)).curve(d3.curveMonotoneX);
  g.append('path').datum(data).attr('d',line1).attr('fill','none').attr('stroke','#5DCAA5').attr('stroke-width',2);
  g.append('path').datum(data).attr('d',line2).attr('fill','none').attr('stroke','#EF9F27').attr('stroke-width',2);
  g.append('text').attr('x',4).attr('y',-2).attr('fill','#5DCAA5').attr('font-size',9).text(l1);
  g.append('text').attr('x',iw-4).attr('y',-2).attr('fill','#EF9F27').attr('font-size',9).attr('text-anchor','end').text(l2);
}
function drawGeo(sel,sites){
  const el=document.querySelector(sel);
  if(!el)return;
  el.innerHTML='';
  const w=el.clientWidth||480,h=el.clientHeight||320;
  const svg=d3.select(sel).append('svg').attr('width',w).attr('height',h).style('background','#0a1520');
  const proj=d3.geoNaturalEarth1().scale(w/6.5).translate([w/2,h/2]);
  const path=d3.geoPath().projection(proj);
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world=>{
    svg.append('g').selectAll('path')
      .data(topojson.feature(world,world.objects.countries).features)
      .join('path').attr('d',path).attr('fill','#1a2a3a').attr('stroke','rgba(255,255,255,.08)').attr('stroke-width',.5);
    drawGeoBubbles(svg,proj,sites);
  }).catch(()=>drawGeoBubbles(svg,proj,sites));
}
function drawGeoBubbles(svg,proj,sites){
  const phaseColor={'pre':'#85B7EB','mid':'#EF9F27','final':'#5DCAA5'};
  const maxAmt=d3.max(sites,s=>s.score*50000);
  const r=d3.scaleSqrt().domain([0,maxAmt]).range([4,22]);
  const tip=d3.select('body').append('div').attr('class','map-tooltip').style('position','fixed').style('display','none').style('z-index','9999');
  svg.selectAll('.abub').data(sites).join('circle').attr('class','abub')
    .attr('cx',s=>{const p=proj([s.lng,s.lat]);return p?p[0]:0;})
    .attr('cy',s=>{const p=proj([s.lng,s.lat]);return p?p[1]:0;})
    .attr('r',s=>r(s.score*50000))
    .attr('fill',s=>phaseColor[s.phase]||'#5DCAA5').attr('opacity',.78)
    .attr('stroke','rgba(0,0,0,.4)').attr('stroke-width',1)
    .on('mousemove',function(e,s){
      tip.style('display','block').style('left',(e.clientX+12)+'px').style('top',(e.clientY-10)+'px')
        .html(`<strong>${s.name}</strong>${s.country}<br>得分 ${s.score}/10<br>拨付 ${fmtM(s.score*50000)}<br>阶段 ${{pre:'预拨',mid:'中期',final:'尾款'}[s.phase]||s.phase}`);
    })
    .on('mouseleave',()=>tip.style('display','none'));
}
})();



