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
import { Ionicons } from "@expo/vector-icons"; // AntDesign is no longer needed

// Component renamed for Admin context
const AdminBusinessList = () => {
  const { token, user } = useAuthStore(); // Added 'user' to potentially show owner name
  const router = useRouter();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch ALL businesses (as an admin)
  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      // Your /business route fetches all and populates the owner, which is great for the admin view.
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
      // Assuming a specific Admin Detail screen (you might need to create this)
      onPress={() => router.push(`/(owner)/${item._id}`)}
    >
      {/* Image */}
      <Image
        source={
          item.images?.length
            ? { uri: item.images[0] }
            : require("../../assets/images/icon.png") // Ensure you have a default image path
        }
        style={styles.businessImage}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.category}>Category: {item.category}</Text>
        {/* Display the owner's name for Admin context */}
        <Text style={styles.ownerText}>Owner: {item.owner?.name || "N/A"}</Text>
        <Text numberOfLines={1} style={styles.description}>
          {item.description}
        </Text>
      </View>
      {/* Verification status for Admin visibility */}
      <View style={styles.statusBadge}>
        <Ionicons 
            name={item.isVerified ? "shield-checkmark" : "warning"} 
            size={20} 
            color={item.isVerified ? "#10B981" : "#F59E0B"} 
        />
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

  // Admin Empty State (removed "Add" button)
  if (!businesses.length && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="business-outline" size={50} color="#9CA3AF" />
        <Text style={styles.emptyText}>No businesses found in the system.</Text>
        <Text style={styles.emptySubtitle}>The business directory is currently empty.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Topbar with Search (Header changed) */}
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>All Businesses (Admin View)</Text>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search all businesses..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 14, paddingBottom: 20 }} // FAB removed, so adjusted padding
      />

      {/* FAB (Floating Action Button) removed */}
      
    </View>
  );
};

export default AdminBusinessList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // Topbar
  topbar: {
    backgroundColor: "#DC2626", // Changed color to differentiate Admin (e.g., Red)
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
    backgroundColor: "#FEF2F2", // Light background for search
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
  category: { fontSize: 13, color: "#6B7280" },
  ownerText: { fontSize: 13, color: "#9CA3AF", marginTop: 2 }, // New style for owner info
  description: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  statusBadge: { 
    marginHorizontal: 8,
  },

  // Loader
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Empty State (Modified)
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50, // To center it nicely below the header
  },
  emptyText: { fontSize: 18, fontWeight: '600', color: "#111827", marginVertical: 10 },
  emptySubtitle: { fontSize: 14, color: "#6B7280" },
  // addButton and fab styles are removed
});