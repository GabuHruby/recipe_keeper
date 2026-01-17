import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/navigation/searchBar";
import API_BASE_URL from "../../config/api";

const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);

  //run once screens load
  useEffect(() => {
    const loadRecipes = async () => {
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
    };
    loadRecipes();
  }, []);

  return (
    <SafeAreaView>
      <SearchBar recipes={recipes} />
    </SafeAreaView>
  );
};

export default HomeScreen;
