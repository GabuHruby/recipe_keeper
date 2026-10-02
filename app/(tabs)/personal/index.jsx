import { useCallback, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../../components/navigation/searchBar";
import SearchFilter, {
  getFilteredRecipes,
} from "../../../components/navigation/searchFilter";
import { useFocusEffect } from "expo-router";
import API_BASE_URL from "../../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Personal = () => {
  const [recipes, setRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [storedID, setStoredID] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("date_descending");

  //Usecallback makes it so that the function is not recreated on every render
  const loadRecipes = useCallback(async () => {
    try {
      const storedID = await AsyncStorage.getItem("userId");
      setStoredID(storedID);

      const response = await fetch(`${API_BASE_URL}/users/${storedID}/recipes`);
      const userResponse = await fetch(`${API_BASE_URL}/users/${storedID}`);
      if (!response.ok || !userResponse.ok) {
        throw new Error("Failed to fetch recipes.");
      }

      const data = await response.json();
      const userData = await userResponse.json();

      const recipes = [...data.recipesCreated, ...data.favoriteRecipes];
      const favoriteIds = data.favoriteRecipes.map((recipe) => recipe._id);
      setFavoriteIds(favoriteIds);
      setCartIds((userData.recipesInCart || []).map((id) => id.toString()));
      setRecipes(recipes);
    } catch (err) {
      setRecipes([]);
      setFavoriteIds([]);
      setCartIds([]);
    }
  }, []);

  //Runs the code every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  const filteredRecipes = useMemo(() => {
    return getFilteredRecipes(recipes, search, filter, favoriteIds, storedID);
  }, [recipes, search, filter, favoriteIds, storedID]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecipes();
    setRefreshing(false);
  }, [loadRecipes]);

  const handleToggleFavorite = useCallback(
    async (recipeId, add) => {
      if (!storedID) {
        return;
      }

      setFavoriteIds((prev) =>
        add
          ? (prev.includes(recipeId) ? prev : [...prev, recipeId])
          : prev.filter((id) => id !== recipeId),
      );

      try {
        const response = await fetch(`${API_BASE_URL}/users/${storedID}/favorites`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId, add }),
        });

        if (!response.ok) {
          throw new Error("Failed to update favorites.");
        }
      } catch (err) {
        setFavoriteIds((prev) =>
          add
            ? prev.filter((id) => id !== recipeId)
            : (prev.includes(recipeId) ? prev : [...prev, recipeId]),
        );
      }
    },
    [storedID],
  );

  const handleToggleCart = useCallback(
    async (recipeId, add) => {
      if (!storedID) {
        return;
      }

      setCartIds((prev) =>
        add
          ? (prev.includes(recipeId) ? prev : [...prev, recipeId])
          : prev.filter((id) => id !== recipeId),
      );

      try {
        const response = await fetch(`${API_BASE_URL}/users/${storedID}/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId, add }),
        });

        if (!response.ok) {
          throw new Error("Failed to update cart.");
        }
      } catch (err) {
        setCartIds((prev) =>
          add
            ? prev.filter((id) => id !== recipeId)
            : (prev.includes(recipeId) ? prev : [...prev, recipeId]),
        );
      }
    },
    [storedID],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f2ec" }}>
      <SearchBar
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filterOptions={[
          { label: "Newest", value: "date_descending" },
          { label: "Oldest", value: "date_ascending" },
          { label: "A-Z", value: "name_ascending" },
          { label: "Z-A", value: "name_descending" },
          { label: "Favorites", value: "favorites" },
          { label: "Created by you", value: "created" },
        ]}
      />
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 20,
          minHeight: "80%",
        }}
        data={filteredRecipes}
        renderItem={({ item }) => (
          <SearchFilter
            item={item}
            isFavorite={favoriteIds.includes(item._id)}
            inCart={cartIds.includes(item._id)}
            onToggleFavorite={handleToggleFavorite}
            onToggleCart={handleToggleCart}
          />
        )}
        keyExtractor={(item) => item._id.toString()}
        numColumns={2}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

export default Personal;
