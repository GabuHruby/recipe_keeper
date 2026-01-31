import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JoinFamily = () => {
  const navigation = useNavigation();
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState(null);

  const handleSubmit = async () => {
    if (codeInput.trim().length === 0) {
      setError("Invalid code.");
      return;
    }
    const userId = await AsyncStorage.getItem("userId");
    try {
      const response = await fetch(`${API_BASE_URL}/family/join`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: codeInput.trim(),
          userId: userId,
        }),
      });

      const familyData = await response.json();

      if (!response.ok) {
        throw new Error(familyData.error || "Invalid code.");
      }

      await AsyncStorage.setItem("family", familyData.id);
      setFamilyId(familyData.id);
      setFamilyName(familyData.name);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={{ color: "#000000", fontWeight: "600" }}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Family Code</Text>
      <TextInput
        style={styles.input}
        value={codeInput}
        onChangeText={setCodeInput}
        placeholder="Enter family code"
        placeholderTextColor="#afafaf"
        editable={!familyId}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {familyId ? (
        <>
          <Text style={{ marginBottom: 16, fontWeight: "600" }}>
            Joined family: {familyName}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Go Back Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Join Family</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default JoinFamily;

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
