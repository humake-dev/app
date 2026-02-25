import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { authFetch } from "./src/utils/api"; // 경로는 프로젝트 구조에 맞춰서

const CounselFormScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('default');
  const [showPicker, setShowPicker] = useState(false);

  const courses = [
    { label: t('counsel.default'), value: 'default' },
    { label: t('counsel.pt'), value: 'pt' },
  ];
  const selectedLabel = courses.find(c => c.value === selectedCourse)?.label ?? '';

  const handleSubmit = async () => {
    try {   
      const response = await authFetch('/counsels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_course: selectedCourse,
          content: content,
        }),
      });

      if (response.ok) {
        // Reset form after successful submission
        setContent('');
        setSelectedCourse('default');
        navigation.goBack();
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>{t('counsel.selectCourse')}</Text>

        {/* ANDROID */}
        {Platform.OS === 'android' && (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCourse}
              onValueChange={setSelectedCourse}
              mode="dropdown"
              style={styles.picker}
            >
              {courses.map(course => (
                <Picker.Item
                  key={course.value}
                  label={course.label}
                  value={course.value}
                />
              ))}
            </Picker>
          </View>
        )}

        {/* IOS */}
        {Platform.OS === 'ios' && (
          <>
            <TouchableOpacity
              style={styles.iosPickerButton}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.iosPickerText}>{selectedLabel}</Text>
            </TouchableOpacity>

            <Modal
              visible={showPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => setShowPicker(false)}
                    >
                      <Text style={styles.doneText}>
                        {t('common.select')}
                      </Text>
                    </TouchableOpacity>
                  </View>

<View style={{ height: 250 }}>
  <Picker
    selectedValue={selectedCourse}
    onValueChange={setSelectedCourse}
  >
    {courses.map(course => (
      <Picker.Item
        key={course.value}
        label={course.label}
        value={course.value}
      />
    ))}
  </Picker>
</View>
                </View>
              </View>
            </Modal>
          </>
        )}

        <Text style={styles.label}>{t('counsel.content')}</Text>
        <TextInput
          style={styles.input}
          multiline={true}
          numberOfLines={4}
          value={content}
          onChangeText={setContent}
          placeholder={t('counsel.contentPlaceholder')}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',

  },
  picker: {
    height: 55,
    width: '100%',
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  iosPickerButton: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 16,
  marginBottom: 20,
},

iosPickerText: {
  fontSize: 16,
  color: '#333',
},

modalOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0,0,0,0.4)',
},

modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: 20,
},

modalHeader: {
  alignItems: 'flex-end',
  padding: 16,
  borderBottomWidth: 1,
  borderColor: '#eee',
},

doneText: {
  fontSize: 16,
  color: '#007AFF',
  fontWeight: '600',
},
});

export default CounselFormScreen;