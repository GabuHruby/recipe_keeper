import { useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../../components/navigation/searchBar";
import SearchFilter, {
  getFilteredRecipes,
} from "../../../components/navigation/searchFilter";
import { router, useFocusEffect } from "expo-router";
import API_BASE_URL from "../../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Search } from "react-native-feather";

const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [storedID, setStoredID] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("date_descending");

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
      setFavoriteIds((data.favoriteRecipes || []).map((id) => id.toString()));
      setCartIds((data.recipesInCart || []).map((id) => id.toString()));
      await AsyncStorage.setItem("family", data.family || "");
    } catch (err) {
      console.log("Failed to fetch user data:", err);
      setFamilyId(null);
      setFavoriteIds([]);
      setCartIds([]);
    }
  }, []);

  //Usecallback makes it so that the function is not recreated on every render
  const loadRecipes = useCallback(async () => {
    const famId = await AsyncStorage.getItem("family");
    if (!famId) {
      setRecipes([]);
      return;
    }
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
    }, []),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecipes();
    await loadUserData();
    setRefreshing(false);
  }, [loadRecipes, loadUserData]);

  //Gets filtered recipes from search filter and saves until recipe, search or filter changes
  const filteredRecipes = useMemo(() => {
    return getFilteredRecipes(recipes, search, filter);
  }, [recipes, search, filter]);

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
      {familyId ? (
        <>
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
            ]}
          />
          <FlatList
            contentContainerStyle={styles.listContent}
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
        </>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
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
                  router.push("/home/join-family");
                }}
              >
                <Text style={styles.buttonText}>Join Family</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button2}
                onPress={() => {
                  router.push("/home/create-family");
                }}
              >
                <Text style={styles.buttonText}>Create Family</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    minHeight: "80%",
  },
});
