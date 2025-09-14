import axios from "axios";

// 👇 change this to your backend deployed URL (Render/Heroku/localhost for dev)
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default API;
