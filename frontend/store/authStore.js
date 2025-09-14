import { create } from "zustand";
import API from "../api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  // Signup
  signup: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.post("/users/register", { name, email, password, role });

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Signin
  signin: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.post("/users/login", { email, password });

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Signout
  signout: async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    set({ user: null, token: null });
  },

  // Load token + user from storage on app start
  loadTokenFromStorage: async () => {
    const token = await AsyncStorage.getItem("token");
    const userData = await AsyncStorage.getItem("user");

    if (token && userData) {
      set({ token, user: JSON.parse(userData) });
    }
  },
}));
