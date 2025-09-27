import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  Dimensions, 
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";


const PRIMARY_BLUE = "#1A73E8"; 
const LIGHT_BACKGROUND = "#FFFFFF";
const CARD_BACKGROUND = "#F9F9F9";
const BORDER_LIGHT = "#EEEEEE";
const TEXT_DARK = "#202124";
const TEXT_MUTED = "#5F6368";
const LOGOUT_RED = "#D93025";

const { height: screenHeight } = Dimensions.get("window");


const HEADER_MAX_HEIGHT = 180; 
const HEADER_MIN_HEIGHT = 90; 
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;


const MenuItem = ({ iconName, text, onPress, isLogout = false }) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
  >
    <View style={[styles.iconWrapper, { backgroundColor: isLogout ? '#FEECEB' : CARD_BACKGROUND }]}>
      <Ionicons 
        name={iconName} 
        size={22} 
        color={isLogout ? LOGOUT_RED : PRIMARY_BLUE} 
      />
    </View>
    <Text style={[styles.menuText, { color: isLogout ? LOGOUT_RED : TEXT_DARK }]}>{text}</Text>
    {!isLogout && (
      <Ionicons name="chevron-forward-outline" size={18} color={TEXT_MUTED} style={styles.menuArrow} />
    )}
  </TouchableOpacity>
);


const Profile = () => {
  const { user, signout } = useAuthStore();
  const router = useRouter();

  const safeUser = user || {};

  
  const userName = safeUser.name || "User Name";
  const userRole = safeUser.role || "Professional"; 
  const userPhone = safeUser.phone || "(N/A)";
  const userEmail = safeUser.email || "N/A";
  const walletBalance = safeUser.walletBalance || "$0.00";
  const ordersCount = safeUser.ordersCount || 0;
  const profileImageUri = safeUser.profileImage || "https://i.pravatar.cc/150?img=55"; 

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current; 


  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp', 
  });

  const profileOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0], 
    extrapolate: 'clamp',
  });
  
  const titleY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });


  const handleLogout = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(async () => {
      await signout();
      router.replace("/(landing)");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
     
      <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}>
       
        <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={LIGHT_BACKGROUND} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => {/* router.push("/edit-profile") */}}>
                <MaterialCommunityIcons name="pencil-outline" size={24} color={LIGHT_BACKGROUND} />
            </TouchableOpacity>
        </View>

      
        <Animated.View style={[styles.headerProfileDetails, { opacity: profileOpacity, transform: [{ translateY: titleY }] }]}>
            <Image
                source={{ uri: profileImageUri }}
                style={styles.profileImageHeader}
            />
            <View style={styles.nameContainerHeader}>
                <Text style={styles.nameHeader}>{userName}</Text>
                <Text style={styles.roleHeader}>{userRole}</Text>
            </View>
        </Animated.View>

        <View style={styles.miniTitleContainer}>
            <Text style={styles.miniTitle}>{userName}</Text>
        </View>
      </Animated.View>

      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
        )}
      >
       
        <View style={{ marginTop: HEADER_MAX_HEIGHT - 30 }} /> 

        
        <View style={styles.contactInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color={TEXT_MUTED} />
              <Text style={styles.infoText}>{userPhone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={TEXT_MUTED} />
              <Text style={styles.infoText}>{userEmail}</Text>
            </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{walletBalance}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{ordersCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>

        {/* मेनू आइटम्स */}
        <View style={styles.menuContainer}>
          <MenuItem iconName="heart-outline" text="Your Favorites" onPress={() => {}} />
          <MenuItem iconName="card-outline" text="Payment" onPress={() => {}} />
          <MenuItem iconName="people-outline" text="Tell Your Friend" onPress={() => {}} />
          <MenuItem iconName="pricetag-outline" text="Promotions" onPress={() => {}} />
          <MenuItem iconName="settings-outline" text="Settings" onPress={() => {}} />

          {/* लॉग आउट बटन - एनिमेशन के साथ */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <MenuItem 
              iconName="log-out-outline" 
              text="Log out" 
              onPress={handleLogout} 
              isLogout={true}
            />
          </Animated.View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

// स्टाइल्स
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: LIGHT_BACKGROUND
  },

  // --- 1. एनिमेटेड हेडर स्टाइल्स ---
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 15,
    zIndex: 10,
    overflow: 'hidden',
    // शैडो जोड़ें
    ...Platform.select({
        ios: { shadowColor: TEXT_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
        android: { elevation: 8 },
    }),
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0, // Android पर SafeAreaView का उपयोग करें
  },
  headerButton: {
    padding: 5,
  },
  headerProfileDetails: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    marginTop: 5,
  },
  profileImageHeader: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: LIGHT_BACKGROUND, // सफेद बॉर्डर
  },
  nameContainerHeader: {
    justifyContent: "center",
  },
  nameHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: LIGHT_BACKGROUND,
  },
  roleHeader: {
    fontSize: 14,
    color: BORDER_LIGHT, // हल्का सफेद
    marginTop: 2,
  },
  miniTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HEADER_MIN_HEIGHT,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0, // डिफॉल्ट रूप से छिपा हुआ
  },
  miniTitle: {
    color: LIGHT_BACKGROUND,
    fontSize: 18,
    fontWeight: '700',
    // टॉप बटन रो के साथ अलाइन करने के लिए पैडिंग
    marginBottom: Platform.OS === 'android' ? 0 : 5, 
  },
  
  // --- 2. कंटेंट स्टाइल्स ---
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    // Note: ScrollView में टॉप पैडिंग को ऊपर Animated Header में जोड़ा गया है
  },
  
  // संपर्क जानकारी
  contactInfo: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    marginLeft: 5, 
  },
  infoText: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginLeft: 10,
    fontWeight: "500",
  },

  // वॉलेट और ऑर्डर्स स्टैट्स (पुराने स्टाइल्स)
  statsContainer: {
    flexDirection: "row",
    backgroundColor: LIGHT_BACKGROUND,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: BORDER_LIGHT, 
    ...Platform.select({
        ios: { shadowColor: TEXT_MUTED, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
        android: { elevation: 2 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  statLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: BORDER_LIGHT, 
  },

  // मेनू आइटम्स (पुराने स्टाइल्स)
  menuContainer: {
    backgroundColor: LIGHT_BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT, 
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  menuArrow: {
    marginLeft: 'auto',
  }
});