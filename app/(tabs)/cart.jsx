import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../../config/api";

const Cart = () => {
  const [recipesInCart, setRecipesInCart] = useState([]);
  const [storedID, setStoredID] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const loadRecipes = useCallback(async () => {
    try {
      const storedID = await AsyncStorage.getItem("userId");
      setStoredID(storedID);

      const response = await fetch(
        `${API_BASE_URL}/users/${storedID}/recipesInCart`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch recipes.");
      }

      const data = await response.json();

      const recipes = [...data.recipesInCart];
      setRecipesInCart(recipes);
    } catch (err) {
      setRecipesInCart([]);
    }
  }, []);

  //Runs the code every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  const updateCart = async (recipeId) => {
    try {
      await fetch(`${API_BASE_URL}/users/${storedID}/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipeId,
          add: false,
        }),
      });
      setRecipesInCart((prev) =>
        prev.filter((recipe) => recipe._id !== recipeId)
      );
      //reset checked items
      setCheckedItems({});
    } catch (err) {
      //nothing
    }
  };

  const changeOrder = (item, isChecked, key) => {
    //doesn't work yet
  };

  const renderItem = ({ item }) => (
    <View style={styles.recipeContainer}>
      {/*item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.recipeImage} />
      ) : null*/}
      <View
        style={{
          marginBottom: 10,
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Text style={styles.recipeName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => updateCart(item._id)}
        >
          <Text style={styles.clearButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.ingredientsTitle}>Ingredients: </Text>
      <View style={{ marginBottom: 15 }}>
        {
          //return a function instead of straight to jsx so that we can use more complex logic
          item.ingredients.map((ingredient, index) => {
            const key = `${item._id}-${index}`;
            //!! fixes an error that occurs when the value is undefined
            const isChecked = !!checkedItems[key];
            return (
              <View
                key={key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Checkbox
                  value={isChecked}
                  onValueChange={(value) => {
                    //leaves checked items and adds the curent one to the end
                    setCheckedItems((prev) => ({ ...prev, [key]: value }));
                    changeOrder(item, value, key);
                  }}
                  style={{ marginRight: 8, opacity: isChecked ? 0.5 : 1 }}
                  color={isChecked ? "#4630EB" : undefined}
                />
                <Text
                  key={`${item.name}-${index}`}
                  style={[
                    styles.ingredientItem,
                    { opacity: isChecked ? 0.5 : 1 },
                  ]}
                >
                  {ingredient.name}
                  {/*Amount is not required to create a recipe so we have to check if there is an amount*/}
                  {ingredient.amount ? ` - ${ingredient.amount}` : ""}
                </Text>
              </View>
            );
          })
        }
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          style={styles.flatList}
          data={recipesInCart}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyCartText}>Your cart is empty.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f2ec",
  },
  container: {
    height: 600,
  },
  flatList: {
    padding: 10,
    paddingHorizontal: 20,
  },
  recipeContainer: {},
  recipeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingTop: 3,
  },
  clearButton: {
    paddingTop: 10,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#ff4444",
    textDecorationLine: "underline",
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  emptyCartText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    color: "#555",
  },
});
