import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message"; // ✅ Toast import
import API from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import CustomerOffer from "../../components/customerofferList/CustomerOffer";

const CustomerBusinessDetailPage = () => {
  const { businessDetail } = useLocalSearchParams();
  const token = useAuthStore((s) => s.token);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBusinessDetail();
    fetchReviews();
  }, [businessDetail]);

  const fetchBusinessDetail = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/business/${businessDetail}`);
      setBusiness(res.data);
      Toast.show({
        type: "success",
        text1: "Business loaded successfully!",
      });
    } catch (err) {
      console.log("❌ Fetch Business Detail Error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load business",
        text2: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/review/${businessDetail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err) {
      console.log("❌ Fetch Reviews Error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load reviews",
      });
    }
  };

  const submitReview = async () => {
    if (!rating || !comment.trim()) {
      Toast.show({
        type: "info",
        text1: "Rating and comment required",
      });
      return;
    }
    try {
      setSubmitting(true);
      await API.post(
        `/review/${businessDetail}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      setRating(0);
      setReviewModal(false);
      fetchReviews();
      fetchBusinessDetail();
      Toast.show({
        type: "success",
        text1: "Review submitted!",
      });
    } catch (err) {
      console.log("❌ Submit Review Error:", err.response?.data || err);
      Toast.show({
        type: "error",
        text1: "Failed to submit review",
        text2: err.response?.data?.message || "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 8, color: "#374151" }}>
          Loading Business...
        </Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color="red" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "red" }}>
          Business not found
        </Text>
        <TouchableOpacity
          style={[styles.submitBtn, { marginTop: 12, backgroundColor: "#EF4444" }]}
          onPress={fetchBusinessDetail}
        >
          <Text style={styles.submitText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Details</Text>
        <View style={styles.actions}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search businesses..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setReviewModal(true)}
            style={styles.reviewBtn}
          >
            <Ionicons name="star-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Offers List */}
      <View >
        <CustomerOffer businessId={businessDetail} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Image Gallery */}
        {business.images?.length > 0 ? (
          <FlatList
            data={business.images}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} />
            )}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Image
            source={require("../../assets/images/icon.png")}
            style={[styles.image, { alignSelf: "center" }]}
          />
        )}

        {/* Business Info */}
        <View style={styles.card}>
          <Text style={styles.name}>{business.name}</Text>
          <Text style={styles.category}>{business.category}</Text>
          <Text style={styles.description}>{business.description}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>
              {business.averageRating?.toFixed(1) || 0} (
              {business.numReviews || 0} reviews)
            </Text>
          </View>
        </View>

        {/* Owner */}
        {business.owner && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>👤 Owner Details</Text>
            <Text style={styles.detailText}>{business.owner?.name || "N/A"}</Text>
            <Text style={styles.detailText}>{business.owner?.email || "N/A"}</Text>
          </View>
        )}

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📞 Contact Info</Text>
          <Text style={styles.detailText}>{business.contact?.phone || "N/A"}</Text>
          <Text style={styles.detailText}>{business.contact?.email || "N/A"}</Text>
          <Text style={styles.detailText}>{business.contact?.website || "N/A"}</Text>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <Text style={styles.detailText}>{business.location?.address || "N/A"}</Text>
          <Text style={styles.detailText}>
            {business.location?.city}, {business.location?.state}
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⭐ Customer Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.detailText}>No reviews yet</Text>
          ) : (
            reviews.map((r, i) => (
              <View key={i} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="#2563EB"
                  />
                  <Text style={styles.reviewUser}>
                    {r.user?.name || "Anonymous"}
                  </Text>
                  <Text style={styles.reviewRating}>⭐ {r.rating}</Text>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={28}
                    color="#FFD700"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your review..."
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submitReview}
              disabled={submitting}
            >
              <Text style={styles.submitText}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setReviewModal(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: "#EF4444", textAlign: "center" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast Component */}
      <Toast />
    </View>
  );
};

export default CustomerBusinessDetailPage;



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingBottom: 80, marginTop:0 },

  // Header
  header: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  actions: { flexDirection: "row", alignItems: "center" },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 15,
    height: 42,
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 15, marginLeft: 6 },
  reviewBtn: {
    backgroundColor: "#4338CA",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  // Business
  image: { width: 240, height: 160, borderRadius: 16, marginRight: 12 },
  name: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 6 },
  category: { fontSize: 16, color: "#6B7280", marginBottom: 6 },
  description: { fontSize: 15, color: "#4B5563", marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  ratingText: { marginLeft: 6, fontWeight: "600", color: "#111827" },

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: 8, color: "#1F2937" },
  detailText: { fontSize: 14, color: "#374151", marginVertical: 2 },

  // Review list
  reviewItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  reviewUser: { fontWeight: "600", fontSize: 14, marginLeft: 6, flex: 1, color: "#111827" },
  reviewRating: { color: "#F59E0B", fontSize: 14, fontWeight: "600" },
  reviewComment: { fontSize: 14, color: "#374151", marginLeft: 30 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: { fontSize: 19, fontWeight: "700", marginBottom: 14, textAlign: "center", color: "#111827" },
  ratingRow: { flexDirection: "row", justifyContent: "center", marginBottom: 14 },
  commentInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 14,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
  },
  submitBtn: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  submitText: { color: "white", fontWeight: "700", fontSize: 16 },
});
