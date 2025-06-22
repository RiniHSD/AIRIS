import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { CoordinateConverter, extractGGAInfo } from '../Helpers/geo_helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { selectStreamData } from '../config/streamSlice';
import { Picker } from '@react-native-picker/picker';
import CustomPicker from '../assets/CustomPicker';
import BASE_URL from '../config/url';


const CustomRadioButton = ({ label, selected, onSelect }) => (
  <TouchableOpacity
    onPress={onSelect}
    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
  >
    <View style={{
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    }}>
      {selected && (
        <View style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#00AEEF',
        }} />
      )}
    </View>
    <Text>{label}</Text>
  </TouchableOpacity>
);


const CustomCheckbox = ({ label, checked, onToggle }) => (
  <TouchableOpacity
    onPress={onToggle}
    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
  >
    <View style={{
      width: 20,
      height: 20,
      borderWidth: 1.5,
      borderColor: '#ccc', // warna border abu
      backgroundColor: checked ? '#00AEEF' : '#fff', // full biru saat dicentang
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      borderRadius: 4,
    }}>
      {checked && (
        <Text style={{ color: 'white', fontSize: 14 }}>✓</Text>
      )}
    </View>
    <Text>{label}</Text>
  </TouchableOpacity>
);

export default function SurveyPage() {
  const internalCoords = useSelector(state => selectStreamData(state, 'INTERNAL'));
  const streamDataGNGGA = useSelector(state => selectStreamData(state, 'GNGGA'));
  const [internalBackup, setInternalBackup] = useState(null);
  const internalData = internalCoords ?? internalBackup;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const [selectedJenisBangunan, setSelectedJenisBangunan] = useState([]);
  const [jenisLainnya, setJenisLainnya] = useState('');

  const saluranList = [
    'Saluran Primer Van Der Wijck',
    'Sekunder Cerbonan Kulon',
    'Sekunder Cerbonan Wetan',
    'Sekunder Gencahan', 
    'Sekunder Jamur Kulon', 
    'Sekunder Jamur Wetan', 
    'Sekunder Kergan', 
    'Sekunder Rewulu I', 
    'Sekunder Rewulu II', 
    'Sekunder Sedayu', 
    'Sekunder Sedayu Barat', 
    'Sekunder Sedayu Rewulu', 
    'Sekunder Sedayu Selatan', 
    'Sekunder Sendang Pitu',
    'Sekunder Brongkol',
  ];

  const [selectedLokasi, setSelectedLokasi] = useState('');
  const [isTersier, setIsTersier] = useState(false);

  const finalLokasi = isTersier
  ? `Saluran Tersier di ${selectedLokasi}`
  : selectedLokasi;

  const kondisiOptions = ['Baik', 'Rusak ringan', 'Rusak sedang', 'Rusak berat'];

  const [isSawah, setIsSawah] = useState(false);
  const [isKolam, setIsKolam] = useState(false);
  const [isKebun, setIsKebun] = useState(false);

  const kebutuhan = [
    isSawah ? 'Persawahan' : null,
    isKolam ? 'Kolam' : null,
    isKebun ? 'Perkebunan' : null
  ].filter(Boolean).join(', ');

  const toggleJenisBangunan = (item) => {
    setSelectedJenisBangunan(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };
  

  // Di Survey.js, tambahkan useEffect untuk mendengarkan perubahan
  useEffect(() => {
    const handleInternalUpdate = async () => {
      // Dapatkan data terbaru dari Redux
      const currentInternal = useSelector(state => state.streamData?.streams?.['INTERNAL']);
      
      // Juga periksa AsyncStorage sebagai fallback
      const saved = await AsyncStorage.getItem('internal_coords');
      const storedInternal = saved ? JSON.parse(saved) : null;
      
      // Prioritaskan data dari Redux, fallback ke AsyncStorage
      setInternalBackup(currentInternal || storedInternal);
      
      console.log('[Survey] Internal coords updated:', currentInternal || storedInternal);
    };

    const loadBackup = async () => {
      if (!internalCoords) {
        const saved = await AsyncStorage.getItem('internal_coords');
        if (saved) {
          setInternalBackup(JSON.parse(saved));
        }
      }
    };
    loadBackup();
    handleInternalUpdate();
  }, [internalCoords]); // Jalankan ulang ketika internalCoords berubah

  useEffect(() => {
    const fetchStoredInternal = async () => {
      const saved = await AsyncStorage.getItem('internal_coords');
      if (saved) {
        setInternalBackup(JSON.parse(saved));
      }
    };
    fetchStoredInternal();
  }, []);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [form, setForm] = useState({
    nama: '',
    jenis: '',
    tanggal: '',
    fungsi: '',
    bahan: '',
    kondisi: '',
    luasoncoran: '',
    luaskolam: '',
    luassawah: '',
    luaskebun: '',
    keterangantambahan: '',
    foto: '',
  });

  const namaBangunanOptions = [
    'Bangunan Intake',
    'Bangunan Ukur',
    'Bangunan Penguras',
    'Bangunan Bagi',
    'Bangunan Sadap',
    'Mercu Bendung',
    'Terjunan',
    'Lainnya'
  ];

  const [isBangunanBagi, setIsBangunanBagi] = useState(false);
  const [saluranBagi, setSaluranBagi] = useState([
    {
      namaSaluran: '',
      luasoncoran: '',
      luassawah: '',
      luaskolam: '',
      luaskebun: '',
    }
  ]);
  
  useEffect(() => {
    setIsBangunanBagi(selectedJenisBangunan.includes('Bangunan Bagi'));
  }, [selectedJenisBangunan]);  

  const tambahSaluranBagi = () => {
    setSaluranBagi([...saluranBagi, {
      namaSaluran: '',
      luasoncoran: '',
      luassawah: '',
      luaskolam: '',
      luaskebun: '',
    }]);
  };

  const hapusSaluranBagi = (index) => {
    const newSaluran = [...saluranBagi];
    newSaluran.splice(index, 1);
    setSaluranBagi(newSaluran);
  };

  const updateSaluranBagi = (index, field, value) => {
    const newSaluran = [...saluranBagi];
    newSaluran[index][field] = value;
    setSaluranBagi(newSaluran);
  };

  const cleanedJenis = selectedJenisBangunan.map(j =>
    j === 'Lainnya' ? jenisLainnya : j
  ).filter(Boolean).join(', ');
  


  const renderBangunanBagiForm = () => {
    if (!isBangunanBagi) return null;

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>Informasi Pembagian Air</Text>
        {saluranBagi.map((saluran, index) => (
          <View key={index} style={styles.saluranContainer}>
            <Text style={styles.saluranTitle}>Saluran {index + 1}</Text>
            
            <Text style={styles.label}>Nama Saluran</Text>
            <CustomPicker
              selectedValue={saluran.namaSaluran}
              onValueChange={(itemValue) => 
                updateSaluranBagi(index, 'namaSaluran', itemValue)
              }
            >
              <Picker.Item label="Pilih Saluran" value="" />
              {saluranList.map((item) => (
                <Picker.Item key={item} label={item} value={item} />
              ))}
            </CustomPicker>

            <Text style={styles.label}>Luas Oncoran (Ha)</Text>
            <TextInput
              style={styles.input}
              value={saluran.luasoncoran}
              keyboardType="numeric"
              onChangeText={(v) => updateSaluranBagi(index, 'luasoncoran', v)}
            />

            <Text style={styles.label}>Luas Persawahan (Ha)</Text>
            <TextInput
              style={styles.input}
              value={saluran.luassawah}
              keyboardType="numeric"
              onChangeText={(v) => updateSaluranBagi(index, 'luassawah', v)}
            />

            <Text style={styles.label}>Luas Kolam (Ha)</Text>
            <TextInput
              style={styles.input}
              value={saluran.luaskolam}
              keyboardType="numeric"
              onChangeText={(v) => updateSaluranBagi(index, 'luaskolam', v)}
            />

            <Text style={styles.label}>Luas Perkebunan (Ha)</Text>
            <TextInput
              style={styles.input}
              value={saluran.luaskebun}
              keyboardType="numeric"
              onChangeText={(v) => updateSaluranBagi(index, 'luaskebun', v)}
            />

            {saluranBagi.length > 1 && (
              <TouchableOpacity 
                style={styles.hapusButton}
                onPress={() => hapusSaluranBagi(index)}
              >
                <Text style={styles.hapusButtonText}>Hapus Saluran</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.tambahButton}
          onPress={tambahSaluranBagi}
        >
          <Text style={styles.tambahButtonText}>Tambah Saluran</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderNamaBangunanForm = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Jenis Bangunan</Text>
      {namaBangunanOptions.map((item) => (
        <CustomCheckbox
          key={item}
          label={item}
          checked={selectedJenisBangunan.includes(item)}
          onToggle={() => toggleJenisBangunan(item)}
        />
      ))}
  
      {selectedJenisBangunan.includes('Lainnya') && (
        <>
          <Text style={styles.label}>Nama Bangunan Lainnya</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Talang Silang"
            placeholderTextColor="gray"
            value={jenisLainnya}
            onChangeText={setJenisLainnya}
          />
        </>
      )}
    </View>
  );
  

  const renderKondisiFisikForm = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Kondisi Fisik</Text>
      <CustomPicker
        selectedValue={form.kondisi}
        prompt="Pilih kondisi fisik"
        onValueChange={(itemValue) => setForm({...form, kondisi: itemValue})}
      >
        {kondisiOptions.map((item) => (
          <Picker.Item key={item} label={item} value={item} />
        ))}
      </CustomPicker>
    </View>
  );
  
  let gnssCoords = null;
  let altitude = null;
  let hdop = null;

  try {
    if (streamDataGNGGA) {
      gnssCoords = CoordinateConverter(streamDataGNGGA);
      const info = extractGGAInfo(streamDataGNGGA);
      altitude = info.altitude;
      hdop = info.hdop;
    }
  } catch (error) {
    console.error('Error parsing streamDataGNGGA:', error);
  }

  const handleImagePick = (name) => {
    Alert.alert(
      'Pilih Sumber Gambar',
      'Mengambil gambar dari:',
      [
        {
          text: 'Kamera',
          onPress: () => {
            const options = {
              mediaType: 'photo',
              includeBase64: true,
            };
            launchCamera(options, async (response) => {
              if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                try {
                  const uploadedUrl = await uploadImageToServer(uri);
                  console.log('✅ Upload sukses, URL:', uploadedUrl);
                  setForm((prev) => ({ ...prev, [name]: uploadedUrl }));
                } catch (err) {
                  console.error('❌ Upload gagal:', err);
                  Alert.alert('Upload Gagal', err.message);
                }
              }
            }); 
          },
        },
        {
          text: 'Galeri',
          onPress: async () => {
            const options = { mediaType: 'photo', includeBase64: true };
            launchImageLibrary(options, async (response) => {
              if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                try {
                  const uploadedUrl = await uploadImageToServer(uri);
                  console.log('✅ Upload sukses, URL:', uploadedUrl);
                  setForm((prev) => ({ ...prev, [name]: uploadedUrl }));
                } catch (err) {
                  console.error('❌ Upload gagal:', err);
                  Alert.alert('Upload Gagal', err.message);
                }
              }
            });
          }
        },   
        {
          text: 'Batal',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const renderImage = (imageUri) => {
    if (isLoadingImage) {
      return <ActivityIndicator size="large" color="#007AFF" />;
    }

    if (imageUri) {
      return <Image source={{ uri: imageUri }} style={styles.imagePreview} />;
    }
  
    return <Image source={require('../assets/icons/camera.png')} style={styles.imageIcon} />;
  };
  
  const handleSubmit = async () => {
    let id_user = null;

    try {
      const userId = await AsyncStorage.getItem('userId');
      id_user = parseInt(userId, 10);
    } catch (err) {
      console.error('Gagal mengambil userId dari AsyncStorage:', err.message);
      Alert.alert('Error', 'Gagal mengambil informasi pengguna.');
      return;
    }

    const data = {
      ...form,
      koordinat: `${latitude}, ${longitude}`,
      lokasi: finalLokasi,
      jeniskebutuhan: kebutuhan,
      id_user,
      luassawah: form.luassawah,
      luaskebun: form.luaskebun,
      foto: form.foto,
      jenis: cleanedJenis,
    };

    if (isBangunanBagi) {
      data.saluranBagi = saluranBagi;
    }

    console.log('Data yang dikirim:', data);
  
    try {
      const res = await fetch(`${BASE_URL}/auth/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan data');
      Alert.alert('Sukses', 'Data berhasil disimpan', [
        { text: 'OK', onPress: resetForm }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const uploadImageToServer = async (uri) => {
    setIsLoadingImage(true); // mulai loading

    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
  
    const formData = new FormData();
    formData.append('photo', {  // <-- harus 'photo' sesuai backend
      uri,
      name: filename,
      type,
    });
  
    const res = await fetch(`${BASE_URL}/auth/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    const json = await res.json();
    setIsLoadingImage(false); // selesai loading
  
    if (!res.ok) throw new Error(json.error || 'Upload gagal');
  
    return json.fileUrl; // harus sesuai key yang dikirim backend
  };

  const renderCardEksternal = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>Posisi GPS Geodetik (Presisi)</Text>
      </View>
      <Text>Latitude  : {gnssCoords?.latitude ?? '-'}</Text>
      <Text>Longitude : {gnssCoords?.longitude ?? '-'}</Text>
      <Text>Altitude  : {altitude != null ? `${altitude} m` : '-'}</Text>
      <Text>Akurasi  : {hdop != null ? `${hdop} m` : '-'}</Text>

      <TouchableOpacity
          style={styles.recordButtonSmall}
          onPress={() => {
            if (gnssCoords?.latitude && gnssCoords?.longitude) {
              setLatitude(gnssCoords.latitude.toString());
              setLongitude(gnssCoords.longitude.toString());
            } else {
              setLatitude('Tidak ada koordinat eksternal');
              setLongitude('Tidak ada koordinat eksternal');
            }
          }}
        >
          <Text style={styles.recordTextSmall}>Rekam</Text>
        </TouchableOpacity>
    </View>
  );

  const renderCardInternal = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>Posisi Internal (Non Presisi)</Text>
      </View>
      <Text>Latitude  : {internalData?.latitude != null ? internalData.latitude.toFixed(10) : 'Koordinat internal belum tersedia'}</Text>
      <Text>Longitude : {internalData?.longitude != null ? internalData.longitude.toFixed(10) : 'Koordinat internal belum tersedia'}</Text>
      <Text>Altitude  : {internalData?.altitude != null ? internalData.altitude.toFixed(2) + ' m' : 'Koordinat internal belum tersedia'}</Text>
      <Text>Akurasi : {internalData?.accuracy != null ? internalData.accuracy.toFixed(2) + ' m' : 'Koordinat internal belum tersedia'}</Text>

      <TouchableOpacity
          style={styles.recordButtonSmall}
          onPress={() => {
            if (internalData?.latitude && internalData?.longitude) {
              // setSelectedCoords(`${internalData.latitude}, ${internalData.longitude}`);
              setLatitude(internalData.latitude.toString());
              setLongitude(internalData.longitude.toString());
            } else {
              setLatitude('Tidak ada koordinat internal');
              setLongitude('Tidak ada koordinat internal');
            }
          }}
        >
          <Text style={styles.recordTextSmall}>Rekam</Text>
        </TouchableOpacity>
    </View>
  );

  const resetForm = () => {
    setForm({
      nama: '',
      jenis: '',
      fungsi: '',
      bahan: '',
      kondisi: '',
      luassawah: '',
      luaskebun: '',
      luaskolam: '',
      luasoncoran: '',
      keterangantambahan: '',
      foto: '',
    });
  
    setSelectedLokasi('');
    setIsTersier(false);
    setIsSawah(false);
    setIsKolam(false);
    setIsKebun(false);
    setSelectedLokasi('');
    setLatitude('');
    setLongitude('');
    setJenisLainnya('');
    setSelectedJenisBangunan([]);
  };

  const CoordinateTable = () => {
    return (
      <View style={styles.tableContainer}>
        {/* Header */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.headerCell, styles.firstColumn]}></View>
          <View style={[styles.tableCell, styles.headerCell]}>
            <Text style={styles.headerText}>Koordinat Presisi</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell]}>
            <Text style={styles.headerText}>Koordinat Non Presisi</Text>
          </View>
        </View>
        
        {/* Latitude */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.labelCell]}>
            <Text style={styles.labelText}>Latitude</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>{gnssCoords?.latitude ?? '-'}</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>
              {internalData?.latitude != null ? internalData.latitude.toFixed(10) : '-'}
            </Text>
          </View>
        </View>
        
        {/* Longitude */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.labelCell]}>
            <Text style={styles.labelText}>Longitude</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>{gnssCoords?.longitude ?? '-'}</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>
              {internalData?.longitude != null ? internalData.longitude.toFixed(10) : '-'}
            </Text>
          </View>
        </View>
        
        {/* Altitude */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.labelCell]}>
            <Text style={styles.labelText}>Altitude</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>{altitude != null ? `${altitude} m` : '-'}</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>
              {internalData?.altitude != null ? `${internalData.altitude.toFixed(2)} m` : '-'}
            </Text>
          </View>
        </View>
        
        {/* Akurasi */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.labelCell]}>
            <Text style={styles.labelText}>Akurasi</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>{hdop != null ? `${hdop} m` : '-'}</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text style={styles.dataText}>
              {internalData?.accuracy != null ? `${internalData.accuracy.toFixed(2)} m` : '-'}
            </Text>
          </View>
        </View>
        
        {/* Tombol Rekam */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.labelCell]}></View>
          <View style={[styles.tableCell, styles.buttonCell]}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={() => {
                if (gnssCoords?.latitude && gnssCoords?.longitude) {
                  setLatitude(gnssCoords.latitude.toString());
                  setLongitude(gnssCoords.longitude.toString());
                } else {
                  setLatitude('Tidak ada koordinat eksternal');
                  setLongitude('Tidak ada koordinat eksternal');
                }
              }}
            >
              <Text style={styles.recordText}>Rekam</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.tableCell, styles.buttonCell]}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={() => {
                if (internalData?.latitude && internalData?.longitude) {
                  setLatitude(internalData.latitude.toString());
                  setLongitude(internalData.longitude.toString());
                } else {
                  setLatitude('Tidak ada koordinat internal');
                  setLongitude('Tidak ada koordinat internal');
                }
              }}
            >
              <Text style={styles.recordText}>Rekam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.cardsContainer}>
        <View style={styles.cardWrapper}>
          {renderCardEksternal()}
        </View>
        <View style={styles.cardWrapper}>
          {renderCardInternal()}
        </View>
      </View> */}

      <CoordinateTable />
      
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Kode Bangunan</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: BSP.7"
            placeholderTextColor="#999"
            value={form.nama}
            backgroundColor="white"
            onChangeText={v => setForm({ ...form, nama: v })}
          />
        </View>

        {renderNamaBangunanForm()}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Koordinat</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ width: 80 }}>Latitude:</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={latitude}
              keyboardType="numeric"
              onChangeText={setLatitude}
              editable={false}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ width: 80 }}>Longitude:</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={longitude}
              keyboardType="numeric"
              onChangeText={setLongitude}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tanggal Update</Text>
          <TouchableOpacity onPress={() => setOpen(true)}>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                value={form.tanggal}
                editable={false}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                pointerEvents="none"
              />
              <Image source={require('../assets/icons/calender.png')} style={styles.icon} />
            </View>
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          mode="date"
          open={open}
          date={selectedDate}
          onConfirm={(date) => {
            setOpen(false);
            setSelectedDate(date);
            setForm({ ...form, tanggal: date.toISOString().split('T')[0] });
          }}
          onCancel={() => setOpen(false)}
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fungsi Bangunan</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: mengalirkan air ke kolam"
            placeholderTextColor="#999"
            value={form.fungsi}
            backgroundColor="white"
            onChangeText={v => setForm({ ...form, fungsi: v })}
          />
        </View>

        {/* <View style={styles.formGroup}>
          <Text style={styles.label}>Bahan Bangunan</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: beton, kayu, dll"
              placeholderTextColor="#999"
              value={form.bahan}
              backgroundColor="white"
              onChangeText={v => setForm({ ...form, bahan: v })}
            />
        </View> */}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Lokasi Bangunan</Text>
          {saluranList.map(s => (
            <CustomRadioButton
              key={s}
              label={s}
              selected={selectedLokasi === s}
              onSelect={() => setSelectedLokasi(s)}
            />
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CustomCheckbox
            label="Saluran Tersier"
            checked={isTersier}
            onToggle={() => setIsTersier(!isTersier)}
          />
          </View>
        </View>

        {renderKondisiFisikForm()}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Luas Oncoran (Ha)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.luasoncoran}
            backgroundColor="white"
            onChangeText={v => setForm({ ...form, luasoncoran: v })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Jenis Kebutuhan</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CustomCheckbox label="Persawahan" checked={isSawah} onToggle={() => setIsSawah(!isSawah)} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CustomCheckbox label="Kolam" checked={isKolam} onToggle={() => setIsKolam(!isKolam)} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CustomCheckbox label="Perkebunan" checked={isKebun} onToggle={() => setIsKebun(!isKebun)} />
          </View>
        </View>

        {renderBangunanBagiForm()}

        {/* Form Luas Persawahan */}
        {!isBangunanBagi && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Luas Persawahan (Ha)</Text>
            <TextInput
              style={styles.input}
              value={form.luassawah}
              keyboardType="numeric"
              onChangeText={(v) => setForm({...form, luassawah: v})}
            />
          </View>
        )}

        {/* Form Luas Kolam */}
        {!isBangunanBagi && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Luas Kolam (Ha)</Text>
            <TextInput
              style={styles.input}
              value={form.luaskolam}
              keyboardType="numeric"
              onChangeText={(v) => setForm({...form, luaskolam: v})}
            />
          </View>
        )}

        {/* Form Luas Perkebunan */}
        {!isBangunanBagi && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Luas Perkebunan (Ha)</Text>
            <TextInput
              style={styles.input}
              value={form.luaskebun}
              keyboardType="numeric"
              onChangeText={(v) => setForm({...form, luaskebun: v})}
            />
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Keterangan Tambahan</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: bangunan tertutup semak"
            placeholderTextColor="#999"
            value={form.keterangantambahan}
            backgroundColor="white"
            onChangeText={v => setForm({ ...form, keterangantambahan: v })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Foto Dokumentasi</Text>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => handleImagePick('foto')} style={styles.imageUpload}>
              {renderImage(form.foto)}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: '#00AEEF', padding: 10, alignItems: 'center', borderRadius: 6 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>SIMPAN</Text>
        </TouchableOpacity>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  recordButtonSmall: {
    backgroundColor: '#00AEEF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  recordTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
  },
  form: {
    gap: 10,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 80,
  },
  label: {
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
  },
  formGroup: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 15,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    with: 200,
  },
  imageUpload: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 6,
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    paddingRight: 35, // beri ruang untuk icon
    backgroundColor: '#fff',
    color: 'black',
  },
  icon: {
    position: 'absolute',
    right: 10,
    width: 20,
    height: 20,
    tintColor: 'gray',
  },
  saluranContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  saluranTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  tambahButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 5,
  },
  tambahButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  hapusButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 5,
  },
  hapusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  recordButton: {
    backgroundColor: '#00AEEF',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  recordText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    padding: 10,
    justifyContent: 'center',
  },
  headerCell: {
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#0D47A1',
    textAlign: 'center',
    fontSize: 13,
  },
  labelCell: {
    backgroundColor: '#f5f5f5',
    width: '24%',
  },
  labelText: {
    fontWeight: '600',
  },
  dataCell: {
    width: '37.5%',
  },
  dataText: {
    textAlign: 'center',
  },
  buttonCell: {
    width: '37.5%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  firstColumn: {
    width: '25%',
  },
  recordButton: {
    backgroundColor: '#00AEEF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  recordText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
