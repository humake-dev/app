import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import { useUser } from './UserContext';

const BarcodeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;
    const userContext = useUser();
    const user = userContext?.user;
    
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