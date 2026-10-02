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
  TextInput,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import Collapsible from "react-native-collapsible";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../../config/api";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [profilePictureUri, setProfilePictureUri] = useState("");
  const [recipesCount, setRecipesCount] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [familyInviteCode, setFamilyInviteCode] = useState("");
  const [familyCreatorId, setFamilyCreatorId] = useState("");
  const [familyCreatorName, setFamilyCreatorName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [storedID, setStoredID] = useState(null);

  //error
  const [error, setError] = useState("");
  const [errorUsername, setErrorUsername] = useState("");

  //Collapsed Variables:
  const [familyIsCollapsed, setFamilyIsCollapsed] = useState(true);
  const [passwordIsCollapsed, setPasswordIsCollapsed] = useState(true);
  const [usernameIsCollapsed, setUsernameIsCollapsed] = useState(true);

  //variables to check if a button has been pressed to prevent multiple presses while data is loading
  const [savingPassword, setSavingPassword] = useState(false);
  const [changingUsername, setChangingUsername] = useState(false);
  const [alteringFamily, setAlteringFamily] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
            `${API_BASE_URL}/users/${familyData.createdBy}`,
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
    }, [loadUserData]),
  );

  const handleChangeUsername = async () => {
    if (changingUsername) return;
    const trimmedNewUsername = newUsername.trim();

    if (!password || !trimmedNewUsername) {
      setErrorUsername("Please fill in both fields");
      return;
    } else if (trimmedNewUsername === username) {
      setErrorUsername("New username cannot be the same as current username");
      return;
    }

    setChangingUsername(true);
    setErrorUsername("");

    try {
      const response = await fetch(`${API_BASE_URL}/users/changeUsername`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: storedID,
          password: password,
          newUsername: trimmedNewUsername,
        }),
      });

      if (response.ok) {
        setUsername(trimmedNewUsername);
        await AsyncStorage.setItem("username", trimmedNewUsername);
        Alert.alert("Success", "Your username has been changed.");
        setPassword("");
        setNewUsername("");
        setUsernameIsCollapsed(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorUsername(
          data.error ||
            (response.status === 401
              ? "Incorrect password"
              : "Failed to change username"),
        );
      }
    } catch (err) {
      setErrorUsername("An error occurred while changing username");
    } finally {
      setChangingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    if (savingPassword) return;
    if (!oldPassword || !newPassword) {
      setError("Please fill in both fields");
      return;
    } else if (oldPassword === newPassword) {
      setError("New password cannot be the same as old password");
      return;
    }

    setSavingPassword(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/users/changePassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: storedID,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Your password has been changed.");
        setOldPassword("");
        setNewPassword("");
        setPasswordIsCollapsed(true);
      } else {
        const data = await response.json().catch(() => ({})); //catch makes it so that if the response isn't JSON we don't get an error trying to parse it, we just get an empty object instead
        setError(
          data.error ||
            (response.status === 401
              ? "Incorrect old password"
              : "Failed to change password"),
        );
      }
    } catch (err) {
      setError("An error occurred while changing password");
    } finally {
      setSavingPassword(false);
    }
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
      router.replace("/login");
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
      router.replace("/signup");
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
          {/*Username Section*/}
          <View style={styles.passwordSection(usernameIsCollapsed)}>
            <TouchableOpacity
              style={styles.passwordButton(usernameIsCollapsed)}
              onPress={() => setUsernameIsCollapsed(!usernameIsCollapsed)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.actionText}>Change username</Text>
                <Entypo
                  name={usernameIsCollapsed ? "chevron-down" : "chevron-up"}
                  size={20}
                  color="black"
                />
              </View>
            </TouchableOpacity>
            <Collapsible
              style={styles.detailsView}
              collapsed={usernameIsCollapsed}
            >
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                />
                <Text style={styles.label}>New Username *</Text>
                <TextInput
                  style={styles.input}
                  value={newUsername}
                  onChangeText={(text) => {
                    setNewUsername(text);
                  }}
                />
                {errorUsername ? (
                  <Text style={styles.errorText}>{errorUsername}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleChangeUsername}
                >
                  <Text style={styles.actionText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </Collapsible>
          </View>

          {/*Password Section*/}
          <View style={styles.passwordSection(passwordIsCollapsed)}>
            <TouchableOpacity
              style={styles.passwordButton(passwordIsCollapsed)}
              onPress={() => setPasswordIsCollapsed(!passwordIsCollapsed)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.actionText}>Change password</Text>
                <Entypo
                  name={passwordIsCollapsed ? "chevron-down" : "chevron-up"}
                  size={20}
                  color="black"
                />
              </View>
            </TouchableOpacity>
            <Collapsible
              style={styles.detailsView}
              collapsed={passwordIsCollapsed}
            >
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.label}>Old Password *</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry={true}
                  value={oldPassword}
                  onChangeText={(text) => {
                    setOldPassword(text);
                  }}
                />
                <Text style={styles.label}>New Password *</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                  }}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.actionText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </Collapsible>
          </View>

          {/*Family Section*/}
          <View style={styles.familySection(familyIsCollapsed)}>
            <TouchableOpacity
              style={styles.familyButton(familyIsCollapsed)}
              onPress={() => setFamilyIsCollapsed(!familyIsCollapsed)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.actionText}>View Family Details</Text>
                <Entypo
                  name={familyIsCollapsed ? "chevron-down" : "chevron-up"}
                  size={20}
                  color="black"
                />
              </View>
            </TouchableOpacity>
            <Collapsible
              style={styles.detailsView}
              collapsed={familyIsCollapsed}
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
  passwordSection: (isCollapsed) => ({
    backgroundColor: isCollapsed ? "transparent" : "#ffffff",
    borderRadius: 12,
    borderWidth: isCollapsed ? 0 : 1,
    borderColor: "#e9dccf",
  }),
  passwordButton: (isCollapsed) => ({
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: isCollapsed ? 1 : 0,
    borderColor: "#e9dccf",
  }),
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
  detailsView: {
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
  saveButton: {
    //green
    backgroundColor: "#5eb37c",
    borderColor: "#096d02",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a3a3a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1d7cd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
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
  errorText: {
    color: "#b3261e",
    marginBottom: 12,
    fontWeight: "600",
  },
});

export default Profile;
