import React, { useState, useEffect } from "react";
import { View, Platform, Modal, TouchableOpacity, Text } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

const DatePickerModal = ({
  visible,
  date,
  minimumDate,
  onConfirm,
  onCancel,
}) => {
  const [tempDate, setTempDate] = useState(date);

  useEffect(() => {
    setTempDate(date);
  }, [date]);

  // 🔥 Android는 visible true 될 때 즉시 open
  if (Platform.OS === "android" && visible) {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      is24Hour: true,
      minimumDate: minimumDate,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          onConfirm(selectedDate);
        }
        onCancel();
      },
    });

    return null; // Android는 Modal 안 씀
  }

  if (!visible) return null;

  // iOS
  return (
    <Modal transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", paddingBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
            }}
          >
            <TouchableOpacity onPress={onCancel}>
              <Text>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onConfirm(tempDate);
                onCancel();
              }}
            >
              <Text>확인</Text>
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            locale="ko-KR"
            themeVariant="light"
            style={{ color: 'black', fontSize: 18 }}
            minimumDate={minimumDate}
            onChange={(event, selectedDate) => {
              if (selectedDate) setTempDate(selectedDate);
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;