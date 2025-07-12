import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomPicker from '../assets/CustomPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/url';
import LOCAL_URL from '../config/localhost';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

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

export default function EditBangunan() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bangunan } = route.params;

  const [form, setForm] = useState({});
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedLokasi, setSelectedLokasi] = useState('');
  const [finalLokasi, setFinalLokasi] = useState('');
  const [isTersier, setIsTersier] = useState(false);
  const [isSawah, setIsSawah] = useState(false);
  const [isKolam, setIsKolam] = useState(false);
  const [isKebun, setIsKebun] = useState(false);

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

  const [selectedJenisBangunan, setSelectedJenisBangunan] = useState([]);
  const [jenisLainnya, setJenisLainnya] = useState('');

  const [isBangunanBagi, setIsBangunanBagi] = useState(false);
  const [saluranBagi, setSaluranBagi] = useState([
    {
      namaSaluran: '',
      luasoncoran: '',
      luassawah: '',
      luaskolam: '',
      luaskebun: '',
      debit : '',
    }
  ]);

  const kondisiOptions = ['Baik', 'Rusak ringan', 'Rusak sedang', 'Rusak berat'];

  const [isUploading, setIsUploading] = useState(false);

  const toggleJenisBangunan = (item) => {
    setSelectedJenisBangunan(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

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
      debit: '',
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

            <Text style={styles.label}>Debit Air (lt/dt)</Text>
            <TextInput
              style={styles.input}
              value={saluran.debit}
              keyboardType="numeric"
              onChangeText={(v) => updateSaluranBagi(index, 'debit', v)}
            />

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

  useEffect(() => {
    setForm({
      nama: bangunan.name || '',
      jenis: bangunan.jenis || '',
      fungsi: bangunan.fungsi || '',
      bahan: bangunan.bahan || '',
      kondisi: bangunan.kondisi || '',
      lokasi: bangunan.lokasi || '',
      luassawah: bangunan.luassawah || '',
      luaskebun: bangunan.luaskebun || '',
      luaskolam: bangunan.luaskolam || '',
      luasoncoran: bangunan.luasoncoran || '',
      keterangantambahan: bangunan.keterangantambahan || '',
      foto: bangunan.foto || '',
    });

    setSelectedLokasi(bangunan.lokasi || '');
    setIsTersier((bangunan.lokasi || '').includes('Tersier'));

    setIsSawah((bangunan.jeniskebutuhan || '').includes('Persawahan'));
    setIsKolam((bangunan.jeniskebutuhan || '').includes('Kolam'));
    setIsKebun((bangunan.jeniskebutuhan || '').includes('Perkebunan'));

    const [lat, lon] = (bangunan.koordinat || '').split(',').map((coord) => coord.trim());
    setLatitude(lat || '');
    setLongitude(lon || '');
  }, []);

  useEffect(() => {
    let lokasi = selectedLokasi;
    if (isTersier) lokasi += ' - Tersier';
    setFinalLokasi(lokasi);
  }, [selectedLokasi, isTersier]);

  const kebutuhan = [
    isSawah ? 'Persawahan' : null,
    isKolam ? 'Kolam' : null,
    isKebun ? 'Perkebunan' : null,
  ].filter(Boolean).join(', ');

  const handleSave = async () => {
    try {
      // Buat objek request
      const requestData = {
        nama: form.nama,
        jenis: cleanedJenis,
        fungsi: form.fungsi,
        bahan: form.bahan,
        kondisi: form.kondisi,
        lokasi: finalLokasi,
        jeniskebutuhan: kebutuhan,
        luassawah: form.luassawah,
        luaskebun: form.luaskebun,
        luaskolam: form.luaskolam,
        luasoncoran: form.luasoncoran,
        keterangantambahan: form.keterangantambahan,
        foto: form.foto,
      };
  
      // Tambahkan data saluran bagi jika diperlukan
      if (isBangunanBagi) {
        requestData.saluranBagi = saluranBagi;
      }
  
      const res = await fetch(`${BASE_URL}/auth/bangunan/${bangunan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
  
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal memperbarui data');
  
      Alert.alert('Sukses', 'Data berhasil diperbarui', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await new Promise((resolve) => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, resolve);
      });
  
      if (result.didCancel || !result.assets || result.assets.length === 0) return;
  
      const photo = result.assets[0];
      setIsUploading(true);
  
      try {
        const fileUrl = await uploadImageToServer(photo.uri);
        setForm((prev) => ({ ...prev, foto: fileUrl }));
      } catch (err) {
        Alert.alert('Upload Error', err.message);
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const uploadImageToServer = async (uri) => {
    setIsUploading(true);
  
    try {
      // Dapatkan info ukuran file
      const fileInfo = await RNFS.stat(uri);
      
      // Batasi ukuran maksimal 5MB
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (fileInfo.size > MAX_SIZE) {
        Alert.alert(
          'File Terlalu Besar',
          'Ukuran file melebihi 5MB. Silakan pilih foto yang lebih kecil.'
        );
        return;
      }

      
  
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
  
      const formData = new FormData();
      formData.append('photo', {
        uri: uri,
        name: filename,
        type,
      });
  
      const res = await fetch(`${BASE_URL}/auth/upload`, {
        method: 'POST',
        body: formData,
      });
  
      const responseText = await res.text();
      let json;
  
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        if (res.ok && responseText.startsWith('http')) {
          return responseText.trim();
        }
        throw new Error(`Server response not JSON: ${responseText.substring(0, 50)}`);
      }
  
      if (!res.ok) {
        throw new Error(json.error || json.message || `Upload failed with status ${res.status}`);
      }
  
      return json.fileUrl;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kode Bangunan</Text>
        <TextInput value={form.nama} onChangeText={(text) => setForm({ ...form, nama: text })} style={styles.input} />
      </View>
      
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
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fungsi</Text>
        <TextInput value={form.fungsi} onChangeText={(text) => setForm({ ...form, fungsi: text })} style={styles.input} />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Debit Air (Lt/dt)</Text>
        <TextInput value={form.bahan} onChangeText={(text) => setForm({ ...form, bahan: text })} style={styles.input} keyboardType="numeric" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Lokasi</Text>
        {saluranList.map(s => (
          <CustomRadioButton
            key={s}
            label={s}
            selected={selectedLokasi === s}
            onSelect={() => setSelectedLokasi(s)}
          />
        ))}

        <Text>Saluran Tersier</Text>
        <TouchableOpacity onPress={() => setIsTersier(!isTersier)}>
          <Text>{isTersier ? '✅ Ya' : '❌ Tidak'}</Text>
        </TouchableOpacity>
      </View>

      {renderKondisiFisikForm()}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Jenis Kebutuhan</Text>
        <TouchableOpacity onPress={() => setIsSawah(!isSawah)}><Text>{isSawah ? '✅ Sawah' : '❌ Sawah'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setIsKolam(!isKolam)}><Text>{isKolam ? '✅ Kolam' : '❌ Kolam'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setIsKebun(!isKebun)}><Text>{isKebun ? '✅ Kebun' : '❌ Kebun'}</Text></TouchableOpacity>
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
        <TextInput value={form.keterangantambahan} onChangeText={(text) => setForm({ ...form, keterangantambahan: text })} style={styles.input} />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Koordinat</Text>
        <TextInput value={latitude} editable={false} style={styles.disabledInput} />
        <TextInput value={longitude} editable={false} style={styles.disabledInput} />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Foto Bangunan</Text>
        {isUploading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : form.foto ? (
          <Image source={{ uri: form.foto }} style={{ width: '100%', height: 200, marginBottom: 12 }} />
        ) : (
          <Text style={{ color: '#888' }}>Belum ada foto</Text>
        )}
        <TouchableOpacity 
          onPress={handlePickImage} 
          style={{ backgroundColor: '#4CAF50', padding: 10, alignItems: 'center', borderRadius: 6, marginTop: 10 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>GANTI FOTO</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#00AEEF', padding: 10, alignItems: 'center', borderRadius: 6, marginBottom: 70, marginTop: 10 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>SIMPAN PERUBAHAN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#eee',
    color: '#888',
  },
  formGroup: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  label: {
    fontWeight: '600',
    marginBottom: 10,
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
});
