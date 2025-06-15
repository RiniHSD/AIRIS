import AsyncStorage from '@react-native-async-storage/async-storage';

const AsyncStorageHelper = {
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      console.log(`Data dengan key '${key}' berhasil disimpan.`);
    } catch (error) {
      console.error(`Gagal menyimpan data dengan key '${key}':`, error);
    }
  },

  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value != null ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Gagal mengambil data dengan key '${key}':`, error);
    }
  },

  getAllItems: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      return result.reduce((acc, [key, value]) => {
        acc[key] = JSON.parse(value);
        return acc;
      }, {});
    } catch (error) {
      console.error('Gagal mengambil semua data:', error);
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Data dengan key '${key}' berhasil dihapus.`);
    } catch (error) {
      console.error(`Gagal menghapus data dengan key '${key}':`, error);
    }
  },


  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      console.log('Semua data berhasil dihapus dari AsyncStorage.');
    } catch (error) {
      console.error('Gagal menghapus semua data:', error);
    }
  },
};

export default AsyncStorageHelper;
