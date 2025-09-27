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
  Dimensions,
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // Horizontal card ka size screen width ka 75%

const DEFAULT_IMAGE_PATH = require("../../assets/images/icon.png");

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
  // ✅ (NEW) State for Followed Businesses
  const [followedBusinesses, setFollowedBusinesses] = useState([]); 
  const [followedLoading, setFollowedLoading] = useState(false); 

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
      fetchCategories();
      // ✅ Fetch followed businesses on screen focus
      fetchFollowedBusinesses(); 
    }, [])
  );

  const fetchFollowersCount = async (businessId) => {
    try {
      const res = await API.get(`/follow/business/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowerCounts((prev) => ({
        ...prev,
        [businessId]: res.data.length,
      }));
    } catch (err) {
      console.log("Failed to fetch followers count", err);
    }
  };
  
  // ✅ (NEW) Function to fetch followed businesses (using /follow/my API)
  const fetchFollowedBusinesses = async () => {
    try {
      setFollowedLoading(true);
      const res = await API.get("/follow/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The API returns an array like [{ _id, business, user }], we need 'business' object
      const businessesArray = res.data.map(item => ({ 
          ...item.business, 
          // Set initial follow status for cards
          isFollowed: true 
      }));
      setFollowedBusinesses(businessesArray);
      
      // Update the global 'followed' map for toggleFollow to work correctly
      const followMap = {};
      businessesArray.forEach((b) => {
          followMap[b._id] = true; 
          fetchFollowersCount(b._id); // Also fetch followers count for these businesses
      });
      // Merge with existing followed state, prioritizing followed businesses
      setFollowed((prev) => ({ ...prev, ...followMap }));

    } catch (err) {
      console.log("Failed to fetch followed businesses:", err);
    } finally {
      setFollowedLoading(false);
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
        fetchFollowersCount(b._id);
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
        
        // After unfollow, remove it from followedBusinesses list
        setFollowedBusinesses(prev => prev.filter(b => b._id !== businessId));

      } else {
        await API.post(`/follow/${businessId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        Toast.show({ type: "success", text1: "Followed business" });

        setFollowerCounts((prev) => ({
          ...prev,
          [businessId]: (prev[businessId] || 0) + 1,
        }));
        
        // Since the current list (filteredBusinesses) contains the full business object,
        // we can find it and add it to the followedBusinesses list (optional, but makes UI seamless)
        const businessToFollow = businesses.find(b => b._id === businessId);
        if(businessToFollow) {
            setFollowedBusinesses(prev => [businessToFollow, ...prev]);
        }
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

  // ✅ Horizontal Card Renderer
  const renderHorizontalBusinessCard = ({ item }) => {
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
    
    // Check follow status from the main 'followed' map
    const isCurrentlyFollowed = followed[item._id];

    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/(customer)/${item._id}`)}
      >
        {/* Image Container */}
        <View style={styles.horizontalImageContainer}>
          <Image
            source={
              item.images?.length
                ? { uri: item.images[0] }
                : DEFAULT_IMAGE_PATH
            }
            style={styles.horizontalImage}
            resizeMode="cover"
          />
            {/* Floating Follow Button (Uses the main 'followed' state) */}
          <TouchableOpacity
            style={[
              styles.cardFollowBtn,
              isCurrentlyFollowed ? styles.cardFollowing : styles.cardNotFollowing,
            ]}
            onPress={(e) => {
                e.stopPropagation(); // Prevent card click
                toggleFollow(item._id);
            }}
            activeOpacity={0.8}
          >
             <Ionicons
               name={isCurrentlyFollowed ? "heart" : "heart-outline"}
               size={18}
               color={isCurrentlyFollowed ? "white" : "white"}
             />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.horizontalCategory} numberOfLines={1}>{item.category}</Text>
          
          <View style={styles.horizontalBottomRow}>
            <View style={styles.horizontalFollowerRow}>
              <Ionicons name="people-outline" size={13} color="#6B7280" />
              <Text style={styles.horizontalFollowerText}>
                {followerCounts[item._id] || 0}
              </Text>
            </View>
            <Text style={styles.horizontalDistance} numberOfLines={1}>{distanceText}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  // ----------------------------------------------------------------------


  // Vertical List abhi bhi chahiye to yahan rakha hai, agar nahi chahiye to aap isse hata sakte hain
  const renderVerticalBusinessCard = ({ item }) => {
    let distanceText = locationEnabled ? "📍 Nearby" : "🌐 Global";
    // ... distance calculation logic
    if (locationEnabled && userCoords && item.location?.coordinates) {
      const [lng, lat] = item.location.coordinates;
      distanceText = `📍 ${getDistanceFromLatLon(
        userCoords.latitude,
        userCoords.longitude,
        lat,
        lng
      )} km away`;
    }
    
    return (
      <TouchableOpacity
        style={styles.verticalCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/(customer)/${item._id}`)}
      >
        <Image
          source={
            item.images?.length
              ? { uri: item.images[0] }
              : DEFAULT_IMAGE_PATH
          }
          style={styles.verticalImage}
        />
        <View style={styles.verticalInfo}>
          <Text style={styles.verticalName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.verticalCategory}>{item.category}</Text>
          <Text style={styles.verticalDistance}>{distanceText}</Text>
          <View style={styles.verticalFollowerRow}>
            <Ionicons name="people-outline" size={15} color="#374151" />
            <Text style={styles.verticalFollowerText}>
              {followerCounts[item._id] || 0} Followers
            </Text>
          </View>
        </View>
        
        {/* Vertical List Follow Button */}
        <TouchableOpacity
          style={[
            styles.verticalFollowBtn,
            followed[item._id] ? styles.verticalFollowing : styles.verticalNotFollowing,
          ]}
          onPress={() => toggleFollow(item._id)}
          activeOpacity={0.8}
        >
          <View style={styles.verticalFollowContent}>
            <Ionicons
              name={
                followed[item._id] ? "checkmark-circle" : "add-circle-outline"
              }
              size={16}
              color={followed[item._id] ? "#059669" : "#2563EB"}
            />
            <Text
              style={[
                styles.verticalFollowBtnText,
                followed[item._id]
                  ? styles.verticalFollowingText
                  : styles.verticalNotFollowingText,
              ]}
            >
              {followed[item._id] ? "Following" : "Follow"}
            </Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  // ----------------------------------------------------------------------


  return (
    <View style={styles.container}>
      {/* Animated Header/Topbar */}
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

      {/* Main Content List */}
      {loading ? (
        <ModernLoader locationLoading={locationLoading} />
      ) : (
        <Animated.FlatList
          data={filteredBusinesses}
          renderItem={renderVerticalBusinessCard} // Vertical list for filtering results (fallback)
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
                <Text style={styles.sectionTitle}>Shop Categories</Text>
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
                      activeOpacity={0.7}
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

              {/* --- FOLLOWED BUSINESSES SECTION (Horizontal) --- */}
              <View style={[styles.sectionHeading, { marginTop: 12, marginBottom: 8 }]}>
                <Text style={styles.sectionTitle}>
                  Your Followed Businesses
                </Text>
                {/* Changed navigation to Favourites page */}
                <TouchableOpacity onPress={() => router.push('/(tabs-customer)/favourites')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {followedLoading ? (
                  <View style={[styles.center, { height: 150, alignSelf: 'stretch' }]}>
                      <ActivityIndicator size="small" color="#2563EB" />
                      <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Loading followed businesses...</Text>
                  </View>
              ) : followedBusinesses.length > 0 ? (
                <FlatList
                  // ✅ Using followedBusinesses for the horizontal list
                  data={followedBusinesses}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `followed-horizontal-${item._id}`}
                  renderItem={renderHorizontalBusinessCard}
                  contentContainerStyle={styles.horizontalListContent}
                  snapToInterval={CARD_WIDTH + 10} // Snap to card width + margin
                  decelerationRate="fast"
                />
              ) : (
                <View style={[styles.center, { height: 150, alignSelf: 'stretch' }]}>
                    <Text style={{ color: "#9CA3AF" }}>You are not following any business yet.</Text>
                </View>
              )}
              
              {/* --- Businesses Heading (Vertical List Header) --- */}
              <View style={[styles.sectionHeading, { marginTop: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 8 }]}>
                <Text style={styles.sectionTitle}>
                  {locationEnabled ? "Nearby Results" : "All Results"}
                </Text>
                <Text style={styles.seeAllText}>{filteredBusinesses.length} Found</Text>
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

// ---------------------------------
// --- STYLES ---
// ---------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  
  // --- Header/Topbar Styles (Same) ---
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
    position: 'absolute', // Make it absolute for a smooth floating feel
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it's above the list
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
  
  // --- Section Headings (Updated with See All) ---
  sectionHeading: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingVertical: 8 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#111827" 
  },
  seeAllText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },

  // --- Categories Styles (Same) ---
  categoryBtn: { alignItems: "center", marginHorizontal: 6 },
  categoryBtnActive: { transform: [{ scale: 1.05 }] },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrapperActive: {
    backgroundColor: "#2563EB",
    shadowOpacity: 0.15,
    elevation: 3,
  },
  categoryIcon: { width: 28, height: 28, borderRadius: 14 },
  categoryText: { fontSize: 12, fontWeight: "600", color: "#374151", maxWidth: 70, textAlign: 'center' },
  categoryTextActive: { color: "#2563EB", fontWeight: "700" },

  // --- FEATURED BUSINESS (Horizontal Card Styles) ---
  horizontalListContent: {
    paddingHorizontal: 16,
  },
  horizontalCard: {
    width: CARD_WIDTH, 
    height: 200,
    backgroundColor: "white",
    borderRadius: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    overflow: 'hidden',
  },
  horizontalImageContainer: {
    height: 120,
    position: 'relative',
  },
  horizontalImage: { 
    width: '100%', 
    height: '100%',
  },
  cardFollowBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 18,
    // Change opacity for better visibility on horizontal cards
    backgroundColor: 'rgba(0,0,0,0.4)', 
    zIndex: 5,
  },
  cardFollowing: {
    backgroundColor: '#EF4444', // Red color for 'heart' on followed cards
  },
  cardNotFollowing: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  horizontalInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  horizontalName: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#111827",
  },
  horizontalCategory: { 
    fontSize: 12, 
    color: "#2563EB", 
    fontWeight: "600",
    marginTop: 2,
  },
  horizontalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  horizontalDistance: { 
    fontSize: 11, 
    color: "#9CA3AF", 
    fontWeight: "500",
  },
  horizontalFollowerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalFollowerText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6B7280", 
    fontWeight: "500",
  },
  
  // --- Vertical Card Styles (Fallback/Detailed List) ---
  verticalCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  verticalImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  verticalInfo: { flex: 1, justifyContent: "center" },
  verticalName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  verticalCategory: { fontSize: 13, color: "#6B7280", marginVertical: 2 },
  verticalDistance: { fontSize: 12, color: "#2563EB", fontWeight: "600" },
  verticalFollowerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  verticalFollowerText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  verticalFollowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    marginLeft: 8,
  },
  verticalNotFollowing: { borderColor: "#2563EB", backgroundColor: "white" },
  verticalFollowing: { borderColor: "#059669", backgroundColor: "#ECFDF5" },
  verticalFollowContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  verticalFollowBtnText: { fontSize: 12, fontWeight: "700" },
  verticalNotFollowingText: { color: "#2563EB" },
  verticalFollowingText: { color: "#059669" },
});