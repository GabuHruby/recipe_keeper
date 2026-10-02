import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import API_BASE_URL from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateFamily = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [familyId, setFamilyId] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);

  const handleSubmit = async () => {
    if (name.trim().length === 0) {
      setError("Enter a family name.");
      return;
    }
    const userId = await AsyncStorage.getItem("userId");
    try {
      const response = await fetch(`${API_BASE_URL}/family`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          userId: userId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create family.");
      }
      const familyData = await response.json();

      await AsyncStorage.setItem("family", familyData.id);
      setFamilyId(familyData.id);
      setInviteCode(familyData.inviteCode);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Text style={{ color: "#000000", fontWeight: "600" }}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Family Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter family name"
        placeholderTextColor="#afafaf"
        editable={!familyId}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {familyId ? (
        <>
          <Text style={{ marginBottom: 16, fontWeight: "600" }}>
            Family created! Your Family Code is: {inviteCode}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Go Back Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Create Family</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default CreateFamily;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
    marginBottom: 200,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a3a3a",
    marginBottom: 8,
    paddingHorizontal: 3,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1d7cd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#f27059",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#b3261e",
    marginBottom: 12,
    fontWeight: "600",
  },
});
