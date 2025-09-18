import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API from "../../api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import OfferModal from "../../components/ownerOfferModal/Offer"; 

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const OwnerBusinessDetailPage = () => {
  const { businessDetail } = useLocalSearchParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);

  // Edit Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
   const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    website: "",
  });

  // Reviews Modal state
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchBusinessDetail = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/business/${businessDetail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusiness(res.data);
    } catch (error) {
      console.log("Error fetching business:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch business details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessDetail) fetchBusinessDetail();
  }, [businessDetail]);

  const handleDelete = async () => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this business?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/business/${businessDetail}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Deleted", "Business removed successfully!");
            router.back();
          } catch (error) {
            console.log("Delete error:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to delete business.");
          }
        },
      },
    ]);
  };

  const openEditModal = () => {
    if (business) {
      setEditForm({
        name: business.name,
        description: business.description,
        category: business.category,
        phone: business.contact?.phone || "",
        email: business.contact?.email || "",
        website: business.contact?.website || "",
      });
      setEditModalVisible(true);
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedData = {
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        contact: {
          phone: editForm.phone,
          email: editForm.email,
          website: editForm.website,
        },
      };

      const res = await API.put(`/business/${businessDetail}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBusiness(res.data);
      setEditModalVisible(false);
      Alert.alert("Success", "Business updated successfully!");
    } catch (error) {
      console.log("Update error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update business.");
    }
  };

  const openReviewsModal = async () => {
    setReviewsModalVisible(true);
    setReviewsLoading(true);
    try {
      const res = await API.get(`/review/${businessDetail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (error) {
      console.log("Reviews error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch reviews.");
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Business details not available.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Business</Text>
        <View style={styles.headerActions}>
           <TouchableOpacity style={styles.iconBtn} onPress={() => setOfferModalVisible(true)}>
            <Ionicons name="pricetag-outline" size={22} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={openReviewsModal}>
            <Ionicons name="chatbubbles-outline" size={22} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={openEditModal}>
            <Ionicons name="create-outline" size={22} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Images */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
          {business.images && business.images.length > 0 ? (
            business.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.businessImage} />
            ))
          ) : (
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.businessImage}
            />
          )}
        </ScrollView>

        {/* Business Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront-outline" size={22} color="#2563EB" />
            <Text style={styles.sectionTitle}>Business Info</Text>
          </View>
          <Text style={styles.bigTitle}>{business.name}</Text>
          <Text style={styles.badge}>{business.category}</Text>
          <Text style={styles.paragraph}>{business.description}</Text>
        </View>

        {/* Owner */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={22} color="#2563EB" />
            <Text style={styles.sectionTitle}>Owner</Text>
          </View>
          <Text style={styles.infoLine}>👤 {business.owner?.name || "N/A"}</Text>
          <Text style={styles.infoLine}>📧 {business.owner?.email || "N/A"}</Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={22} color="#2563EB" />
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>
          <Text style={styles.infoLine}>📞 {business.contact?.phone || "N/A"}</Text>
          <Text style={styles.infoLine}>📧 {business.contact?.email || "N/A"}</Text>
          <Text style={styles.infoLine}>🌐 {business.contact?.website || "N/A"}</Text>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={22} color="#2563EB" />
            <Text style={styles.sectionTitle}>Address</Text>
          </View>
          <Text style={styles.infoLine}>{business.location?.address}</Text>
          <Text style={styles.infoLine}>
            {business.location?.city}, {business.location?.state}
          </Text>
        </View>

        {/* Opening Hours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={22} color="#2563EB" />
            <Text style={styles.sectionTitle}>Opening Hours</Text>
          </View>
          {days.map((day) => (
            <Text key={day} style={styles.infoLine}>
              {day.toUpperCase()}: {business.openingHours?.[day]?.open || "Closed"} -{" "}
              {business.openingHours?.[day]?.close || "Closed"}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Business</Text>
            {[
              { key: "name", placeholder: "Business Name", icon: "storefront" },
              { key: "category", placeholder: "Category", icon: "list" },
              { key: "description", placeholder: "Description", icon: "document-text" },
              { key: "phone", placeholder: "Phone", icon: "call" },
              { key: "email", placeholder: "Email", icon: "mail" },
              { key: "website", placeholder: "Website", icon: "globe" },
            ].map((field) => (
              <View style={styles.inputWrapper} key={field.key}>
                <Ionicons name={field.icon} size={18} color="#6B7280" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  value={editForm[field.key]}
                  multiline={field.key === "description"}
                  onChangeText={(t) => setEditForm({ ...editForm, [field.key]: t })}
                />
              </View>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#E5E7EB" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: "#111827" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2563EB" }]}
                onPress={handleUpdate}
              >
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reviews Modal */}
      {/* Reviews Modal */}
      <Modal
        visible={reviewsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReviewsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "80%" }]}>

            {/* Header with total reviews count */}
            <View style={styles.reviewHeader}>
              <Text style={styles.modalTitle}>
                Reviews ({reviews.length})
              </Text>
              <TouchableOpacity
                onPress={() => setReviewsModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {reviewsLoading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : reviews.length > 0 ? (
              <ScrollView>
                {reviews.map((rev) => (
                  <View key={rev._id} style={styles.reviewCard}>
                    <Text style={styles.reviewUser}>
                      {rev.user?.name || "Anonymous"}
                    </Text>
                    <Text style={styles.reviewRating}>⭐ {rev.rating}/5</Text>
                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ color: "#6B7280" }}>No reviews yet.</Text>
            )}
          </View>
        </View>
      </Modal>
       <OfferModal
        visible={offerModalVisible}
        onClose={() => setOfferModalVisible(false)}
        businessId={businessDetail}
        
      />
    </View>
  );
};

export default OwnerBusinessDetailPage;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#6B7280" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#2563EB",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white", letterSpacing: 1 },
  headerActions: { flexDirection: "row" },
  iconBtn: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 50,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  imageContainer: { marginBottom: 18 },
  businessImage: {
    width: 300,
    height: 180,
    borderRadius: 20,
    marginRight: 14,
    resizeMode: "cover",
  },

  section: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2563EB", marginLeft: 6 },
  bigTitle: { fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 6 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E7FF",
    color: "#3730A3",
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  paragraph: { fontSize: 15, color: "#374151", lineHeight: 22, letterSpacing: 0.3 },
  infoLine: { fontSize: 14, color: "#1F2937", marginBottom: 6 },

  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 12,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 15, color: "#111827" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  input: { flex: 1, fontSize: 15, color: "#111827" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, marginLeft: 10 },

  reviewCard: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewUser: { fontWeight: "700", fontSize: 15, color: "#111827" },
  reviewRating: { fontSize: 14, color: "#F59E0B", marginVertical: 2 },
  reviewComment: { fontSize: 14, color: "#374151" },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  closeBtn: {
    backgroundColor: "#E5E7EB",
    padding: 6,
    borderRadius: 50,
  },

});
