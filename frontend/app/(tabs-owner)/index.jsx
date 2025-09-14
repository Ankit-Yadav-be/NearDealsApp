import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import API from "../../api/axiosInstance";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";

const OwnerHome = () => {
  const { token } = useAuthStore();
  const router = useRouter();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch owner's businesses
  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await API.get("/business", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(res.data);
    } catch (error) {
      console.log("Error fetching businesses:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch businesses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(owner)/${item._id}`)}
    >
      <Image
        source={
          item.images?.length
            ? { uri: item.images[0] }
            : require("../../assets/images/icon.png")
        }
        style={styles.businessImage}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!businesses.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="business-outline" size={50} color="#9CA3AF" />
        <Text style={styles.emptyText}>No businesses found.</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs-owner)/create-business")}
        >
          <AntDesign name="pluscircleo" size={20} color="white" />
          <Text style={styles.addBtnText}>Add Your First Business</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Topbar with Search */}
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>My Businesses</Text>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs-owner)/create-business")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default OwnerHome;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // Topbar
  topbar: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  topbarTitle: { color: "white", fontSize: 22, fontWeight: "700", marginBottom: 10 },
  searchWrapper: {
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

  // Modern Card
  card: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  businessImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    marginRight: 12,
  },
  infoContainer: { flex: 1 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 4 },
  category: { fontSize: 14, color: "#2563EB", marginBottom: 4 },
  description: { fontSize: 13, color: "#6B7280" },

  // Loader
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: { fontSize: 16, color: "#6B7280", marginVertical: 16 },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: { color: "white", fontSize: 14, marginLeft: 8 },

  // Floating Action Button
  fab: {
    position: "absolute",
    bottom: 25,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
