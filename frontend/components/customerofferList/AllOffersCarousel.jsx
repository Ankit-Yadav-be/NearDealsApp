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
import { LinearGradient } from "expo-linear-gradient";
import {useRouter} from "expo-router"
const AllOffersCarousel = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
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
      <TouchableOpacity onPress={()=>{router.push(`/(customer)/${item.business._id}`)}}>
        <View style={styles.card}>
        <Image
          source={
            item.business?.images?.length
              ? { uri: item.business.images[0] }
              : require("../../assets/images/icon.png")
          }
          style={styles.image}
        />
        {/* Ribbon-style discount badge */}
        <LinearGradient
          colors={["#DC2626", "#F87171"]}
          style={styles.discountBadge}
        >
          <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
        </LinearGradient>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

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

          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={13} color="#059669" />
              <Text style={styles.validity}>
                {new Date(item.validTo).toLocaleDateString()}
              </Text>
            </View>

            <TouchableOpacity style={styles.btn}>
              <LinearGradient
                colors={["#2563EB", "#3B82F6"]}
                style={styles.btnGradient}
              >
                <Ionicons name="gift-outline" size={14} color="white" />
                <Text style={styles.btnText}>Grab</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#374151" }}>
          Loading hot deals...
        </Text>
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
    <View style={{ marginTop: 1, }}>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginRight: 12,
    marginBottom:4,
    width: 180,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  discountText: {
    color: "white",
    fontWeight: "700",
    fontSize: 11,
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  business: {
    fontSize: 11,
    color: "#374151",
    marginLeft: 3,
    flexShrink: 1,
  },
  location: {
    fontSize: 11,
    color: "#2563EB",
    marginLeft: 3,
    flexShrink: 1,
  },
  validity: {
    fontSize: 11,
    color: "#059669",
    marginLeft: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  btn: {
    marginTop: 1,
    alignSelf: "flex-start",
    borderRadius: 6,
    overflow: "hidden",
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 12,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
});
