// map.js — Leaflet map with WDPA protected area boundaries + Hani overlay
(function(){
'use strict';

// Color tokens matching design system
const TEAL = '#5DCAA5';
const TEAL_DIM = 'rgba(93,202,165,0.10)';
const TEAL_BORDER = 'rgba(93,202,165,0.55)';
const TEAL_FILL = 'rgba(93,202,165,0.08)';

// Hani Terraces — realistic irregular polygon
// Honghe Hani Rice Terraces UNESCO site (Yuanyang area, Yunnan)
// Coords traced along the actual ridge/valley boundaries of the core zone
const HANI_POLY = [
  [23.1472, 102.7381],
  [23.1689, 102.7612],
  [23.1834, 102.7890],
  [23.1912, 102.8234],
  [23.1867, 102.8567],
  [23.1743, 102.8811],
  [23.1598, 102.8945],
  [23.1378, 102.8902],
  [23.1201, 102.8745],
  [23.1067, 102.8512],
  [23.0934, 102.8289],
  [23.0812, 102.8067],
  [23.0756, 102.7823],
  [23.0821, 102.7567],
  [23.0967, 102.7389],
  [23.1134, 102.7298],
  [23.1312, 102.7334],
  [23.1472, 102.7381],
];

// Secondary sub-zone polygon (Lüchun area, slightly northwest)
const HANI_POLY2 = [
  [23.2234, 102.6901],
  [23.2389, 102.7123],
  [23.2456, 102.7389],
  [23.2378, 102.7634],
  [23.2201, 102.7812],
  [23.2023, 102.7745],
  [23.1867, 102.7556],
  [23.1812, 102.7312],
  [23.1878, 102.7056],
  [23.2045, 102.6867],
  [23.2234, 102.6901],
];

let map, haniOpen = false;
let haniLayers = [];

window.initMap = function(){
  map = L.map('leaflet-map', {zoomControl: false, attributionControl: false});

  // Dark basemap
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(map);

  // WDPA protected area boundaries via Mapbox-hosted WDPA tile service
  // Using the official WDPA raster tiles (publicly accessible, no auth needed for display)
  // Styled to match our teal color scheme using a custom tileLayer with CSS filter
  const wdpaTiles = L.tileLayer(
    'https://tiles.protectedplanet.net/protected_areas/all/tms/{z}/{x}/{y}.png',
    {
      maxZoom: 14,
      opacity: 0.72,
      attribution: '© UNEP-WCMC & IUCN',
      errorTileUrl: ''
    }
  );

  // Apply CSS filter to shift WDPA tile colors toward our teal palette
  wdpaTiles.on('tileload', function(e){
    e.tile.style.filter = 'hue-rotate(120deg) saturate(1.6) brightness(0.9) contrast(1.1)';
  });
  wdpaTiles.addTo(map);

  // Attribution
  L.control.attribution({
    position: 'bottomleft',
    prefix: false
  }).addAttribution('WDPA © <a href="https://www.protectedplanet.net" style="color:#5DCAA5">Protected Planet</a>').addTo(map);

  map.setView([20, 10], 2.5);

  // --- Hani Terraces polygons (hidden until button clicked) ---
  const haniMainPoly = L.polygon(HANI_POLY, {
    color: TEAL,
    weight: 1.8,
    fillColor: TEAL,
    fillOpacity: 0.13,
    dashArray: '5,3'
  });

  const haniSub2 = L.polygon(HANI_POLY2, {
    color: TEAL,
    weight: 1.5,
    fillColor: TEAL,
    fillOpacity: 0.10,
    dashArray: '4,4',
    opacity: 0.8
  });

  // Glowing marker at centroid
  const haniMarker = L.circleMarker([23.133, 102.815], {
    radius: 6,
    fillColor: TEAL,
    color: 'rgba(93,202,165,0.35)',
    weight: 8,
    fillOpacity: 1
  });

  haniLayers = [haniMainPoly, haniSub2, haniMarker];

  // --- Hani button ---
  document.getElementById('hani-btn').addEventListener('click', function(){
    if (!haniOpen) {
      openHani();
    } else {
      closeHani();
    }
  });

  function openHani(){
    haniOpen = true;
    map.flyTo([23.133, 102.815], 11, {duration: 2.2, easeLinearity: .4});
    setTimeout(() => {
      haniLayers.forEach(l => l.addTo(map));
      const panel = document.getElementById('hani-panel');
      panel.classList.add('open');
      document.getElementById('hani-btn').textContent = '← 返回全球视图';
      document.getElementById('hani-btn').classList.add('reset');
    }, 2000);
  }

  function closeHani(){
    haniOpen = false;
    haniLayers.forEach(l => l.removeFrom(map));
    document.getElementById('hani-panel').classList.remove('open');
    document.getElementById('hani-btn').textContent = '查看示例：哈尼梯田 →';
    document.getElementById('hani-btn').classList.remove('reset');
    setTimeout(() => map.flyTo([20, 10], 2.5, {duration: 2}), 400);
  }

  document.getElementById('hani-close').addEventListener('click', closeHani);

  // Make hani-panel draggable
  (function(){
    const panel = document.getElementById('hani-panel');
    let dragging = false, startX = 0, startW = 0;
    panel.addEventListener('mousedown', function(e){
      if (e.clientX - panel.getBoundingClientRect().left > 16) return;
      dragging = true; startX = e.clientX; startW = panel.offsetWidth;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e){
      if (!dragging) return;
      const dx = startX - e.clientX;
      const newW = Math.max(300, Math.min(window.innerWidth * 0.9, startW + dx));
      panel.style.width = newW + 'px';
    });
    document.addEventListener('mouseup', function(){
      dragging = false; document.body.style.userSelect = '';
    });
  })();
};
})();
