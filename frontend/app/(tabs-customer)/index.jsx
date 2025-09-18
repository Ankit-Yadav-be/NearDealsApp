import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
} from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import API from "../../api/axiosInstance";

const CustomerHome = () => {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [search, setSearch] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetchAllBusinesses();
    fetchCategories();
  }, []);

  // ✅ Distance calculator
  const getDistanceFromLatLon = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // ✅ Fetch all businesses
  const fetchAllBusinesses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/business");
      setBusinesses(res.data);
      setLocationEnabled(false);
      Toast.show({ type: "success", text1: "Businesses loaded successfully!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to fetch businesses" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch nearby businesses
  const getLocationAndFetch = async () => {
    try {
      setLocationLoading(true);
      const isServiceEnabled = await Location.hasServicesEnabledAsync();
      if (!isServiceEnabled)
        return Toast.show({
          type: "error",
          text1: "Enable GPS in your device settings",
        });

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        return Toast.show({
          type: "error",
          text1: "Location permission denied",
        });

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = location.coords;
      setUserCoords({ latitude, longitude });

      setLoading(true);
      const res = await API.get("/business/nearby", {
        params: { lat: latitude, lng: longitude, radius: 10 },
      });
      setBusinesses(res.data);
      setLocationEnabled(true);
      Toast.show({ type: "success", text1: "Nearby businesses loaded!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to fetch nearby businesses" });
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      // Add "All" as first option
      setCategories([{ _id: "all", name: "All", icon: null }, ...res.data]);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to load categories" });
    }
  };

  // ✅ Filter businesses by search and selected category
  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "All" ? true : b.category === selectedCategory)
  );

  const renderBusiness = ({ item }) => {
    let distanceText = locationEnabled ? "📍 Nearby" : "🌐 Global";

    if (locationEnabled && userCoords && item.location?.coordinates) {
      const [lng, lat] = item.location.coordinates;
      distanceText = `📍 ${getDistanceFromLatLon(
        userCoords.latitude,
        userCoords.longitude,
        lat,
        lng
      )} km away`;
    }

    const fadeAnim = new Animated.Value(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push(`/(customer)/${item._id}`)}
        >
          <Image
            source={
              item.images?.length
                ? { uri: item.images[0] }
                : require("../../assets/images/icon.png")
            }
            style={styles.image}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.distance}>{distanceText}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push(`/(customer)/${item._id}`)}
            >
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Explore Businesses</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search businesses..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.locationBtn,
              locationEnabled && { backgroundColor: "#059669" },
            ]}
            onPress={getLocationAndFetch}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name={locationEnabled ? "location" : "location-outline"}
                size={22}
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Category Filter */}
      <View style={{ paddingVertical: 12 }}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.name;
            return (
              <TouchableOpacity
                style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(item.name)}
                activeOpacity={0.5}
              >
                {/* ✅ Rounded Icon */}
                <View
                  style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}
                >
                  {item.icon ? (
                    <Image
                      source={{ uri: item.icon }}
                      style={styles.categoryIcon}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name={item.name === "All" ? "apps-outline" : "pricetag-outline"}
                      size={20}
                      color={isActive ? "white" : "#6B7280"}
                    />
                  )}
                </View>

                {/* ✅ Category Text */}
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Section */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>
          {locationEnabled ? "Nearby Businesses" : "All Businesses"}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 10, color: "#374151" }}>
            {locationEnabled
              ? "Fetching nearby businesses..."
              : "Loading businesses..."}
          </Text>
        </View>
      ) : filteredBusinesses.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={60} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 16 }}>
            No businesses found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusiness}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
        />
      )}

      <Toast />
    </View>
  );
};

export default CustomerHome;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  topbar: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  topbarTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    height: 38,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#1E40AF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },

  // ✅ Category Styles
  categoryBtn: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  categoryBtnActive: {
    transform: [{ scale: 1.05 }],
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapperActive: {
    backgroundColor: "#3e72e1ff",
    shadowOpacity: 0.15,
    elevation: 4,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  categoryTextActive: {
    color: "#2563EB",
    fontWeight: "700",
  },

  sectionHeading: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  image: { width: 90, height: 90, borderRadius: 12, marginRight: 12 },
  info: { flex: 1, justifyContent: "space-between" },
  name: { fontSize: 18, fontWeight: "700", color: "#111827" },
  category: { fontSize: 14, color: "#6B7280", marginVertical: 4 },
  distance: { fontSize: 13, color: "#2563EB", fontWeight: "600" },
  button: {
    marginTop: 6,
    backgroundColor: "#2563EB",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
