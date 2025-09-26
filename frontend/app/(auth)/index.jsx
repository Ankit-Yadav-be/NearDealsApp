import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const SignupScreen = () => {
  const { signup, loading, error } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const data = await signup(
        form.name,
        form.email,
        form.password,
        form.role
      );

      if (data.user.role === "customer") {
        router.replace("/(tabs-customer)");
      } else if (data.user.role === "businessOwner") {
        router.replace("/(tabs-owner)");
      } else if (data.user.role === "admin") {
        router.replace("/(tabs-admin)");
      }
    } catch (e) {
      console.log("Signup error:", e.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // Dummy banner image
        }}
        style={styles.banner}
      />

      {/* Form Card */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>
          Sign up to unlock amazing experiences 🚀
        </Text>

        {/* Input Fields with Icons */}
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#4a90e2" />
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#4a90e2" />
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#4a90e2" />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="briefcase-outline" size={20} color="#4a90e2" />
          <TextInput
            placeholder="Role (customer/businessOwner/admin)"
            style={styles.input}
            value={form.role}
            onChangeText={(v) => setForm({ ...form, role: v })}
          />
        </View>

        {/* Gradient Button */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          style={{ marginTop: 15 }}
        >
          <LinearGradient
            colors={["#6a11cb", "#2575fc"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* Link */}
        <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },
  banner: {
    width: "100%",
    height: "42%",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
    color: "#222",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#fafbff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#555",
    fontSize: 15,
  },
  linkBold: {
    color: "#2575fc",
    fontWeight: "700",
  },
});
