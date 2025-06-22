import React from 'react';
import { Picker as RNPicker } from '@react-native-picker/picker';
import {
    StyleSheet,
    Platform,
  } from 'react-native';

const CustomPicker = ({ children, style, ...props }) => {
  return (
    <RNPicker
      {...props}
      style={[styles.picker, style]}
      dropdownIconColor="#000000"
      dropdownBackgroundColor="#FFFFFF"
      mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            color: '#ffff',
          });
        }
        return child;
      })}
    </RNPicker>
  );
};

const styles = StyleSheet.create({
  picker: {
    color: '#000000', // Warna teks hitam
    backgroundColor: '#ccc',
  },
});

export default CustomPicker;