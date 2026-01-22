import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/navigation/searchBar";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Personal = () => {
  const [recipes, setRecipes] = useState([]);

  //Usecallback makes it so that the function is not recreated on every render
  const loadRecipes = useCallback(async () => {
    try {
      const storedID = await AsyncStorage.getItem("userId");

      const response = await fetch(`${API_BASE_URL}/users/${storedID}/recipes`);
      if (!response.ok) {
        throw new Error("Failed to fetch recipes.");
      }
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setRecipes([]);
    }
  }, []);

  //Runs the code every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f2ec" }}>
      <SearchBar recipes={recipes} />
    </SafeAreaView>
  );
};

export default Personal;
