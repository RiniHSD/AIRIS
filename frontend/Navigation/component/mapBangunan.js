import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WebView from 'react-native-webview';

const Stack = createNativeStackNavigator();

const Titiklokasi = ({ route }) => {
  const { bangunan } = route.params;

  const [latitude, longitude] = bangunan.koordinat.split(',').map(coord => parseFloat(coord.trim()));

  useEffect(() => {
    console.log('Converted Longitude:', longitude);
    console.log('Converted Latitude:', latitude);
  }, [longitude, latitude]);

  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OpenLayers Map</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v10.2.1/ol.css" />
          <script src="https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js"></script>
          <style>
            #map { height: 100vh; width: 100%; }
            
            /* Layer switcher dropdown */
            .layer-switcher {
              position: absolute;
              top: 10px;
              right: 10px;
              background-color: white;
              padding: 8px;
              border-radius: 4px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
              z-index: 1000;  /* Ensure dropdown is above the map */
            }
            
            /* Reset button styles */
            .reset-orientation {
              position: absolute;
              bottom: 70px;
              right: 20px;
              background-color: white;
              padding: 5px;
              border-radius: 4px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
              cursor: pointer;
              z-index: 1000;  /* Ensure button is above the map */
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-weight: bold;
            }
  
            .reset-orientation:hover {
              background-color: #f0f0f0; /* Slight hover effect */
            }

            .legend-collapsible {
            position: absolute;
            bottom: 30px;
            left: 10px;
            background-color: white;
            padding: 8px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 1000;
          }
          
          .legend-toggle {
            background: none;
            border: none;
            padding: 0;
            font: inherit;
            cursor: pointer;
            font-weight: bold;
          }
          
          .legend-content {
            margin-top: 8px;
          }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <div class="layer-switcher">
            <select id="basemap-select">
              <option value="osm">OpenStreetMap</option>
              <option value="esriStreet">Esri Street</option>
              <option value="esriImagery">Esri Imagery</option>
              <option value="rbi">Rupa Bumi Indonesia</option>
            </select>
          </div>
          <div id="legend" style="
            position: absolute;
            bottom: 65px;
            left: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 1000;
          ">
          <strong>Legenda</strong>
          <div><span style="display:inline-block; width:20px; height:5px; background:#004da8;"></span> Induk Karangtalun</div>
            <div><span style="display:inline-block; width:20px; height:4px; background:#004da8;"></span> Primer</div>
            <div><span style="display:inline-block; width:20px; height:3px; background:#ff0000;"></span> Sekunder</div>
            <div><span style="display:inline-block; width:20px; height:2px; background:#a900e6;"></span> Tersier</div>
            <div>
              <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:green; margin-right:6px;"></span>
              Bangunan berada di saluran
            </div>
            <div>
              <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:red; margin-right:6px;"></span>
              Bangunan di luar saluran
            </div>
          </div>
          <div class="reset-orientation" id="reset-button">
            <img id="reset-icon" src="https://img.icons8.com/?size=100&id=PqCechdca3bU&format=png&color=000000" alt="Reset Orientation" style="width: 30px; height: 30px;" />
          </div>
          <div id="popup-warning" style="
            display:none;
            position: fixed;
            bottom: 340px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #fff3cd;
            color: #856404;
            padding: 12px 20px;
            border: 1px solid #ffeeba;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 9999;
            font-weight: bold;
            text-align: center;
          ">
            <div style="font-size: 16px; margin-bottom: 4px;">⚠️ PERINGATAN!</div>
            <div id="popup-message" style="font-size: 14px; font-weight: normal;"></div>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/ol@v10.2.1/dist/ol.js"></script>
          <script>
            // Basemap layers
            const basemaps = {
              'osm': new ol.layer.Tile({
                source: new ol.source.OSM()
              }),
              'esriStreet': new ol.layer.Tile({
                source: new ol.source.XYZ({
                  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
                })
              }),
              'esriImagery': new ol.layer.Tile({
                source: new ol.source.XYZ({
                  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                })
              }),
              'rbi': new ol.layer.Tile({
                source: new ol.source.XYZ({
                  url: 'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/tile/{z}/{y}/{x}'
                })
              })
            };
  
            // Create map and add default basemap
            const map = new ol.Map({
              target: 'map',
              layers: [basemaps['osm']],  // Default basemap
              view: new ol.View({
                center: ol.proj.fromLonLat([${longitude}, ${latitude}]),
                zoom: 18,
                rotation: 0  // Default rotation (north up)
              })
            });
  
            // Add point feature
            const pointFeature = new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat([${longitude}, ${latitude}])),
              name: '${bangunan.name}'
            });
  
            const vectorLayer = new ol.layer.Vector({
              source: new ol.source.Vector({
                features: [pointFeature]
              }),
              style: new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 6,
                  fill: new ol.style.Fill({ color: 'blue' }),
                  stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                }),
                text: new ol.style.Text({
                  text: pointFeature.get('name'),
                  font: 'bold 12px sans-serif',
                  fill: new ol.style.Fill({ color: '#000' }),
                  offsetY: -20
                })
              })
            });
            map.addLayer(vectorLayer);

            function showWarning(message) {
              const popup = document.getElementById('popup-warning');
              const text = document.getElementById('popup-message');
            
              text.textContent = message;
              popup.style.display = 'block';
            
              setTimeout(() => {
                popup.style.display = 'none';
              }, 4000);
            }
            
            
            // Load saluran.geojson dari folder assets
            fetch('https://rinihsd.github.io/WebView-AIRIS/assets/saluran.geojson')
              .then(res => res.json())
              .then(data => {
                const point = turf.point([${longitude}, ${latitude}]);
                let minDistance = Infinity;

                // 1. Hitung jarak minimum
                data.features.forEach(feature => {
                  try {
                    if (feature.geometry.type === 'MultiLineString') {
                      feature.geometry.coordinates.forEach(coordsArray => {
                        const cleanCoords = coordsArray.map(coord => [coord[0], coord[1]]);
                        const line = turf.lineString(cleanCoords);
                        
                        if (cleanCoords.length >= 2) {
                          const distance = turf.pointToLineDistance(point, line, { units: 'meters' });
                          if (distance < minDistance) minDistance = distance;
                        }
                      });
                    }
                  } catch (e) {
                    console.error('Error processing feature:', e);
                  }
                });

                if (minDistance === Infinity) {
                  minDistance = 9999;
                  console.warn('No valid LineString features found');
                }

                const isOnLine = minDistance <= 5;
                
                const message = isOnLine
                  ? '✅ Bangunan berada di saluran irigasi (Jarak: ' + minDistance.toFixed(3) + ' m)'
                  : '❌ Bangunan TIDAK berada di saluran (Jarak: ' + minDistance.toFixed(3) + ' m)';
                
                showWarning(message);

                // 2. TAMPILKAN SALURAN DI PETA (kode yang hilang)
                const saluranLayer = new ol.layer.Vector({
                  source: new ol.source.Vector({
                    features: new ol.format.GeoJSON().readFeatures(data, {
                      featureProjection: 'EPSG:3857'
                    })
                  }),
                  style: function(feature) {
                    const tingkat = feature.get('tingkat') ? feature.get('tingkat').toLowerCase() : '';
                    
                    let warna = '#000000'; // default hitam
                    let tebal = 2; // default
                    
                    if (tingkat.includes('primer')) {
                      warna = '#004da8';
                      tebal = 4;
                    } else if (tingkat.includes('sekunder')) {
                      warna = '#ff0000';
                      tebal = 3;
                    } else if (tingkat.includes('tersier')) {
                      warna = '#a900e6';
                      tebal = 2;
                    } else if (tingkat.includes('karangtalun')) {
                      warna = '#004da8';
                      tebal = 5;
                    }
                    
                    return new ol.style.Style({
                      stroke: new ol.style.Stroke({
                        color: warna,
                        width: tebal
                      })
                    });
                  }
                });
                map.addLayer(saluranLayer);

                // 3. UBAH WARNA TITIK BERDASARKAN HASIL VALIDASI
                pointFeature.setStyle(new ol.style.Style({
                  image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: isOnLine ? 'green' : 'red' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                  }),
                  text: new ol.style.Text({
                    text: pointFeature.get('name'),
                    font: 'bold 12px sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    offsetY: -20
                  })
                }));

              })
              .catch(err => {
                alert('❌ Gagal memuat saluran.geojson: ' + err.message);
                console.error(err);
              });


            // Layer switcher logic
            const basemapSelect = document.getElementById('basemap-select');
            basemapSelect.addEventListener('change', function() {
              const selectedBasemap = basemapSelect.value;
              map.getLayers().setAt(0, basemaps[selectedBasemap]);
            });
  
            // Reset orientation function
            document.getElementById('reset-button').addEventListener('click', () => {
              const view = map.getView();
              view.setRotation(0);  // Set rotation to 0 (north up)
            });

            // Update reset-icon rotation to follow map rotation (compass effect)
            map.getView().on('change:rotation', function() {
              const rotation = map.getView().getRotation();
              const degrees = -rotation * (-180 / Math.PI); // convert radians to degrees (negative to match compass effect)
              document.getElementById('reset-icon').style.transform = 'rotate(' + degrees + 'deg)';
            });

          </script>
        </body>
      </html>
    `;
  };
  

  return ( 
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  webview: {
    flex: 1,
  },
});

export default Titiklokasi;
