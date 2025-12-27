import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, SafeAreaView } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import { useUser } from './UserContext';
import DeviceBrightness from '@adrianso/react-native-device-brightness';
import { useState } from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const BarcodeScreen = () => {
    const userContext = useUser();
    const user = userContext?.user;
    
    const [brightness, setBrightness] = useState();
    const [changeBrightness, setChangeBrightness] = useState(false);

    useEffect(() => {
      if(Platform.OS == 'ios') {
        DeviceBrightness.getBrightnessLevel().then((luminous) =>  {
          setBrightness(luminous);
        });
      } else {
        DeviceBrightness.getSystemBrightnessLevel().then((luminous) =>  {
          setBrightness(luminous);
        });
      }
  }, [brightness]);
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
            <Barcode 
              value={user.access_card.card_no} 
              format="CODE128" 
              options={{
                width: 3, 
                height: 150, 
                margin: 20,
                displayValue: true,
                fontSize: 24, 
                fontOptions: "bold",
                font: "Arial",
                textMargin: 10,
                textColor: '#000'
              }}
            />
                        <Text style={{ 
                          marginTop: 15, 
                          fontSize: 20, 
                          color: '#333',
                          fontWeight: 'bold'
                        }}>
                          {user.access_card.card_no}
                        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});

export default BarcodeScreen;