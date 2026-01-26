import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/navigation/searchBar";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "../../config/api";

//Plan for future: Make the home screen only for the family.
// If you have not joined a family yet, it will appear a box saying JOIN FAMILY.
// When you join the family, all the recipes frm the users in that family will appear in the home screen.
// The profile screen will show the users in the family, and you can leave the family if you want to.
const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);

  //Usecallback makes it so that the function is not recreated on every render
  const loadRecipes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
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

export default HomeScreen;
