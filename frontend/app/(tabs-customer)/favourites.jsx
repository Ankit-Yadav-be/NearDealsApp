import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import API from "../../api/axiosInstance";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

// मान लीजिए कि आपके पास इस पाथ पर एक डिफ़ॉल्ट इमेज है।
const DEFAULT_IMAGE_PATH = require("../../assets/images/icon.png");

const Favourites = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const router = useRouter();

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await API.get("/follow/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavourites(res.data);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to fetch favourites" });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavourites();
    }, [])
  );

  const handleUnfollow = async (businessId) => {
    try {
      await API.delete(`/follow/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.show({ type: "success", text1: "Unfollowed successfully" });
      fetchFavourites();
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to unfollow" });
    }
  };

  const renderFavourite = ({ item }) => {
    const business = item.business;

    const fullAddress = business.location
      ? `${business.location.address}, ${business.location.city}`
      : "Address not available";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/(customer)/${business._id}`)}
      >
        <Image
          source={
            business.images?.length
              ? { uri: business.images[0] }
              : DEFAULT_IMAGE_PATH
          }
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {business.name}
          </Text>
          <View style={styles.categoryRow}>
            <Ionicons name="pricetag-outline" size={14} color="#6EE7B7" />
            <Text style={styles.category}> {business.category}</Text>
            {business.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#34D399"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#6EE7B7" />
            <Text style={styles.location} numberOfLines={1}> {fullAddress}</Text>
          </View>
        </View>
        
        {/* Floating Unfollow Button */}
        <TouchableOpacity
          style={styles.unfollowBtn}
          onPress={(e) => {
            e.stopPropagation(); 
            handleUnfollow(business._id);
          }}
        >
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Curved Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Your Favourites</Text>
        <Text style={styles.headerSubtitle}>Businesses you follow ({favourites.length})</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 30 }} />
        ) : favourites.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-dislike-outline" size={80} color="#9CA3AF" />
            <Text style={styles.emptyText}>You haven't followed any business yet.</Text>
            <TouchableOpacity style={styles.browseBtn}>
              <Text style={styles.browseBtnText}>Explore Businesses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favourites}
            renderItem={renderFavourite}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <Toast />
    </View>
  );
};

export default Favourites;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F3F4F6", 
  },
  
  // --- Header Style (Dark, Curved, Premium) ---
  topHeader: {
    backgroundColor: "#4F46E5", 
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#C7D2FE",
  },
  
  // --- Content and List Styles ---
  content: {
    flex: 1,
    paddingHorizontal: 0, 
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // --- Card Style (Elevated and Clean) ---
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    shadowColor: "#10B981", 
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 16,
    position: 'relative', 
  },
  image: { 
    width: 90, 
    height: 90, 
    borderRadius: 12, 
    marginRight: 15,
  },
  info: { 
    flex: 1,
    // ✅ Fix: Right margin added to prevent overlap with unfollowBtn
    marginRight: 40, 
  },
  name: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#111827",
    marginBottom: 4,
  },
  categoryRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 2,
  },
  category: { 
    fontSize: 14, 
    color: "#10B981", 
    fontWeight: "600",
  },
  locationRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 6,
  },
  location: { 
    fontSize: 13, 
    color: "#6B7280", 
    fontWeight: "500",
    flexShrink: 1,
  },
  
  // --- Floating Unfollow Button ---
  unfollowBtn: {
    backgroundColor: "#EF4444", 
    padding: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  
  // --- Empty State ---
  empty: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: { 
    fontSize: 18, 
    color: "#6B7280", 
    marginTop: 18, 
    textAlign: "center",
    fontWeight: '500',
  },
  browseBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 25,
    elevation: 3,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '600',
  }
});