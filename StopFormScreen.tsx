import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { authFetch } from "./src/utils/api";
import DatePickerModal from "./DatePickerModal";

const StopFormScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await authFetch(`/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stop_start_date: startDate.toISOString().slice(0, 10),
          stop_end_date: endDate.toISOString().slice(0, 10),
          description: content,
        }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      Alert.alert("Error", "다시 시도해주세요");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>{t('stop.stopPeriod')}</Text>

          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[styles.dateButton, styles.dateInput]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString("ko-KR")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.dateSeparator}>~</Text>

            <TouchableOpacity
              style={[styles.dateButton, styles.dateInput]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString("ko-KR")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('stop.content')}</Text>
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
          placeholder={t('stop.contentPlaceholder')}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ⭐ 모달은 ScrollView 밖에 둔다 */}
      <DatePickerModal
        visible={showStartPicker}
        date={startDate}
        onConfirm={(date) => setStartDate(date)}
        onCancel={() => setShowStartPicker(false)}
      />

      <DatePickerModal
        visible={showEndPicker}
        date={endDate}
        onConfirm={(date) => setEndDate(date)}
        onCancel={() => setShowEndPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  formContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  dateSeparator: { marginHorizontal: 8, color: "#666" },
  dateButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
  },
  dateText: { fontSize: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default StopFormScreen;