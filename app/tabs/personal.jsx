import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/navigation/searchBar";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Personal = () => {
  const [recipes, setRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [storedID, setStoredID] = useState(null);

  //Usecallback makes it so that the function is not recreated on every render
  const loadRecipes = useCallback(async () => {
    try {
      const storedID = await AsyncStorage.getItem("userId");
      setStoredID(storedID);

      const response = await fetch(`${API_BASE_URL}/users/${storedID}/recipes`);
      if (!response.ok) {
        throw new Error("Failed to fetch recipes.");
      }

      const data = await response.json();

      const recipes = [...data.recipesCreated, ...data.favoriteRecipes];
      const favoriteIds = data.favoriteRecipes.map((recipe) => recipe._id);
      setFavoriteIds(favoriteIds);
      setRecipes(recipes);
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
      <SearchBar
        recipes={recipes}
        filterOptions={[
          { label: "Newest", value: "date_descending" },
          { label: "Oldest", value: "date_ascending" },
          { label: "A-Z", value: "name_ascending" },
          { label: "Z-A", value: "name_descending" },
          { label: "Favorites", value: "favorites" },
          { label: "Created by you", value: "created" },
        ]}
        favoriteIds={favoriteIds}
        userId={storedID}
      />
    </SafeAreaView>
  );
};

export default Personal;
