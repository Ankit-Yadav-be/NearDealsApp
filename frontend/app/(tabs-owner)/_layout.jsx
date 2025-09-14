import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

const OwnerLayout = () => {
  return (
    <Tabs
     screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
         tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      {/* Businesses Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Businesses",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Create Tab */}
      <Tabs.Screen
        name="create-business"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default OwnerLayout;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 70,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
   // position: "absolute",
    left: 0,
    right: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
});