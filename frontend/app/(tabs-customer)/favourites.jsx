import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import API from "../../api/axiosInstance";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

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
   fetchFavourites(); // Screen dikhte hi dubara load hoga
  }, [])
);

  const renderFavourite = ({ item }) => {
    const business = item.business;

    const fadeAnim = new Animated.Value(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const fullAddress = business.location
      ? `${business.location.address}, ${business.location.city}, ${business.location.state}`
      : "Address not available";

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push(`/(customer)/${business._id}`)}
        >
          <Image
            source={
              business.images?.length
                ? { uri: business.images[0] }
                : require("../../assets/images/icon.png")
            }
            style={styles.image}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{business.name}</Text>
            <View style={styles.row}>
              <Text style={styles.category}>{business.category}</Text>
              {business.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#34D399"
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={14} color="#6EE7B7" />
              <Text style={styles.location}> {fullAddress}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.unfollowBtn}
            onPress={async () => {
              try {
                await API.delete(`/follow/${business._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                Toast.show({ type: "success", text1: "Unfollowed" });
                fetchFavourites();
              } catch (err) {
                Toast.show({ type: "error", text1: "Failed to unfollow" });
              }
            }}
          >
            <MaterialIcons name="delete-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Favourites</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 30 }} />
      ) : favourites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={80} color="#9CA3AF" />
          <Text style={styles.emptyText}>You haven't followed any business yet</Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          renderItem={renderFavourite}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 16 }}
        />
      )}
      <Toast />
    </View>
  );
};

export default Favourites;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", paddingTop: 16 },
  header: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 16,
  },
  image: { width: 100, height: 100, borderRadius: 16, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 20, fontWeight: "800", color: "#111827" },
  category: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  location: { fontSize: 13, color: "#10B981", fontWeight: "500" },
  unfollowBtn: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 16, color: "#9CA3AF", marginTop: 12, textAlign: "center" },
});
