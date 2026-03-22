// map.js — Leaflet map + hani overlay
(function(){
'use strict';

// UNESCO cultural heritage heatmap points [lat, lng, intensity]
const WH_HEAT=[
  [23.1,102.8,1],[13.41,103.87,1],[40.43,116.57,.9],[29.98,31.13,.9],[27.17,78.04,1],
  [41.89,12.49,.9],[37.97,23.73,.8],[48.86,2.35,.8],[51.18,1.83,.8],[53.35,-1.73,.7],
  [48.21,16.37,.8],[52.52,13.41,.8],[43.77,11.26,.8],[40.85,14.27,.8],[41.9,12.46,.8],
  [37.17,-3.6,.8],[40.42,-3.7,.8],[39.56,2.65,.8],[18.47,-69.95,.8],[17.91,-76.78,.7],
  [30.32,35.44,.9],[31.78,35.23,.8],[34.0,36.21,.8],[36.86,10.32,.8],[15.35,44.21,.9],
  [34.55,38.27,.95],[29.94,52.89,.8],[32.54,44.42,.8],[36.06,37.38,.8],[30.13,9.5,.8],
  [16.77,-3.0,.9],[12.36,-1.52,.8],[12.03,39.05,.9],[1.3,36.8,.8],[4.35,18.57,.7],
  [-1.95,30.06,.8],[15.55,32.53,.8],[-15.43,28.28,.7],[-18.92,47.54,.7],[9.05,7.49,.7],
  [-13.16,-72.54,1],[-22.91,-43.17,.8],[-15.78,-47.93,.7],[5.85,-55.17,.7],[-34.6,-58.37,.8],
  [-33.45,-70.67,.8],[4.93,-52.33,.7],[19.43,-99.13,.9],[20.96,-89.62,.9],[9.93,-84.08,.7],
  [25.08,-77.34,.8],[18.54,-72.34,.9],[13.45,-16.58,.7],[14.69,-17.44,.7],[7.37,-13.23,.7],
  [27.7,85.31,.9],[23.68,90.35,.8],[16.92,121.08,.9],[1.29,103.85,.7],[3.14,101.69,.7],
  [10.82,106.63,.7],[-8.34,115.09,.8],[-6.21,106.85,.7],[-7.25,112.75,.8],[14.08,108.27,.7],
  [35.7,51.42,.8],[41.3,69.27,.8],[39.65,66.96,.8],[43.32,45.7,.7],[55.75,37.62,.8],
  [56.32,44.0,.7],[59.95,30.32,.8],[50.45,30.52,.7],[48.92,24.71,.7],[52.23,21.01,.7],
  [50.08,14.43,.7],[47.5,19.04,.7],[44.43,26.1,.7],[42.7,23.32,.7],[41.99,21.43,.7],
  [53.9,27.57,.7],[54.69,25.28,.7],[59.44,24.75,.7],[56.95,24.1,.7],[54.37,18.61,.7],
];

let map,haniOpen=false;

window.initMap=function(){
  map=L.map('leaflet-map',{zoomControl:false,attributionControl:false});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
    maxZoom:18,subdomains:'abcd'
  }).addTo(map);
  map.setView([20,10],2);

  // Heatmap
  if(L.heatLayer){
    L.heatLayer(WH_HEAT,{radius:28,blur:20,maxZoom:6,max:1,
      gradient:{0.2:'#1a3a5c',0.5:'#2d7a6b',0.8:'#5DCAA5',1.0:'#a8f0d4'}
    }).addTo(map);
  }

  // Circle markers on hover
  const markers=WH_HEAT.slice(0,30).map(pt=>{
    const m=L.circleMarker([pt[0],pt[1]],{
      radius:4,fillColor:'#5DCAA5',color:'rgba(93,202,165,0.5)',
      weight:1,fillOpacity:.7
    }).addTo(map);
    return m;
  });

  // Hani polygon outline
  const haniPoly=L.polygon([[23.05,102.77],[23.15,102.77],[23.15,102.83],[23.05,102.83]],{
    color:'#5DCAA5',weight:2,fillColor:'#5DCAA5',fillOpacity:.08,
    dashArray:'6,4'
  });

  // Hani button click
  document.getElementById('hani-btn').addEventListener('click',function(){
    if(!haniOpen){
      openHani();
    } else {
      closeHani();
    }
  });

  function openHani(){
    haniOpen=true;
    map.flyTo([23.1,102.8],11,{duration:2.2,easeLinearity:.4});
    setTimeout(()=>{
      haniPoly.addTo(map);
      const panel=document.getElementById('hani-panel');
      panel.classList.add('open');
      document.getElementById('hani-btn').textContent='← 返回全球视图';
      document.getElementById('hani-btn').classList.add('reset');
    },2000);
  }

  function closeHani(){
    haniOpen=false;
    haniPoly.removeFrom(map);
    document.getElementById('hani-panel').classList.remove('open');
    document.getElementById('hani-btn').textContent='查看示例：哈尼梯田 →';
    document.getElementById('hani-btn').classList.remove('reset');
    setTimeout(()=>map.flyTo([20,10],2,{duration:2}),400);
  }

  document.getElementById('hani-close').addEventListener('click',closeHani);
};
})();
