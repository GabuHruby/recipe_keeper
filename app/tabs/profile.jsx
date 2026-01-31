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
import Entypo from "@expo/vector-icons/Entypo";
import Collapsible from "react-native-collapsible";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../../config/api";

const Profile = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [profilePictureUri, setProfilePictureUri] = useState("");
  const [recipesCount, setRecipesCount] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [familyInviteCode, setFamilyInviteCode] = useState("");
  const [familyCreatorId, setFamilyCreatorId] = useState("");
  const [familyCreatorName, setFamilyCreatorName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [storedID, setStoredID] = useState(null);

  const loadUserData = useCallback(async () => {
    try {
      const [storedId, storedUsername, storedEmail, storedFamilyId] =
        await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("username"),
          AsyncStorage.getItem("email"),
          AsyncStorage.getItem("family"),
        ]);
      setFamilyId(storedFamilyId || "");
      setStoredID(storedId || null);
      //Get family data
      if (storedFamilyId) {
        const family = await fetch(`${API_BASE_URL}/family/${storedFamilyId}`);
        if (family.ok) {
          const familyData = await family.json();
          setFamilyName(familyData.name || "");
          setFamilyInviteCode(familyData.inviteCode || "");
          setFamilyCreatorId(familyData.createdBy || "");

          //Get creator's username
          const creator = await fetch(
            `${API_BASE_URL}/users/${familyData.createdBy}`
          );
          if (creator.ok) {
            const creatorData = await creator.json();
            setFamilyCreatorName(creatorData.username || "");
          }
        }
      }

      //Get user data
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
        "family",
      ]);
    } finally {
      if (setAuth) {
        setAuth("login");
      }
    }
    resetFamilyState();
  };

  const resetFamilyState = async () => {
    setFamilyId("");
    setFamilyName("");
    setFamilyInviteCode("");
    setFamilyCreatorId("");
    setFamilyCreatorName("");
    await AsyncStorage.removeItem("family");
  };

  const handleLeaveFamily = async () => {
    try {
      await fetch(`${API_BASE_URL}/users/leaveFamily/${familyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: storedID }),
      });

      await resetFamilyState();
    } catch (error) {
      console.error("Failed to leave family:", error);
    }
  };

  const handleDeleteFamily = async () => {
    try {
      await fetch(`${API_BASE_URL}/family/${familyId}`, {
        method: "DELETE",
      });
      await resetFamilyState();
    } catch (error) {
      console.error("Failed to delete family:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await AsyncStorage.multiRemove([
        "isLoggedIn",
        "userId",
        "username",
        "email",
        "family",
      ]);
      await fetch(`${API_BASE_URL}/users/${storedID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ familyId: familyId }),
      });
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      if (setAuth) {
        setAuth("signup");
      }
    }
    resetFamilyState();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
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
          {/*Password Section*/}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.actionText}>Change password</Text>
          </TouchableOpacity>

          {/*Family Section*/}
          <View style={styles.familySection(isCollapsed)}>
            <TouchableOpacity
              style={styles.familyButton(isCollapsed)}
              onPress={() => setIsCollapsed(!isCollapsed)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.actionText}>View Family Details</Text>
                <Entypo
                  name={isCollapsed ? "chevron-down" : "chevron-up"}
                  size={20}
                  color="black"
                />
              </View>
            </TouchableOpacity>
            <Collapsible
              style={styles.familyDetailsView}
              collapsed={isCollapsed}
            >
              <Text style={styles.familyLabel}>Family Name:</Text>
              <Text style={styles.familyInfo}>
                {familyName || "No family joined"}
              </Text>
              <Text style={styles.familyLabel}>Invite Code:</Text>
              <Text style={styles.familyInfo}>{familyInviteCode || "N/A"}</Text>
              <Text style={styles.familyLabel}>Owner:</Text>
              <Text style={styles.familyInfo}>
                {familyCreatorName || "N/A"}
              </Text>

              {familyId ? (
                <TouchableOpacity
                  style={styles.leaveFamilyButton}
                  onPress={handleLeaveFamily}
                >
                  <Text style={styles.actionText}>Leave Family</Text>
                </TouchableOpacity>
              ) : null}
              {storedID === familyCreatorId ? (
                <TouchableOpacity
                  style={styles.deleteFamilyButton}
                  onPress={handleDeleteFamily}
                >
                  <Text style={styles.actionText}>Delete Family</Text>
                </TouchableOpacity>
              ) : null}
            </Collapsible>
          </View>

          {/*User Section*/}
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
    paddingBottom: 132,
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
  familySection: (isCollapsed) => ({
    backgroundColor: isCollapsed ? "transparent" : "#ffffff",
    borderRadius: 12,
    borderWidth: isCollapsed ? 0 : 1,
    borderColor: "#e9dccf",
  }),
  familyButton: (isCollapsed) => ({
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: isCollapsed ? 1 : 0,
    borderColor: "#e9dccf",
  }),
  familyDetailsView: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9dccf",
  },
  familyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a3a3a",
    marginBottom: 4,
  },
  familyInfo: {
    fontSize: 15,
    color: "#2b2b2b",
    marginBottom: 12,
  },
  leaveFamilyButton: {
    backgroundColor: "#fff2ee",
    borderColor: "#f2c6b8",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteFamilyButton: {
    backgroundColor: "#ffecec",
    borderColor: "#f5bcbc",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
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
