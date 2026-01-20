import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "../../config/api";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUri, setProfilePictureUri] = useState("");
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  const loadUserData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }
      const data = await response.json();
      setUsername(data.username);
      setEmail(data.email);
      setProfilePictureUri(data.profilePictureUri || "");
      setFavoriteRecipes(data.favoriteRecipes || []);
    } catch (err) {
      setUsername("");
      setEmail("");
      setProfilePictureUri("");
      setFavoriteRecipes([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f7f2ec" }}
    ></SafeAreaView>
  );
};

export default Profile;
