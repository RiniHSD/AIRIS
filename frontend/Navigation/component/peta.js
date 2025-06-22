import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

const dmsToDecimal = (dms, isLatitude = false) => {
  let isNegative = false;
  if (dms.startsWith('-')) {
    isNegative = true;
    dms = dms.substring(1);
  }

  const parts = dms.replace(/[^\d\w\.°'"]+/g, ' ').trim().split(/\s+/);

  const degrees = parseFloat(parts[0].replace('°', ''));
  const minutes = parseFloat(parts[1].replace('\'', ''));
  const seconds = parseFloat(parts[2].replace('\"', ''));

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (isLatitude && isNegative) {
    decimal = -decimal;
  }

  return decimal;
};

const Peta = ({ route }) => {
  const { dataPatok } = route.params; 
  const convertPoints = () => {
    return dataPatok.map((point) => {
      const longitude = dmsToDecimal(point.koordinat_bujur);
      const latitude = dmsToDecimal(point.koordinat_lintang, true);
      return {
        ...point,
        longitude,
        latitude,
      };
    });
  };

  const points = convertPoints();

  useEffect(() => {
    console.log('Converted Points:', points);
  }, [points]);

  const generateMapHTML = () => {
    const pointsJS = points.map(
      (point) => `
        new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([${point.longitude}, ${point.latitude}])),
          name: '${point.nama_titik}'
        })
      `
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>All Points Map</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v10.2.1/ol.css" />
          <style>
            #map { height: 100vh; width: 100%; }
            .layer-switcher {
              position: absolute;
              top: 10px;
              right: 10px;
              background-color: white;
              padding: 8px;
              border-radius: 4px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
              z-index: 1000;
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
              layers: [
                basemaps['osm'], // Default basemap
                new ol.layer.Vector({
                  source: new ol.source.Vector({
                    features: [${pointsJS.join(',')}]
                  }),
                  style: function(feature) {
                    return new ol.style.Style({
                      image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({ color: 'blue' }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                      }),
                      text: new ol.style.Text({
                        text: feature.get('name'),
                        font: 'bold 12px sans-serif',
                        fill: new ol.style.Fill({ color: '#000' }),
                        offsetY: -20,
                      })
                    });
                  }
                })
              ],
              view: new ol.View({
                center: ol.proj.fromLonLat([${points[0].longitude}, ${points[0].latitude}]),
                zoom: 18
              })
            });

            // Handle basemap change
            document.getElementById('basemap-select').addEventListener('change', function() {
              const selectedBasemap = this.value;
              map.getLayers().setAt(0, basemaps[selectedBasemap]);
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
  },
  webview: {
    flex: 1,
  },
});

export default Peta;
