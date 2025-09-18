import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import API from "../../api/axiosInstance";

const BusinessOffersList = ({ businessId }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOffer, setExpandedOffer] = useState(null); // 👈 Track expanded offer

  useEffect(() => {
    fetchOffers();
  }, [businessId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/offer/${businessId}?active=true`);
      setOffers(res.data);
    } catch (err) {
      console.log("Error fetching offers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOffer = ({ item, index }) => {
    const fadeAnim = new Animated.Value(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 120,
      useNativeDriver: true,
    }).start();

    const isExpanded = expandedOffer === item._id;

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.card}>
          {/* Business Image */}
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
            {/* Title + Discount Badge */}
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.badge}>
                <Ionicons name="pricetag" size={14} color="white" />
                <Text style={styles.badgeText}>
                  {item.discountPercent}% OFF
                </Text>
              </View>
            </View>

            {/* 👇 Description (Expandable) */}
            <TouchableOpacity
              onPress={() =>
                setExpandedOffer(isExpanded ? null : item._id)
              }
              activeOpacity={0.7}
            >
              <Text
                style={styles.desc}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {item.description}
              </Text>
              {!isExpanded && item.description?.length > 80 && (
                <Text style={styles.readMore}>...Read More</Text>
              )}
            </TouchableOpacity>

            {/* Business details */}
            <View style={styles.detailsRow}>
              <MaterialCommunityIcons
                name="storefront"
                size={16}
                color="#374151"
              />
              <Text style={styles.businessName}>{item.business?.name}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Ionicons name="apps-outline" size={15} color="#6B7280" />
              <Text style={styles.category}>{item.business?.category}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Ionicons name="calendar-outline" size={15} color="#059669" />
              <Text style={styles.validity}>
                {new Date(item.validFrom).toLocaleDateString()} -{" "}
                {new Date(item.validTo).toLocaleDateString()}
              </Text>
            </View>

            {/* CTA Button */}
            <TouchableOpacity style={styles.btn}>
              <Ionicons name="gift-outline" size={18} color="white" />
              <Text style={styles.btnText}>Grab Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, fontSize: 15, color: "#374151" }}>
          Loading offers...
        </Text>
      </View>
    );
  }

  if (!offers.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="gift-outline" size={60} color="#9CA3AF" />
        <Text style={{ marginTop: 10, fontSize: 15, color: "#6B7280" }}>
          No active offers available
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={offers}
      renderItem={renderOffer}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default BusinessOffersList;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 14,
    marginRight: 14,
  },
  info: { flex: 1 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1 },
  desc: { fontSize: 13, color: "#6B7280", marginVertical: 4 },
  readMore: { fontSize: 12, color: "#2563EB", marginTop: -2 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    color: "white",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  businessName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 4,
  },
  category: { fontSize: 12, color: "#6B7280", marginLeft: 4 },
  validity: { fontSize: 12, color: "#059669", marginLeft: 4 },

  btn: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    alignSelf: "flex-start",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: { color: "white", marginLeft: 6, fontWeight: "700", fontSize: 14 },

  center: { alignItems: "center", justifyContent: "center", marginTop: 40 },
});
