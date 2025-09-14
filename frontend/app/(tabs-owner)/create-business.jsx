import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuthStore } from "../../store/authStore";
import API from "../../api/axiosInstance";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const CreateBusinessScreen = () => {
  const { token } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    images: [], // ✅ local URIs (preview only)
    contact: { phone: "", email: "", website: "" },
    location: {
      type: "Point",
      coordinates: [77.5946, 12.9716], // [lon, lat]
      address: "",
      city: "",
      state: "",
    },
    openingHours: days.reduce((acc, day) => {
      acc[day] = { open: "10:00", close: "22:00" };
      return acc;
    }, {}),
  });

  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [showPicker, setShowPicker] = useState({ visible: false, day: null, type: null });
  const [loading, setLoading] = useState(false);

  // ✅ Load current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access to select location");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [loc.coords.longitude, loc.coords.latitude],
        },
      }));
    })();
  }, []);

  // ✅ map press handler
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setRegion({ ...region, latitude, longitude });
    setForm({
      ...form,
      location: { ...form.location, coordinates: [longitude, latitude] },
    });
  };

  // ✅ time picker handler
  const handleTimeChange = (event, selectedDate) => {
    if (!selectedDate) {
      setShowPicker({ visible: false, day: null, type: null });
      return;
    }
    const hours = selectedDate.getHours().toString().padStart(2, "0");
    const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;

    setForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [showPicker.day]: {
          ...prev.openingHours[showPicker.day],
          [showPicker.type]: time,
        },
      },
    }));

    setShowPicker({ visible: false, day: null, type: null });
  };

  // ✅ pick image (local only, no upload yet)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setForm((prev) => ({ ...prev, images: [...prev.images, image.uri] }));
    }
  };

  // ✅ form submit (upload images here)
  const handleSubmit = async () => {
    if (loading) return;
    if (!form.name || !form.category) {
      return Alert.alert("Validation", "Please fill name and category");
    }

    setLoading(true);
    try {
      // Step 1: Upload images to Cloudinary
      let uploadedUrls = [];
      for (const uri of form.images) {
        const url = await uploadToCloudinary({ uri });
        if (url) uploadedUrls.push(url);
      }

      // Step 2: Final payload
      const payload = {
        ...form,
        images: uploadedUrls,
      };

      const res = await API.post("/business", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("✅ Success", "Business created successfully!");
      console.log("Business created:", res.data);

      // Reset form
      setForm({
        name: "",
        description: "",
        category: "",
        images: [],
        contact: { phone: "", email: "", website: "" },
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716],
          address: "",
          city: "",
          state: "",
        },
        openingHours: days.reduce((acc, day) => {
          acc[day] = { open: "10:00", close: "22:00" };
          return acc;
        }, {}),
      });
    } catch (error) {
      console.log("Business create error:", error.response?.data);
      Alert.alert("❌ Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Create Your Business</Text>

      {/* IMAGES */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {form.images.length > 0 &&
            form.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.imagePreview} />
            ))}
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Text style={{ color: "#1E90FF", fontWeight: "bold" }}>+ Add Image</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* BUSINESS DETAILS */}
      <View style={styles.card}>
        <TextInput
          placeholder="Business Name"
          style={styles.input}
          value={form.name}
          onChangeText={(val) => setForm({ ...form, name: val })}
        />
        <TextInput
          placeholder="Description"
          style={styles.input}
          value={form.description}
          onChangeText={(val) => setForm({ ...form, description: val })}
        />
        <TextInput
          placeholder="Category"
          style={styles.input}
          value={form.category}
          onChangeText={(val) => setForm({ ...form, category: val })}
        />
      </View>

      {/* CONTACT DETAILS */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Contact</Text>
        <TextInput
          placeholder="Phone"
          style={styles.input}
          value={form.contact.phone}
          onChangeText={(val) =>
            setForm({ ...form, contact: { ...form.contact, phone: val } })
          }
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={form.contact.email}
          onChangeText={(val) =>
            setForm({ ...form, contact: { ...form.contact, email: val } })
          }
        />
        <TextInput
          placeholder="Website"
          style={styles.input}
          value={form.contact.website}
          onChangeText={(val) =>
            setForm({ ...form, contact: { ...form.contact, website: val } })
          }
        />
      </View>

      {/* ADDRESS DETAILS + MANUAL COORDINATES */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Address</Text>
        <TextInput
          placeholder="Street Address"
          style={styles.input}
          value={form.location.address}
          onChangeText={(val) =>
            setForm({ ...form, location: { ...form.location, address: val } })
          }
        />
        <TextInput
          placeholder="City"
          style={styles.input}
          value={form.location.city}
          onChangeText={(val) =>
            setForm({ ...form, location: { ...form.location, city: val } })
          }
        />
        <TextInput
          placeholder="State"
          style={styles.input}
          value={form.location.state}
          onChangeText={(val) =>
            setForm({ ...form, location: { ...form.location, state: val } })
          }
        />

        {/* Manual coordinates */}
        <TextInput
          placeholder="Latitude"
          style={styles.input}
          value={form.location.coordinates[1].toString()}
          keyboardType="numeric"
          onChangeText={(val) => {
            const lat = parseFloat(val) || 0;
            setForm((prev) => ({
              ...prev,
              location: { ...prev.location, coordinates: [prev.location.coordinates[0], lat] },
            }));
            setRegion((prev) => ({ ...prev, latitude: lat }));
          }}
        />
        <TextInput
          placeholder="Longitude"
          style={styles.input}
          value={form.location.coordinates[0].toString()}
          keyboardType="numeric"
          onChangeText={(val) => {
            const lon = parseFloat(val) || 0;
            setForm((prev) => ({
              ...prev,
              location: { ...prev.location, coordinates: [lon, prev.location.coordinates[1]] },
            }));
            setRegion((prev) => ({ ...prev, longitude: lon }));
          }}
        />
      </View>

      {/* MAP */}
      <View style={styles.card}>
        <Text style={styles.label}>📍 Select Location</Text>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            draggable
            coordinate={{ latitude: region.latitude, longitude: region.longitude }}
            onDragEnd={handleMapPress}
          />
        </MapView>
      </View>

      {/* OPENING HOURS */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Opening Hours</Text>
        {days.map((day) => (
          <View key={day} style={styles.row}>
            <Text style={styles.day}>{day.toUpperCase()}</Text>

            <TouchableOpacity
              style={styles.timeBtn}
              onPress={() => setShowPicker({ visible: true, day, type: "open" })}
            >
              <Text>Open: {form.openingHours[day].open}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeBtn}
              onPress={() => setShowPicker({ visible: true, day, type: "close" })}
            >
              <Text>Close: {form.openingHours[day].close}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {showPicker.visible && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* SUBMIT BUTTON */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: "#1E90FF",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            opacity: loading ? 0.6 : 1,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Create Business</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateBusinessScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f7f7f7" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  label: { marginBottom: 10, fontWeight: "bold" },
  map: { height: 250, borderRadius: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  day: { width: 60, fontWeight: "bold" },
  timeBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 6,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: "#e6f0ff",
  },
  buttonContainer: { marginVertical: 15 },
  imagePreview: { width: 100, height: 100, borderRadius: 8, marginRight: 10 },
  addImageBtn: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#1E90FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
