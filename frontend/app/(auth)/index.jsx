import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";

const SignupScreen = () => {
  const { signup, loading, error } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const data = await signup(form.name, form.email, form.password, form.role);

      // role ke hisaab se navigate
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
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={form.email}
        onChangeText={(v) => setForm({ ...form, email: v })}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={form.password}
        onChangeText={(v) => setForm({ ...form, password: v })}
      />

      {/* Role selection (simple input for now) */}
      <TextInput
        placeholder="Role (customer/businessOwner/admin)"
        style={styles.input}
        value={form.role}
        onChangeText={(v) => setForm({ ...form, role: v })}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Sign Up" onPress={handleSignup} />
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 },
  error: { color: "red", marginTop: 10 },
  link: { marginTop: 15, textAlign: "center", color: "blue" },
});
