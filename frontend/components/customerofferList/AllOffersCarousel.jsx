import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import API from "../../api/axiosInstance";

const AllOffersCarousel = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/offer?active=true");
      setOffers(res.data);
    } catch (err) {
      console.log("Error fetching all offers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOffer = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Image */}
        <Image
          source={
            item.business?.images?.length
              ? { uri: item.business.images[0] }
              : require("../../assets/images/icon.png")
          }
          style={styles.image}
        />

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.row}>
            <Ionicons name="pricetag" size={14} color="#DC2626" />
            <Text style={styles.discount}>{item.discountPercent}% OFF</Text>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons
              name="storefront-outline"
              size={14}
              color="#374151"
            />
            <Text style={styles.business} numberOfLines={1}>
              {item.business?.name || "Business"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color="#2563EB" />
            <Text style={styles.location} numberOfLines={1}>
              {item.business?.location?.address || "Unknown"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="time-outline" size={13} color="#059669" />
            <Text style={styles.validity}>
              {new Date(item.validTo).toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity style={styles.btn}>
            <Ionicons name="gift-outline" size={14} color="white" />
            <Text style={styles.btnText}>Grab</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10 }}>Loading best offers...</Text>
      </View>
    );
  }

  if (!offers.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="gift-outline" size={50} color="#9CA3AF" />
        <Text style={{ marginTop: 8, color: "#6B7280" }}>
          No active offers available
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.heading}> Hot Deals Near You</Text>
      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
};

export default AllOffersCarousel;

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 10,
    color: "#111827",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 12,
    width: 160, // thoda narrow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 65, // 👈 chhota kiya
  },
  info: {
    padding: 6, // 👈 kam padding
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 1,
  },
  discount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
    marginLeft: 3,
  },
  business: {
    fontSize: 11,
    color: "#374151",
    marginLeft: 3,
    flexShrink: 1,
  },
  location: {
    fontSize: 10,
    color: "#2563EB",
    marginLeft: 3,
    flexShrink: 1,
  },
  validity: {
    fontSize: 10,
    color: "#059669",
    marginLeft: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1, // 👈 spacing kam
  },
  btn: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4, // 👈 spacing kam
    alignSelf: "flex-start",
    paddingHorizontal: 7,
  },
  btnText: {
    color: "white",
    marginLeft: 3,
    fontWeight: "600",
    fontSize: 11,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
});

