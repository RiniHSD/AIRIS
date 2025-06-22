import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, Platform, PermissionsAndroid  } from 'react-native';
import BASE_URL from '../config/url';
import LOCAL_URL from '../config/localhost';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';


export default function ListPage() {

  const [bangunan, setBangunan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchBangunan = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/bangunan`);
        const data = await res.json();
        setBangunan(data.features.map((f) => f.properties)); // karena getBangunanIrigasi return FeatureCollection
      } catch (err) {
        console.error('Gagal memuat data bangunan:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBangunan();
  }, []);

  const handleDeleteBangunan = async (id) => {
    try {
      console.log('🧠 Menampilkan Alert konfirmasi hapus...');
      Alert.alert(
        'Konfirmasi',
        'Yakin ingin menghapus data bangunan ini?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              const res = await fetch(`${BASE_URL}/auth/bangunan/${id}`, {
                method: 'DELETE',
              });
  
              const result = await res.json();
              if (!res.ok) throw new Error(result.error || 'Gagal menghapus');
  
              // Refresh data
              setBangunan((prev) => prev.filter((b) => b.id !== id));
              Alert.alert('Sukses', 'Data bangunan berhasil dihapus');
            },
          },
        ],
        { cancelable: true }
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

   // Fungsi untuk mengonversi data ke format CSV
  const convertToCSV = () => {
    if (bangunan.length === 0) return '';
    
    // Header CSV
    const headers = Object.keys(bangunan[0]).join(',');
    
    // Baris data
    const rows = bangunan.map(obj => 
      Object.values(obj).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  };

  // Fungsi untuk mendownload data sebagai CSV
  const downloadCSV = async () => {
    try {
      const csvData = convertToCSV();
      
      if (!csvData) {
        Alert.alert('Info', 'Tidak ada data untuk diunduh');
        return;
      }

      // Buat nama file dengan timestamp
      const fileName = `bangunan_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Tentukan path penyimpanan
      let filePath = '';
      
      if (Platform.OS === 'android') {
        // Versi Android lebih baru (API 33+) menggunakan izin yang berbeda
        let permission;
        if (Platform.Version >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        }

        // Minta izin penyimpanan untuk Android
        const granted = await PermissionsAndroid.request(
          permission,
          {
            title: 'Izin Penyimpanan',
            message: 'Aplikasi memerlukan izin untuk menyimpan file',
            buttonPositive: 'Izinkan',
            buttonNegative: 'Tolak',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          // Jika izin ditolak, beralih ke metode alternatif
          await shareCSV(csvData, fileName);
          return;
        }
        
        filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      } else {
        // Untuk iOS
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      // Simpan file
      await RNFS.writeFile(filePath, csvData, 'utf8');
      
      // Tampilkan konfirmasi
      Alert.alert(
        'Berhasil Disimpan',
        `File tersimpan di: ${filePath}`,
        [
          // {
          //   text: 'Buka Folder',
          //   onPress: () => {
          //     if (Platform.OS === 'android') {
          //       // Buka folder downloads di Android
          //       RNFS.android.openDocument(filePath);
          //     } else {
          //       // Untuk iOS, buka folder Documents
          //       RNFS.openDocument(filePath);
          //     }
          //   }
          // },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('Error menyimpan file:', error);
      Alert.alert('Error', `Gagal menyimpan file: ${error.message}`);
    }
  };

  // Fungsi alternatif untuk berbagi file jika izin ditolak
  const shareCSV = async (csvData, fileName) => {
    try {
      // Simpan sementara di folder cache
      const tempPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.writeFile(tempPath, csvData, 'utf8');
      
      // Bagikan file
      await Share.open({
        url: `file://${tempPath}`,
        type: 'text/csv',
        filename: fileName,
        subject: 'Data Bangunan Irigasi',
        message: 'Berikut data bangunan irigasi yang diminta',
      });
    } catch (shareError) {
      console.error('Error sharing file:', shareError);
      Alert.alert('Error', 'Gagal berbagi file');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.jenis}</Text>
      <Text style={styles.cell}>{item.lokasi}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Titiklokasi', { bangunan: item })}>
          <Image source={require('../assets/icons/view.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EditBangunan', { bangunan: item })}>
          <Image source={require('../assets/icons/edit.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          console.log('🗑️ Tombol hapus ditekan untuk id:', item.id);
          handleDeleteBangunan(item.id);
        }}>
          <Image source={require('../assets/icons/delete.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Memuat data bangunan...</Text>
      </View>
    );
  }

  
  

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.downloadButton} 
        onPress={downloadCSV}
      >
        <Text style={styles.downloadButtonText}>📥 Download CSV</Text>
      </TouchableOpacity>

      {/* Header Tabel */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell]}>Kode Bangunan</Text>
        <Text style={[styles.cell, styles.headerCell]}>Nama Bangunan</Text>
        <Text style={[styles.cell, styles.headerCell]}>Lokasi Bangunan</Text>
        <Text style={[styles.cell, styles.headerCell]}>Aksi</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Cari bangunan..."
        placeholderTextColor="#ccc"
        value={searchText}
        onChangeText={setSearchText}
      />
  
      <FlatList
        data={bangunan.filter(item =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.jenis.toLowerCase().includes(searchText.toLowerCase()) ||
          item.lokasi.toLowerCase().includes(searchText.toLowerCase())
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.list}
        ListFooterComponent={() =>
          (currentPage * pageSize < bangunan.length ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => setCurrentPage((prev) => prev + 1)}
            >
              <Text style={styles.loadMoreText}>Muat Lebih</Text>
            </TouchableOpacity>
          ) : null)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#E3F2FD',
    marginTop: 10,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 6,
    fontSize: 14,
    color: '#333',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  iconContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
  },
  icon: {
    marginHorizontal: 5,
    width: 18,
    height: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    marginBottom: 70,
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  loadMoreButton: {
    padding: 12,
    backgroundColor: '#0daaf0',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});