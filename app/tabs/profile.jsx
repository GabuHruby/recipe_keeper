import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../../config/api";

const Profile = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUri, setProfilePictureUri] = useState("");
  const [recipesCount, setRecipesCount] = useState(0);

  const loadUserData = useCallback(async () => {
    try {
      const [storedId, storedUsername, storedEmail] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("username"),
        AsyncStorage.getItem("email"),
      ]);

      if (storedId) {
        const response = await fetch(`${API_BASE_URL}/users/${storedId}`);
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username || storedUsername || "");
          setEmail(data.email || storedEmail || "");
          setProfilePictureUri(data.profilePictureUri || "");
          setRecipesCount((data.recipesCreated || []).length);
          return;
        }
      }

      setUsername(storedUsername || "");
      setEmail(storedEmail || "");
      setProfilePictureUri("");
      setRecipesCount(0);
    } catch (err) {
      setUsername("");
      setEmail("");
      setProfilePictureUri("");
      setRecipesCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleChangePassword = () => {
    Alert.alert("Change password doesn't work yet");
  };

  const handleChangeImage = () => {
    Alert.alert("Change profile picture doesn't work yet");
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        "isLoggedIn",
        "userId",
        "username",
        "email",
      ]);
    } finally {
      if (setAuth) {
        setAuth("login");
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete account doesn't work yet");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleChangeImage}>
            <Image
              source={
                profilePictureUri
                  ? { uri: profilePictureUri }
                  : {
                      uri: "https://res.cloudinary.com/dq6ag1bv3/image/upload/v1768931787/default_user_pupmzz.jpg",
                    }
              }
              style={styles.profilePicture}
            />
          </TouchableOpacity>
          <Text style={styles.username}>{username || "Your username"}</Text>
          <Text style={styles.email}>{email || "you@example.com"}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Total recipes</Text>
          <Text style={styles.statsValue}>{recipesCount}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.actionText}>Change password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={[styles.actionText, styles.signOutText]}>
              Sign out
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.actionText, styles.deleteText]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f2ec",
  },
  container: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1d7cd",
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2b2b2b",
  },
  email: {
    fontSize: 14,
    color: "#6f6f6f",
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ece1d7",
    marginBottom: 24,
  },
  statsLabel: {
    fontSize: 13,
    color: "#6f6f6f",
    marginBottom: 6,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b2b2b",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e9dccf",
  },
  actionText: {
    fontSize: 15,
    color: "#2b2b2b",
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: "#fff2ee",
    borderColor: "#f2c6b8",
    marginTop: 40,
  },
  signOutText: {
    color: "#c04b3a",
  },
  deleteButton: {
    backgroundColor: "#ffecec",
    borderColor: "#f5bcbc",
  },
  deleteText: {
    color: "#d64545",
  },
});

export default Profile;
