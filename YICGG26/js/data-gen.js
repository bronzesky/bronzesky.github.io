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

const BUYERS=['Sinopec','Air China','COSCO Shipping','CR Power','CHN Energy','Datang Power','SPIC','Chalco','Baowu Steel','CNOOC','Ping An Group','Alibaba','Tencent','BYD','CATL','Huawei','Bank of China','ICBC','China Mobile','ZTE'];
const HSITES=['Hani Rice Terraces','Huangshan','Wuyi Mountains','Mount Emei','Forbidden City','Great Wall','Dunhuang Mogao Caves','West Lake','Old Town of Lijiang','Angkor Wat','Timbuktu','Machu Picchu','Petra','Cologne Cathedral','Borobudur'];
const TSITES=['Palace Museum','Hani Rice Terraces','West Lake','Huangshan','Jiuzhaigou','Zhangjiajie','Mount Emei','Old Town of Lijiang','Wuyi Mountains','Dunhuang Mogao Caves','Potala Palace','Mount Tai','Qin Shi Huang Mausoleum','Mount Lu','Temple of Heaven','Summer Palace','Shaolin Temple','Longmen Grottoes','Hongcun','Qikou Ancient Town'];
const ETYPES=['CCER Compliance Offset','CORSIA Mandatory','ESG Voluntary Subscription'];
const ECOS=['Air China','Ping An Group','CR Power','Tencent','Alibaba','China Mobile','Baowu Steel','COSCO Shipping','Cathay Pacific','HKT','Singapore Airlines','Malaysia Airlines','Japan Airlines','Korean Air','Shell Asia Pacific','BP Asia','Siemens','Bosch','Schneider Electric','McDonald\'s China'];
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
const SITE_BASE={'Palace Museum':18000,'Hani Rice Terraces':3200,'West Lake':12000,'Huangshan':5500,'Jiuzhaigou':2800,'Zhangjiajie':4200,'Mount Emei':3800,'Old Town of Lijiang':9000,'Wuyi Mountains':4600,'Dunhuang Mogao Caves':1800,'Potala Palace':2400,'Mount Tai':6200,'Qin Shi Huang Mausoleum':8500,'Mount Lu':3100,'Temple of Heaven':10000,'Summer Palace':11000,'Shaolin Temple':4800,'Longmen Grottoes':3900,'Hongcun':2200,'Qikou Ancient Town':900};
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
  {name:'Timbuktu',country:'MLI',lat:16.77,lng:-3.0,score:8.7,phase:'mid',verif:92},
  {name:'Angkor Wat',country:'KHM',lat:13.41,lng:103.87,score:7.9,phase:'pre',verif:45},
  {name:'Temple of Jupiter (Baalbek)',country:'LBN',lat:34.0,lng:36.21,score:7.4,phase:'final',verif:100},
  {name:'Morne Bruant Cultural Landscape',country:'HTI',lat:18.46,lng:-73.97,score:8.1,phase:'pre',verif:30},
  {name:'Augustinian Convent of Acolman',country:'MEX',lat:19.3,lng:-99.08,score:6.8,phase:'mid',verif:78},
  {name:'Chaco Culture NHP',country:'USA',lat:36.06,lng:-107.96,score:6.2,phase:'pre',verif:55},
  {name:'Mosque City of Bagerhat',country:'BGD',lat:24.74,lng:88.27,score:7.6,phase:'mid',verif:82},
  {name:'Sukkur Barrage Archaeological Site',country:'PAK',lat:27.55,lng:68.82,score:8.3,phase:'pre',verif:25},
  {name:'Harappa Archaeological Site',country:'PAK',lat:30.63,lng:72.86,score:7.1,phase:'final',verif:100},
  {name:'Rock-Hewn Churches of Lalibela',country:'ETH',lat:12.03,lng:39.05,score:8.9,phase:'mid',verif:88},
  {name:'Robben Island',country:'ZAF',lat:-33.8,lng:18.37,score:5.9,phase:'final',verif:100},
  {name:'Ancient Fortresses of Burkina Faso',country:'BFA',lat:11.15,lng:-4.3,score:8.4,phase:'pre',verif:20},
  {name:'Central Suriname Nature Reserve',country:'SUR',lat:4.0,lng:-56.0,score:6.5,phase:'mid',verif:70},
  {name:'Silk Roads: Chang\'an–Tianshan Corridor',country:'CHN/KAZ/KGZ',lat:39.9,lng:76.0,score:7.3,phase:'final',verif:97},
  {name:'Hani Rice Terraces Cultural Landscape',country:'CHN',lat:23.1,lng:102.8,score:9.1,phase:'pre',verif:60},
  {name:'Virunga National Park',country:'COD',lat:-1.45,lng:29.28,score:9.3,phase:'mid',verif:75},
  {name:'Rice Terraces of the Philippine Cordilleras',country:'PHL',lat:16.92,lng:121.08,score:8.5,phase:'pre',verif:40},
  {name:'Kathmandu Valley',country:'NPL',lat:27.7,lng:85.31,score:7.8,phase:'mid',verif:85},
  {name:'Old City of Sana\'a',country:'YEM',lat:15.35,lng:44.21,score:9.5,phase:'pre',verif:15},
  {name:'Old Town of Ghadamès',country:'LBY',lat:30.13,lng:9.5,score:8.8,phase:'pre',verif:10},
  {name:'Site of Palmyra',country:'SYR',lat:34.55,lng:38.27,score:9.7,phase:'mid',verif:50},
  {name:'Samarra Archaeological City',country:'IRQ',lat:34.2,lng:43.87,score:8.6,phase:'final',verif:95},
  {name:'Petra',country:'JOR',lat:30.32,lng:35.44,score:7.2,phase:'final',verif:100},
  {name:'Persepolis',country:'IRN',lat:29.94,lng:52.89,score:6.7,phase:'mid',verif:80},
  {name:'Groningen Historic Canal City',country:'NLD',lat:53.22,lng:6.57,score:5.5,phase:'final',verif:100},
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


