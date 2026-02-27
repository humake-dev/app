import React, { useState, useEffect } from "react";
import { View, Platform, Modal, TouchableOpacity, Text } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

interface Props {
  visible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const DatePickerModal = ({ visible, date, onConfirm, onCancel }: Props) => {
  const [tempDate, setTempDate] = useState(date);

  useEffect(() => {
    setTempDate(date);
  }, [date]);

  useEffect(() => {
    if (Platform.OS === "android" && visible) {
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            onConfirm(selectedDate);
          }
          onCancel();
        },
      });
    }
  }, [visible]);

  if (Platform.OS === "android") return null;
  if (!visible) return null;

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