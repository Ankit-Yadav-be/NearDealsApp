import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import API from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore"; // <-- your zustand store path

const Businesses = () => {
  const token = useAuthStore((state) => state.token); // get admin token
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!name.trim()) {
      return Toast.show({ type: "error", text1: "Category name is required" });
    }

    try {
      setLoading(true);
      const res = await API.post(
        "/category",
        { name, icon },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Toast.show({ type: "success", text1: `Category "${res.data.name}" added!` });
      setName("");
      setIcon("");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to add category",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Category</Text>

      <TextInput
        style={styles.input}
        placeholder="Category Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Icon URL (optional)"
        value={icon}
        onChangeText={setIcon}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddCategory}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Add Category</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default Businesses;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
});
