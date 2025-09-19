import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const ModernLoader = ({ locationLoading }) => {
  return (
    <View style={styles.loaderContainer}>
      {/* Modern Gradient Card */}
      <LinearGradient
        colors={["#2563EB", "#3B82F6", "#60A5FA"]}
        style={styles.loaderCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Loader Icon */}
        <ActivityIndicator size="large" color="white" />

        {/* Loader Text */}
        <Text style={styles.loaderText}>
          {locationLoading
            ? "⏳ Please wait, we are finding businesses near you..."
            : "Loading businesses..."}
        </Text>
      </LinearGradient>
    </View>
  );
};

export default ModernLoader;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loaderCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    width: "80%",
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
});
