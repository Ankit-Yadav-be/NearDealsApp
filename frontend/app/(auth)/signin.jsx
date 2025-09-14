import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";

const SigninScreen = () => {
  const { signin, loading, error } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleSignin = async () => {
    try {
      const data = await signin(form.email, form.password);
      console.log("Logged in:", data);
   
      // role ke hisab se navigation
      if (data.user.role === "customer") {
        router.replace("/(tabs-customer)");
      } else if (data.user.role === "businessOwner") {
        router.replace("/(tabs-owner)");
      } else if (data.user.role === "admin") {
        router.replace("/(tabs-admin)");
      }
    } catch (e) {
      console.log("Signin error:", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

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

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Sign In" onPress={handleSignin} />
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity onPress={() => router.push("/(auth)")}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SigninScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 },
  error: { color: "red", marginTop: 10 },
  link: { marginTop: 15, textAlign: "center", color: "blue" },
});
