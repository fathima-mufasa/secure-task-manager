import { AuthProvider } from "@asgardeo/auth-react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const config = {
  signInRedirectURL: "http://localhost:5173",
  signOutRedirectURL: "http://localhost:5173",
  clientID: "PythFWkwZu85wjux0kTu2ovZQkYa",
  baseUrl: "https://api.asgardeo.io/t/fathimamufasa",
  scope: ["openid", "profile", "email"]
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider config={config}>
    <App />
  </AuthProvider>
);
