import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  TextInput,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import API from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";

// मान लीजिए कि आपके पास इस पाथ पर एक डिफ़ॉल्ट इमेज है।
const DEFAULT_IMAGE_PATH = require("../../assets/images/icon.png");

const CustomerTrendingPage = () => {
  const token = useAuthStore((s) => s.token);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchTrendingBusinesses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/trending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // ✅ Mocking हटाया गया, अब सीधे API डेटा का उपयोग होगा
      // हम केवल isFavorite को मॉक रख रहे हैं क्योंकि यह API से नहीं आ रहा होगा
      const dataWithMockedFavorites = res.data.map((item, index) => ({
        ...item,
        isFavorite: (index % 3 === 0), // Mock favorite state
      }));

      setTrending(dataWithMockedFavorites);
    } catch (err) {
      console.log("❌ Fetch Trending Error:", err.response?.data || err);
      Toast.show({ type: "error", text1: "Failed to load trending businesses" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingBusinesses();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrendingBusinesses();
    setRefreshing(false);
  }, []);

  const renderProductCard = ({ item }) => {
    // API से आने वाले averageRating को 1 दशमलव स्थान तक Format करें
    const displayRating = item.averageRating
      ? item.averageRating.toFixed(1)
      : 'N/A';
      
    // API से आने वाले reviewCount का उपयोग करें
    const displayReviewCount = item.reviewCount || 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.85}
        onPress={() => router.push(`/(customer)/${item.businessId}`)}
      >
        {/* Business Image Implementation */}
        <View style={styles.cardImageContainer}>
          <Image
            source={
              item.images?.length
                ? { uri: item.images[0] }
                : DEFAULT_IMAGE_PATH
            }
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        {/* Favorite Icon */}
        <TouchableOpacity style={styles.favoriteIcon} onPress={() => {}}>
          <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={22} color={item.isFavorite ? "#EF4444" : "#A0A0A0"} />
        </TouchableOpacity>
        
        {/* Business Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardType}>Trending</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          
          {/* ✅ Rating & Review Count Ab Dynamic hain */}
          <View style={styles.cardRating}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.cardRatingText}>{displayRating}</Text>
            <Text style={styles.cardReviewText}>| {displayReviewCount}</Text>
          </View>
          
          <Text style={styles.cardPrice}>
            {item.location?.city || "City N/A"}
          </Text>
          <View style={styles.cardVisitsBadge}>
              <MaterialCommunityIcons name="account-group-outline" size={12} color="#4F46E5" />
              <Text style={styles.cardVisitsText}>{item.visitCount} Visitors</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Fetching latest trending businesses...</Text>
      </View>
    );
  }

  if (trending.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={styles.noDataText}>No trending businesses available right now.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchTrendingBusinesses}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Top Bar with ONLY Search (Icons removed) */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>
      
      {/* Product List Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Businesses</Text>
        <TouchableOpacity>
          <Text style={styles.seeMoreText}>See more</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trending}
        keyExtractor={(item) => item.businessId}
        renderItem={renderProductCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
        }
      />

      <Toast />
    </View>
  );
};

export default CustomerTrendingPage;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F3F4F6", 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#fff" 
  },
  loadingText: { 
    marginTop: 10, 
    color: "#6B7280", 
    fontSize: 16 
  },
  noDataText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: "#EF4444", 
    textAlign: "center" 
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
    elevation: 3,
  },
  retryText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },

  // --- Top Bar (Search Only) ---
  topBar: {
    paddingTop: 10, 
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff", 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  searchContainer: {
    flex: 1, 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6", 
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 0,
  },

  // --- Section Header ---
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  seeMoreText: {
    fontSize: 14,
    color: "#38A169", 
    fontWeight: "600",
  },

  // --- Product Card ---
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImageContainer: {
    height: 150,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10, 
  },
  cardInfo: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardType: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardRatingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "600",
  },
  cardReviewText: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#38A169", 
  },
  cardVisitsBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#E0E7FF", 
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  cardVisitsText: { 
    color: "#4F46E5", 
    fontSize: 11, 
    fontWeight: "600", 
    marginLeft: 4 
  },
});