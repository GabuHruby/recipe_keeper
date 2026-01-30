import { useCallback, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/navigation/searchBar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Plan for future: Make the home screen only for the family.
// If you have not joined a family yet, it will appear a box saying JOIN FAMILY.
// When you join the family, all the recipes frm the users in that family will appear in the home screen.
// The profile screen will show the users in the family, and you can leave the family if you want to.
const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [storedID, setStoredID] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const Navigation = useNavigation();

  const loadUserData = useCallback(async () => {
    try {
      const storedID = await AsyncStorage.getItem("userId");
      setStoredID(storedID);

      const response = await fetch(`${API_BASE_URL}/users/${storedID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }

      const data = await response.json();
      setFamilyId(data.family || null);
    } catch (err) {
      console.log("Failed to fetch user data:", err);
      setFamilyId(null);
    }
  }, []);

  //Usecallback makes it so that the function is not recreated on every render
  const loadRecipes = useCallback(async () => {
    const famId = await AsyncStorage.getItem("family");
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/family/${famId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch recipes.");
      }
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      console.log("Failed to fetch recipes:", err);
      setRecipes([]);
    }
  }, []);

  //Runs the code every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadRecipes();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f2ec" }}>
      {familyId ? (
        <SearchBar
          recipes={recipes}
          filterOptions={[
            { label: "Newest", value: "date_descending" },
            { label: "Oldest", value: "date_ascending" },
            { label: "A-Z", value: "name_ascending" },
            { label: "Z-A", value: "name_descending" },
          ]}
        />
      ) : (
        <View style={styles.noFamilyContainer}>
          <View style={styles.section}>
            <Text style={{ fontSize: 16, textAlign: "center" }}>
              You have not joined a family yet. Please join a family to see
              recipes from your family members.
            </Text>
          </View>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.button1}
              onPress={() => {
                Navigation.navigate("JoinFamily");
              }}
            >
              <Text style={styles.buttonText}>Join Family</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button2}
              onPress={() => {
                Navigation.navigate("CreateFamily");
              }}
            >
              <Text style={styles.buttonText}>Create Family</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  noFamilyContainer: {
    margin: 16,
    marginTop: 100,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  button1: {
    marginBottom: 16,
    width: "80%",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  button2: {
    backgroundColor: "#4CAF50",
    width: "80%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
