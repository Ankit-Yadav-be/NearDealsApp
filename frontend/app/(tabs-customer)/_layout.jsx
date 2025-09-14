import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const CustomerTabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2f95dc",
      }}
    >
      {/* Explore Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Favourites Tab */}
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Favourites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
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

export default CustomerTabLayout;
