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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import API from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";

const CustomerTrendingPage = () => {
  const token = useAuthStore((s) => s.token);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router  = useRouter();
  const fetchTrendingBusinesses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/trending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrending(res.data);
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

  const renderItem = ({ item, index }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}
      onPress={() => router.push(`/(customer)/${item.businessId}`)}
    >
      {/* Rank */}
      <View style={styles.rankWrapper}>
        <Text style={styles.rank}>{index + 1}</Text>
        <MaterialCommunityIcons
          name="fire"
          size={24}
          color="#F59E0B"
          style={{ marginLeft: 4 }}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>
          <Ionicons name="pricetag-outline" size={14} color="#6B7280" /> {item.category}
        </Text>
        <Text style={styles.location}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />{" "}
          {item.location?.address || "N/A"}, {item.location?.city || ""},{" "}
          {item.location?.state || ""}
        </Text>
      </View>

      {/* Visitor Badge */}
      <View style={styles.visitsWrapper}>
        <View style={styles.visitsBadge}>
          <MaterialCommunityIcons name="account-group-outline" size={16} color="#fff" />
          <Text style={styles.visits}>{item.visitCount} Visitors</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Trending Businesses</Text>
          <Text style={styles.topBarSubtitle}>Discover the most visited places this week</Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={trending}
        keyExtractor={(item) => item.businessId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
        }
      />

      <Toast />
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
    </View>
  );
};

export default CustomerTrendingPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6B7280", fontSize: 16 },
  noDataText: { marginTop: 12, fontSize: 16, color: "#EF4444", textAlign: "center" },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "##6D28D9",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
    elevation: 3,
  },
  retryText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // Top App Bar
  topBar: {
    backgroundColor: "#4F46E5",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  topBarTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  topBarSubtitle: { fontSize: 14, color: "#E0E7FF", marginTop: 4 },
  topBarIcons: { flexDirection: "row" },
  iconBtn: {
    marginLeft: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  rankWrapper: { flexDirection: "row", alignItems: "center", width: 40 },
  rank: { fontSize: 18, fontWeight: "700", color: "#4F46E5" },
  info: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: "700", color: "#111827" },
  category: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  location: { fontSize: 13, color: "#374151", marginTop: 2 },
  visitsWrapper: { alignItems: "center", justifyContent: "center" },
  visitsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  visits: { color: "#fff", fontWeight: "600", fontSize: 14, marginLeft: 6 },
});
