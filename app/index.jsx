import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import BottomNav from "./components/bottomNav";
import SignUp from "./auth/signup";
import LogIn from "./auth/login";

const Index = () => {
  const [auth, setAuth] = useState("signup"); // Simulated authentication state

  if (auth === "loggedIn") {
    return <BottomNav />;
  } else if (auth === "signup") {
    return <SignUp auth={auth} setAuth={setAuth} />;
  } else {
    return <LogIn auth={auth} setAuth={setAuth} />;
  }
};

export default Index;
