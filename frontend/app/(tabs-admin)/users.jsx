import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { Card } from "react-native-paper";
import { PieChart, BarChart } from "react-native-chart-kit";
import API from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width - 55;
const screenHeight = Dimensions.get("window").height;

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState("");

  const slideAnim = useState(new Animated.Value(50))[0]; // small offset
  const scaleAnim = useState(new Animated.Value(0))[0]; // scale animation

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get("/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(data);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  const openModal = (item, type) => {
    setModalData(item);
    setModalType(type);
    setModalVisible(true);

    // Reset animations
    scaleAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6a1b9a" />
      </View>
    );

  if (!analytics)
    return (
      <View style={styles.loader}>
        <Text>No data available</Text>
      </View>
    );

  const pieData = [
    {
      name: "Admin",
      population: analytics.totalUsersAdmin || 1,
      color: "#FF6F61",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "BusinessOwner",
      population: analytics.totalUsersBusinessOwner || 1,
      color: "#4DB6AC",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "NormalUser",
      population: analytics.totalUsersNormal || 1,
      color: "#FFD54F",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  const barLabels = analytics.topRatedBusinesses.map((b) => b.name);
  const barData = analytics.topRatedBusinesses.map((b) => b.averageRating);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Gradient Curvy Header */}
        <LinearGradient
          colors={["#6a1b9a", "#ab47bc"]}
          style={styles.headerContainer}
        >
          <Text style={styles.headerText}>Admin Dashboard</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Users</Text>
              <Text style={styles.statValue}>{analytics.totalUsers}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Businesses</Text>
              <Text style={styles.statValue}>{analytics.totalBusinesses}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Reviews</Text>
              <Text style={styles.statValue}>{analytics.totalReviews}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Pie Chart */}
        <Text style={styles.sectionTitle}>User Roles Distribution</Text>
        <Card style={styles.chartCard}>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(106,27,154,${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>

        {/* Top Rated Businesses */}
        <Text style={styles.sectionTitle}>Top Rated Businesses</Text>
        <Card style={styles.chartCard}>
          <BarChart
            data={{
              labels: barLabels,
              datasets: [{ data: barData }],
            }}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(255,111,97,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            verticalLabelRotation={45}
          />
        </Card>

        {/* Quick Access Buttons */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => openModal(analytics.recentUsers, "user")}
          >
            <Text style={styles.buttonText}>Recent Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => openModal(analytics.recentBusinesses, "business")}
          >
            <Text style={styles.buttonText}>Recent Businesses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => openModal(analytics.mostFollowedBusinesses, "business")}
          >
            <Text style={styles.buttonText}>Most Followed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => openModal(analytics.recentReviews, "review")}
          >
            <Text style={styles.buttonText}>Recent Reviews</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Animated Modal */}
      <Modal transparent visible={modalVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["#6a1b9a", "#ab47bc"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderText}>
                {modalType === "user" && "Recent Users"}
                {modalType === "business" && "Businesses"}
                {modalType === "review" && "Reviews"}
              </Text>
            </LinearGradient>

            <ScrollView style={styles.modalBody}>
              {Array.isArray(modalData)
                ? modalData.map((item, index) => (
                    <Card style={styles.modalCard} key={item._id || index}>
                      {modalType === "user" && (
                        <>
                          <Text style={styles.modalLabel}>
                            {item.name} ({item.role})
                          </Text>
                          <Text style={styles.modalValue}>Email: {item.email}</Text>
                        </>
                      )}
                      {modalType === "business" && (
                        <>
                          <Text style={styles.modalLabel}>{item.name}</Text>
                          <Text style={styles.modalValue}>
                            Category: {item.category || "N/A"}
                          </Text>
                          <Text style={styles.modalValue}>
                            Followers: {item.followers || 0}
                          </Text>
                          <Text style={styles.modalValue}>
                            Average Rating: {item.averageRating || "N/A"}
                          </Text>
                        </>
                      )}
                      {modalType === "review" && (
                        <>
                          <Text style={styles.modalLabel}>
                            {item.user?.name || "Unknown"} →{" "}
                            {item.business?.name || "Unknown"}
                          </Text>
                          <Text style={styles.modalValue}>Rating: {item.rating}</Text>
                          <Text style={styles.modalValue}>Comment: {item.comment}</Text>
                        </>
                      )}
                    </Card>
                  ))
                : modalData && (
                    <Card style={styles.modalCard}>
                      {modalType === "user" && (
                        <>
                          <Text style={styles.modalLabel}>
                            {modalData.name} ({modalData.role})
                          </Text>
                          <Text style={styles.modalValue}>Email: {modalData.email}</Text>
                        </>
                      )}
                      {modalType === "business" && (
                        <>
                          <Text style={styles.modalLabel}>{modalData.name}</Text>
                          <Text style={styles.modalValue}>
                            Category: {modalData.category || "N/A"}
                          </Text>
                          <Text style={styles.modalValue}>
                            Followers: {modalData.followers || 0}
                          </Text>
                          <Text style={styles.modalValue}>
                            Average Rating: {modalData.averageRating || "N/A"}
                          </Text>
                        </>
                      )}
                      {modalType === "review" && (
                        <>
                          <Text style={styles.modalLabel}>
                            {modalData.user?.name || "Unknown"} →{" "}
                            {modalData.business?.name || "Unknown"}
                          </Text>
                          <Text style={styles.modalValue}>Rating: {modalData.rating}</Text>
                          <Text style={styles.modalValue}>Comment: {modalData.comment}</Text>
                        </>
                      )}
                    </Card>
                  )}
            </ScrollView>

            <Pressable style={styles.modalCloseBtn} onPress={closeModal}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Close
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  headerText: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 16 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    flex: 1,
    margin: 4,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statTitle: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 12, color: "#6a1b9a", paddingLeft: 16 },
  chartCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 12, elevation: 4, backgroundColor: "#fff" },

  buttonGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", margin: 16 },
  typeButton: { backgroundColor: "#6a1b9a", padding: 14, borderRadius: 12, marginBottom: 10, width: "45%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", maxHeight: screenHeight * 0.7 },
  modalHeader: { padding: 20 },
  modalHeaderText: { fontSize: 22, fontWeight: "bold", color: "#fff", textAlign: "center" },
  modalBody: { paddingHorizontal: 16, paddingVertical: 10 },
  modalCard: { padding: 14, marginVertical: 6, borderRadius: 12, backgroundColor: "#fff", elevation: 4 },
  modalLabel: { fontSize: 14, fontWeight: "bold", color: "#6a1b9a" },
  modalValue: { fontSize: 16, fontWeight: "600", color: "#333", marginTop: 4 },
  modalCloseBtn: { backgroundColor: "#6a1b9a", padding: 16, alignItems: "center" },
});

export default AdminAnalytics;
