import axios from "axios";

// 👇 change this to your backend deployed URL (Render/Heroku/localhost for dev)
const API = axios.create({
  baseURL: "https://near-deals-app.vercel.app/api",
});

export default API;
