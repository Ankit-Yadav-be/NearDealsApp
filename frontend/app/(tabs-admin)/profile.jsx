import { View, Text, Button, StyleSheet } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";

const Profile = () => {
  const { user, signout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signout();
    router.replace("/(auth)"); // logout ke baad login/auth flow par bhej do
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {user && (
        <>
          <Text style={styles.info}>Name: {user.name}</Text>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.info}>Role: {user.role}</Text>
        </>
      )}

      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
});
