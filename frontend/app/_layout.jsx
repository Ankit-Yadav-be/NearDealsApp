import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import SafeScreen from "../components/SafeScreen";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

const RootLayout = () => {
  const { user, loadTokenFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      await loadTokenFromStorage();
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/(auth)");
      } else if (user.role === "customer") {
        router.replace("/(tabs-customer)");
      } else if (user.role === "businessOwner") {
        router.replace("/(tabs-owner)");
      } else if (user.role === "admin") {
        router.replace("/(tabs-admin)");
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeScreen>
          {/* Simple loader / splash */}
        </SafeScreen>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
           <Stack.Screen name="(landing)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs-customer)" />
          <Stack.Screen name="(tabs-owner)" />
          <Stack.Screen name="(tabs-admin)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
};

export default RootLayout;
