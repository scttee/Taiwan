const stops = [
  {
    name: 'Taipei',
    coords: [25.033, 121.5654],
    note: 'Arrival buzz, route planning, and the first proper spin after putting the bike together.'
  },
  {
    name: 'Jiufen',
    coords: [25.1099, 121.8442],
    note: 'Lantern-lit streets, misty climbing, and one of those weather days that makes everything feel cinematic.'
  },
  {
    name: 'Hualien',
    coords: [23.9872, 121.6015],
    note: 'Huge east-coast scenery and the kind of riding that makes you stop constantly for photos.'
  },
  {
    name: 'Taitung',
    coords: [22.7583, 121.1444],
    note: 'A good reset: coffee, noodles, laundry, backed-up photos, and a gentler pace.'
  },
  {
    name: 'Kenting',
    coords: [21.9483, 120.7798],
    note: 'Palm trees, sun, and the bright south-coast finish-line feeling.'
  }
];

const map = L.map('map', {
  scrollWheelZoom: false,
  zoomControl: false
}).setView([23.8, 121], 7);

L.control
  .zoom({ position: 'bottomright' })
  .addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const route = L.polyline(
  stops.map((stop) => stop.coords),
  {
    color: '#e66a2b',
    weight: 7,
    opacity: 0.9,
    lineCap: 'round'
  }
).addTo(map);

stops.forEach((stop, index) => {
  const marker = L.circleMarker(stop.coords, {
    radius: 10,
    fillColor: index === stops.length - 1 ? '#41664d' : '#1e1814',
    color: '#fffaf1',
    weight: 3,
    fillOpacity: 1
  }).addTo(map);

  marker.bindPopup(`
    <strong>${stop.name}</strong><br />
    ${stop.note}
  `);
});

map.fitBounds(route.getBounds(), { padding: [36, 36] });
