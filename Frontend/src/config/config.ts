// API Configuration
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const config = {
  apiUrl: isLocalHost ? "http://localhost:5000/api" : "https://apiv1.kunalpatil.me/api",
};
