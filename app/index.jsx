import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import BottomNav from "./components/bottomNav";
import SignUp from "./auth/signup";
import LogIn from "./auth/login";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Index = () => {
  const [auth, setAuth] = useState("signup");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Retrieve login status from AsyncStorage
        const data = await AsyncStorage.getItem("isLoggedIn");
        if (data === "true") {
          setAuth("loggedIn");
        }
      } catch (error) {
        console.log("Error retrieving login status:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (auth === "loggedIn") {
    return <BottomNav />;
  } else if (auth === "signup") {
    return <SignUp auth={auth} setAuth={setAuth} />;
  } else {
    return <LogIn auth={auth} setAuth={setAuth} />;
  }
};

export default Index;
