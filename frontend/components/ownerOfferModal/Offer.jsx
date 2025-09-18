// components/OfferModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import API from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

const OfferModal = ({ visible, onClose, businessId }) => {
  const token = useAuthStore((s) => s.token);

  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPercent: "",
    validFrom: "",
    validTo: "",
  });

  const [showPicker, setShowPicker] = useState({ field: null, visible: false });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const openDatePicker = (field) => {
    setShowPicker({ field, visible: true });
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const isoDate = selectedDate.toISOString(); // full ISO
      setForm({ ...form, [showPicker.field]: isoDate });
    }
    setShowPicker({ field: null, visible: false });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.discountPercent || !form.validFrom || !form.validTo) {
      Alert.alert("Error", "Please fill required fields.");
      return;
    }

    try {
      await API.post(
        `/offer/${businessId}`,
        {
          title: form.title.trim(),
          description: form.description.trim(),
          discountPercent: Number(form.discountPercent),
          validFrom: form.validFrom,
          validTo: form.validTo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Success", "Offer created successfully!");
      setForm({ title: "", description: "", discountPercent: "", validFrom: "", validTo: "" });
      onClose();
    } catch (error) {
      console.log("Offer create error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to create offer.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>🎁 Add New Offer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          {[
            { key: "title", placeholder: "Offer Title", icon: "pricetag-outline" },
            { key: "description", placeholder: "Description", icon: "document-text-outline" },
            {
              key: "discountPercent",
              placeholder: "Discount (%)",
              icon: "cash-outline",
              keyboardType: "numeric",
            },
          ].map((field) => (
            <View key={field.key} style={styles.inputWrapper}>
              <Ionicons name={field.icon} size={18} color="#6B7280" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                keyboardType={field.keyboardType || "default"}
                value={form[field.key]}
                onChangeText={(t) => handleChange(field.key, t)}
              />
            </View>
          ))}

          {/* Date Pickers */}
          {["validFrom", "validTo"].map((field) => (
            <TouchableOpacity
              key={field}
              style={styles.inputWrapper}
              onPress={() => openDatePicker(field)}
            >
              <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
              <Text style={[styles.input, { color: form[field] ? "#111827" : "#9CA3AF" }]}>
                {form[field]
                  ? new Date(form[field]).toLocaleDateString()
                  : field === "validFrom"
                  ? "Valid From"
                  : "Valid To"}
              </Text>
            </TouchableOpacity>
          ))}

          {/* DateTime Picker */}
          {showPicker.visible && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#E5E7EB" }]}
              onPress={onClose}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color="#111827"
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: "#111827", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#2563EB" }]}
              onPress={handleSubmit}
            >
              <Ionicons
                name="save-outline"
                size={18}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default OfferModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  closeBtn: {
    backgroundColor: "#F3F4F6",
    padding: 6,
    borderRadius: 50,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  input: { flex: 1, fontSize: 15 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginLeft: 10,
    elevation: 2,
  },
});
