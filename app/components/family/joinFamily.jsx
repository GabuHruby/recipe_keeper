import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../../../config/api";

const JoinFamily = () => {
  const navigation = useNavigation();

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
      <Text>Join Family Component</Text>
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
});
