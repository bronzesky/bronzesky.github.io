// HCCS Data Generator — seed-based, pre-generates all 30 days
// Seed = current YYYYMM so same month = same data
(function(){
'use strict';
const TODAY = new Date();
const SEED0 = TODAY.getFullYear()*100 + TODAY.getMonth()+1;
let _s = SEED0;
function rand(){_s=(_s*1664525+1013904223)&0xffffffff;return(_s>>>0)/4294967295;}
function ri(a,b){return Math.floor(rand()*(b-a+1))+a;}
function rf(a,b){return +(rand()*(b-a)+a).toFixed(2);}
function pick(a){return a[Math.floor(rand()*a.length)];}

// Date helpers
const DAY_MS=86400000;
const START=new Date(TODAY-29*DAY_MS); // 30 days ago
function dayDate(d){// d=0..29
  const dt=new Date(START.getTime()+d*DAY_MS);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}
function randTime(){return `${String(ri(8,22)).padStart(2,'0')}:${String(ri(0,59)).padStart(2,'0')}:${String(ri(0,59)).padStart(2,'0')}`;}

const BUYERS=['中石化','中国国航','中远海运','华润电力','中国华能','大唐发电','国家电投','中国铝业','宝武钢铁','中海油','平安集团','阿里巴巴','腾讯','比亚迪','宁德时代','华为','中国银行','工商银行','中国移动','中兴通讯'];
const HSITES=['哈尼梯田','黄山','武夷山','峨眉山','故宫','长城','敦煌莫高窟','西湖','丽江古城','吴哥窟','廷巴克图','马丘比丘','佩特拉','科隆大教堂','波罗浮屠'];
const TSITES=['故宫博物院','哈尼梯田','西湖景区','黄山景区','九寨沟','张家界','峨眉山','丽江古城','武夷山','敦煌莫高窟','布达拉宫','泰山','秦始皇陵','庐山','天坛','颐和园','少林寺','龙门石窟','宏村','碛口古镇'];
const ETYPES=['CCER履约抵消','CORSIA强制','ESG自愿认购'];
const ECOS=['中国国航','平安集团','华润电力','腾讯','阿里巴巴','中国移动','宝武钢铁','中远海运','国泰航空','香港电讯','新加坡航空','马来西亚航空','日本航空','韩国航空','壳牌亚太','BP亚洲','西门子','博世','施耐德电气','麦当劳中国'];
// Carbon trades: 30 days, 8-14 trades/day
const CARBON_TRADES=[];
for(let d=0;d<30;d++){
  const n=ri(8,14);
  for(let i=0;i<n;i++){
    const qty=ri(200,2500);
    const price=rf(55,88);
    CARBON_TRADES.push({day:d,date:dayDate(d),time:randTime(),buyer:pick(BUYERS),site:pick(HSITES),qty,price,total:Math.round(qty*price)});
  }
}
CARBON_TRADES.sort((a,b)=>a.day-b.day||(a.time>b.time?1:-1));

// Daily carbon volume & revenue
const CARBON_DAILY=Array.from({length:30},(_,d)=>{
  const rows=CARBON_TRADES.filter(r=>r.day===d);
  return{day:d,date:dayDate(d),vol:rows.reduce((s,r)=>s+r.qty,0),rev:rows.reduce((s,r)=>s+r.total,0)};
});
const CARBON_CUM=[];let cumC=0;
CARBON_DAILY.forEach(r=>{cumC+=r.rev;CARBON_CUM.push(cumC);});

// Tourism tax: 30 days, all sites
const TAX_RECORDS=[];
const SITE_BASE={'故宫博物院':18000,'哈尼梯田':3200,'西湖景区':12000,'黄山景区':5500,'九寨沟':2800,'张家界':4200,'峨眉山':3800,'丽江古城':9000,'武夷山':4600,'敦煌莫高窟':1800,'布达拉宫':2400,'泰山':6200,'秦始皇陵':8500,'庐山':3100,'天坛':10000,'颐和园':11000,'少林寺':4800,'龙门石窟':3900,'宏村':2200,'碛口古镇':900};
for(let d=0;d<30;d++){
  TSITES.forEach(site=>{
    const base=SITE_BASE[site]||2000;
    const visitors=ri(Math.round(base*.7),Math.round(base*1.3));
    TAX_RECORDS.push({day:d,date:dayDate(d),site,visitors,tax:Math.round(visitors*15)});
  });
}
const TAX_DAILY=Array.from({length:30},(_,d)=>{
  const rows=TAX_RECORDS.filter(r=>r.day===d);
  return{day:d,date:dayDate(d),rev:rows.reduce((s,r)=>s+r.tax,0)};
});

// ESG records: 30 days
const ESG_RECORDS=[];
for(let d=0;d<30;d++){
  const n=ri(2,6);
  for(let i=0;i<n;i++){
    const amount=ri(30000,500000);
    ESG_RECORDS.push({day:d,date:dayDate(d),company:pick(ECOS),type:pick(ETYPES),amount});
  }
}
const ESG_DAILY=Array.from({length:30},(_,d)=>{
  const rows=ESG_RECORDS.filter(r=>r.day===d);
  return{day:d,date:dayDate(d),rev:rows.reduce((s,r)=>s+r.amount,0)};
});
// Fund balance: starts at 135M, daily net inflow
const FUND_DAILY=[];
let bal=135000000;
for(let d=0;d<30;d++){
  const inflow=CARBON_DAILY[d].rev+TAX_DAILY[d].rev+ESG_DAILY[d].rev;
  const outflow=Math.round(inflow*rf(0.55,0.72));
  bal+=inflow-outflow;
  FUND_DAILY.push({day:d,date:dayDate(d),inflow,outflow,net:inflow-outflow,balance:bal});
}

// Allocation sites (25 real UNESCO cultural heritage sites)
const ALLOC_SITES=[
  {name:'廷巴克图',country:'MLI',lat:16.77,lng:-3.0,score:8.7,phase:'mid',verif:92},
  {name:'吴哥窟',country:'KHM',lat:13.41,lng:103.87,score:7.9,phase:'pre',verif:45},
  {name:'朱比特神庙（巴勒贝克）',country:'LBN',lat:34.0,lng:36.21,score:7.4,phase:'final',verif:100},
  {name:'莫恩布雷山文化景观',country:'HTI',lat:18.46,lng:-73.97,score:8.1,phase:'pre',verif:30},
  {name:'奥古斯丁伯纳迪诺修道院',country:'MEX',lat:19.3,lng:-99.08,score:6.8,phase:'mid',verif:78},
  {name:'查科文化国家历史公园',country:'USA',lat:36.06,lng:-107.96,score:6.2,phase:'pre',verif:55},
  {name:'孟加拉国清真寺城',country:'BGD',lat:24.74,lng:88.27,score:7.6,phase:'mid',verif:82},
  {name:'苏库尔巴拉考古遗址',country:'PAK',lat:27.55,lng:68.82,score:8.3,phase:'pre',verif:25},
  {name:'哈拉帕考古遗址',country:'PAK',lat:30.63,lng:72.86,score:7.1,phase:'final',verif:100},
  {name:'拉利贝拉岩石教堂',country:'ETH',lat:12.03,lng:39.05,score:8.9,phase:'mid',verif:88},
  {name:'罗宾岛',country:'ZAF',lat:-33.8,lng:18.37,score:5.9,phase:'final',verif:100},
  {name:'布基纳法索古要塞',country:'BFA',lat:11.15,lng:-4.3,score:8.4,phase:'pre',verif:20},
  {name:'苏里南中部自然保护区',country:'SUR',lat:4.0,lng:-56.0,score:6.5,phase:'mid',verif:70},
  {name:'丝绸之路：长安-天山廊道',country:'CHN/KAZ/KGZ',lat:39.9,lng:76.0,score:7.3,phase:'final',verif:97},
  {name:'哈尼梯田文化景观',country:'CHN',lat:23.1,lng:102.8,score:9.1,phase:'pre',verif:60},
  {name:'维龙加国家公园',country:'COD',lat:-1.45,lng:29.28,score:9.3,phase:'mid',verif:75},
  {name:'菲律宾科迪勒拉水稻梯田',country:'PHL',lat:16.92,lng:121.08,score:8.5,phase:'pre',verif:40},
  {name:'尼泊尔加德满都谷地',country:'NPL',lat:27.7,lng:85.31,score:7.8,phase:'mid',verif:85},
  {name:'也门萨那古城',country:'YEM',lat:15.35,lng:44.21,score:9.5,phase:'pre',verif:15},
  {name:'利比亚古城加达梅斯',country:'LBY',lat:30.13,lng:9.5,score:8.8,phase:'pre',verif:10},
  {name:'叙利亚帕尔米拉',country:'SYR',lat:34.55,lng:38.27,score:9.7,phase:'mid',verif:50},
  {name:'伊拉克萨迈拉古城',country:'IRQ',lat:34.2,lng:43.87,score:8.6,phase:'final',verif:95},
  {name:'佩特拉',country:'JOR',lat:30.32,lng:35.44,score:7.2,phase:'final',verif:100},
  {name:'波斯波利斯',country:'IRN',lat:29.94,lng:52.89,score:6.7,phase:'mid',verif:80},
  {name:'格罗宁根古运河城',country:'NLD',lat:53.22,lng:6.57,score:5.5,phase:'final',verif:100},
];
// Allocation amounts per site per day (30 days cycle)
const ALLOC_DAILY=ALLOC_SITES.map(site=>{
  const amounts=Array.from({length:30},(_,d)=>{
    const base=Math.round(site.score*50000*rf(0.8,1.2));
    return{day:d,date:dayDate(d),amount:base};
  });
  return{...site,amounts};
});

// EXPORT
window.HCCS={
  TODAY,START,dayDate,
  CARBON_TRADES,CARBON_DAILY,CARBON_CUM,
  TAX_RECORDS,TAX_DAILY,
  ESG_RECORDS,ESG_DAILY,
  FUND_DAILY,
  ALLOC_SITES,ALLOC_DAILY,
  // Summary stats
  totalCarbon:CARBON_DAILY.reduce((s,r)=>s+r.rev,0),
  totalTax:TAX_DAILY.reduce((s,r)=>s+r.rev,0),
  totalESG:ESG_DAILY.reduce((s,r)=>s+r.rev,0),
  finalBalance:FUND_DAILY[29].balance,
};
})();


