import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore'; 
const PRIMARY_BLUE = "#1A73E8";
const TEXT_DARK = "#202124";
const TEXT_MUTED = "#5F6368";
const BORDER_LIGHT = "#EEEEEE"; 

const LandingScreen = () => {
  const router = useRouter();
  const { token ,user} = useAuthStore(); 

  useEffect(() => {
    if (user) {
      console.log(`User found: Redirecting to ${user.role} tabs.`);
      
     
      if (user.role === "customer") {
        router.replace("/(tabs-customer)");
      } else if (user.role === "businessOwner") {
        router.replace("/(tabs-owner)");
      } else if (user.role === "admin") {
        router.replace("/(tabs-admin)");
      } else {
      
        console.warn("User authenticated with unrecognized role:", user.role);
        router.replace("/(tabs-customer)");
      }
    }
   
  }, [token]);

  
  if (token) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.subtitle}>Redirecting to your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Service Platform!</Text>
      <Text style={styles.subtitle}>Discover professional services or manage your business efficiently.</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push("/(auth)/signin")}
        >
            <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => router.push("/(auth)")}
        >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 15,
        color: TEXT_DARK,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 50,
        color: TEXT_MUTED,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 350,
    },
    primaryButton: {
        backgroundColor: PRIMARY_BLUE,
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_LIGHT, // BORDER_LIGHT का उपयोग यहाँ किया गया है
    },
    secondaryButtonText: {
        color: PRIMARY_BLUE,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});
