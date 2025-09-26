import React, { useEffect, useState, useRef } from "react";
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
import AllOffersCarousel from "../../components/customerofferList/AllOffersCarousel";
import { useAuthStore } from "../../store/authStore";
import ModernLoader from "../../components/ModernLoader";
import { useFocusEffect } from "@react-navigation/native";

const CustomerHome = () => {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [search, setSearch] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [followed, setFollowed] = useState({});
  const { token } = useAuthStore();
  const [followerCounts, setFollowerCounts] = useState({});

  const router = useRouter();

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [100, 60],
    extrapolate: "clamp",
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchAllBusinesses();
      fetchCategories();   // Screen dikhte hi dubara load hoga
    }, [])
  );

  const fetchFollowersCount = async (businessId) => {
    try {
      const res = await API.get(`/follow/business/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowerCounts((prev) => ({
        ...prev,
        [businessId]: res.data.length, // followers array length
      }));
    } catch (err) {
      console.log("Failed to fetch followers count", err);
    }
  };

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

  const fetchAllBusinesses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/business", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(res.data);
      setLocationEnabled(false);

      const followMap = {};
      res.data.forEach((b) => {
        followMap[b._id] = b.isFollowed || false;
        fetchFollowersCount(b._id); // fetch followers for each
      });
      setFollowed(followMap);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to fetch businesses" });
    } finally {
      setLoading(false);
    }
  };


  const fetchNearbyBusinesses = async () => {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(res.data);
      setLocationEnabled(true);

      const followMap = {};
      res.data.forEach((b) => (followMap[b._id] = b.isFollowed || false));
      setFollowed(followMap);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to fetch nearby businesses" });
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  const handleLocationToggle = () => {
    if (locationEnabled) {
      fetchAllBusinesses();
    } else {
      fetchNearbyBusinesses();
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories([{ _id: "all", name: "All", icon: null }, ...res.data]);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to load categories" });
    }
  };

  const toggleFollow = async (businessId) => {
    try {
      const currentlyFollowed = followed[businessId];
      if (currentlyFollowed) {
        await API.delete(`/follow/${businessId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Toast.show({ type: "info", text1: "Unfollowed business" });

        setFollowerCounts((prev) => ({
          ...prev,
          [businessId]: (prev[businessId] || 1) - 1,
        }));
      } else {
        await API.post(`/follow/${businessId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        Toast.show({ type: "success", text1: "Followed business" });

        setFollowerCounts((prev) => ({
          ...prev,
          [businessId]: (prev[businessId] || 0) + 1,
        }));
      }
      setFollowed((prev) => ({ ...prev, [businessId]: !currentlyFollowed }));
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to update follow status" });
    }
  };

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
        <View style={styles.card}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: "row" }}
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
              <View style={styles.followerRow}>
                <Ionicons name="people-outline" size={15} color="#374151" />
                <Text style={styles.followerText}>
                  {followerCounts[item._id] || 0} Followers
                </Text>
              </View>

            </View>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.followBtn,
              followed[item._id] ? styles.following : styles.notFollowing,
            ]}
            onPress={() => toggleFollow(item._id)}
            activeOpacity={0.8}
          >

            <View style={styles.followContent}>
              <Ionicons
                name={
                  followed[item._id] ? "checkmark-circle" : "add-circle-outline"
                }
                size={16}
                color={followed[item._id] ? "#059669" : "#2563EB"}
              />
              <Text
                style={[
                  styles.followBtnText,
                  followed[item._id]
                    ? styles.followingText
                    : styles.notFollowingText,
                ]}
              >
                {followed[item._id] ? "Following" : "Follow"}
              </Text>
            </View>


          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.topbar, { height: headerHeight, opacity: headerOpacity }]}
      >
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
              styles.locationToggle,
              locationEnabled ? styles.locationEnabled : styles.locationDisabled,
            ]}
            onPress={handleLocationToggle}
            disabled={locationLoading}
            activeOpacity={0.8}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons
                  name={locationEnabled ? "location" : "location-outline"}
                  size={20}
                  color="white"
                />
                <Text style={styles.locationText}>
                  {locationEnabled ? "Nearby" : "All"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {loading ? (
        <ModernLoader locationLoading={locationLoading} />
      ) : filteredBusinesses.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={60} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 16 }}>
            No businesses found
          </Text>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredBusinesses}
          renderItem={renderBusiness}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 90 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          ListHeaderComponent={
            <>
              {/* --- Offers Carousel --- */}
              <View style={{ marginVertical: 12 }}>
                <AllOffersCarousel />
              </View>

              {/* --- Categories Section --- */}
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
                renderItem={({ item }) => {
                  const isActive = selectedCategory === item.name;
                  return (
                    <TouchableOpacity
                      style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                      onPress={() => setSelectedCategory(item.name)}
                      activeOpacity={0.5}
                    >
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
                      <Text
                        style={[styles.categoryText, isActive && styles.categoryTextActive]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              {/* --- Businesses Heading --- */}
              <View style={[styles.sectionHeading, { marginTop: 8 }]}>
                <Text style={styles.sectionTitle}>
                  {locationEnabled ? "Nearby Businesses" : "All Businesses"}
                </Text>
              </View>
            </>
          }
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
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: "flex-end",
    paddingBottom: 12,
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
  followContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginLeft: 8,
  },
  notFollowing: { borderColor: "#2563EB", backgroundColor: "white" },
  following: { borderColor: "#059669", backgroundColor: "#ECFDF5" },
  followBtnText: { fontSize: 13, fontWeight: "700" },
  notFollowingText: { color: "#2563EB" },
  followingText: { color: "#059669" },
  categoryBtn: { alignItems: "center", marginHorizontal: 6 },
  categoryBtnActive: { transform: [{ scale: 1.1 }] },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrapperActive: {
    backgroundColor: "#3e72e1ff",
    shadowOpacity: 0.15,
    elevation: 3,
  },
  categoryIcon: { width: 24, height: 24, borderRadius: 12 },
  categoryText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  categoryTextActive: { color: "#2563EB", fontWeight: "700" },
  sectionHeading: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
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
    alignItems: "center",
  },
  image: { width: 90, height: 90, borderRadius: 12, marginRight: 12 },
  info: { flex: 1, justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "700", color: "#111827" },
  category: { fontSize: 14, color: "#6B7280", marginVertical: 4 },
  distance: { fontSize: 13, color: "#2563EB", fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  locationToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locationEnabled: { backgroundColor: "#059669" },
  locationDisabled: { backgroundColor: "#2563EB" },
  locationText: { color: "white", fontWeight: "600", marginLeft: 6, fontSize: 14 },
  followerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  followerText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#374151", // neutral gray (professional)
    fontWeight: "500",
  },


});
