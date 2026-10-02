import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Touchable,
} from "react-native";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useSegments,
} from "expo-router";
import API_BASE_URL from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RecipeDetail = () => {
  const params = useLocalSearchParams();
  const [, tab] = useSegments();
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [recipeData, setRecipeData] = useState(
    params.recipe ? JSON.parse(params.recipe) : null
  );
  //Safety check to ensure recipe data exists
  const recipe = recipeData;

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const loadUserData = useCallback(async () => {
    if (!recipe) {
      return;
    }
    const storedId = await AsyncStorage.getItem("userId");
    if (storedId && recipe.createdBy && storedId === recipe.createdBy) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [recipe]);

  const loadFavoritesAndCart = useCallback(async () => {
    if (!recipe) {
      return;
    }
    const storedId = await AsyncStorage.getItem("userId");
    const userDetails = await fetch(`${API_BASE_URL}/users/${storedId}`);
    if (userDetails.ok) {
      const userData = await userDetails.json();
      const favorites = userData.favoriteRecipes || [];
      const cart = userData.recipesInCart || [];

      if (cart.includes(recipe._id)) {
        setInCart(true);
      } else {
        setInCart(false);
      }

      if (favorites.includes(recipe._id)) {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    }
  }, []);

  const refreshRecipe = useCallback(async () => {
    if (!recipe?._id) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipe._id}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setRecipeData(data);
    } catch (err) {
      //Do nothing
    }
  }, [recipe?._id]);

  useFocusEffect(
    useCallback(() => {
      refreshRecipe();
      loadUserData();
      loadFavoritesAndCart();
    }, [loadUserData, loadFavoritesAndCart, refreshRecipe])
  );

  const updateFavorites = async () => {
    const storedId = await AsyncStorage.getItem("userId");
    setIsFavorite(!isFavorite);
    try {
      await fetch(`${API_BASE_URL}/users/${storedId}/favorites`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipe._id,
          add: !isFavorite,
        }),
      });
    } catch (err) {
      //Do nothing
    }
  };

  const updateCart = async () => {
    const storedId = await AsyncStorage.getItem("userId");
    setInCart(!inCart);
    try {
      await fetch(`${API_BASE_URL}/users/${storedId}/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipe._id,
          add: !inCart,
        }),
      });
    } catch (err) {
      //Do nothing
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ height: 740, paddingBottom: 40 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Text style={{ color: "#000000", fontWeight: "600" }}>Back</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={updateCart}
                style={styles.headerButton}
              >
                {inCart ? (
                  <FontAwesome name="shopping-cart" size={24} color="red" />
                ) : (
                  <FontAwesome name="shopping-cart" size={24} color="black" />
                )}
              </TouchableOpacity>

              {isOwner ? (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: `/${tab}/edit`,
                      params: { recipe: JSON.stringify(recipe) },
                    })
                  }
                  style={styles.headerButton}
                >
                  <Text style={{ color: "#000000", fontWeight: "600" }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={updateFavorites}
                  style={styles.headerButton}
                >
                  {isFavorite ? (
                    <Ionicons name="heart" size={24} color="red" />
                  ) : (
                    <Ionicons name="heart-outline" size={24} color="black" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.title}>{recipe.name}</Text>
          {recipe.timeMinutes ? (
            <Text style={styles.time}>Time: {recipe.timeMinutes} min</Text>
          ) : null}

          {recipe.imageUri ? (
            <Image
              source={{ uri: recipe.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.divider} />
            //<View style={styles.emptyImage}></View>
          )}

          {Array.isArray(recipe.ingredients) && recipe.ingredients.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients:</Text>
              {recipe.ingredients.map((item, index) => (
                <Text key={`${item.name}-${index}`} style={styles.listItem}>
                  {index + 1}) {item.name}
                  {item.amount ? ` - ${item.amount}` : ""}
                </Text>
              ))}
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            {recipe.instructions ? (
              <Text style={styles.instructions}>{recipe.instructions}</Text>
            ) : (
              <Text style={styles.instructions}>None</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f2ec",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
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
  /*
  emptyImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  */
  chooseImageButton: {
    position: "absolute",
    top: 172,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: 20,
    height: 20,
    tintColor: "#888",
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2b2b2b",
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    color: "#d9534f",
    marginBottom: 16,
  },
  divider: {
    height: 5,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b2b2b",
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  instructions: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default RecipeDetail;
