import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../../config/api";

const AddRecipe = () => {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const [name, setName] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [ingredients, setIngredients] = useState([
    { id: `${Date.now()}`, name: "", amount: "" },
  ]);
  const [instructions, setInstructions] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setTimeMinutes("");
    setIngredients([{ id: `${Date.now()}`, name: "", amount: "" }]);
    setInstructions("");
    setImageUri(null);
    setError("");
    //makes the screen scroll to the top when leaving
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  //goes to top of screen when navigated to every time
  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  //Choose a photo - more details: https://docs.expo.dev/versions/latest/sdk/imagepicker/
  const handlePickPhoto = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Photo library access is required to choose an image."
      );
      return;
    }
    // Choose image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      //?. is a safety check to make sure assets exist
      const asset = result.assets?.[0];
      //makes sure uri exists before setting state
      if (asset?.uri) {
        setImageUri(asset.uri);
      }
    }
  };

  //Choose a file - more details: https://docs.expo.dev/versions/latest/sdk/document-picker/
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
      //doesn't have an option to allow editing like ImagePicker
    });
    if (result.canceled) {
      return;
    }
    const asset = result.assets?.[0];
    const uri = asset?.uri || result.uri;
    if (uri) {
      setImageUri(uri);
    }
  };

  //Copies all previous ingredients with ...prev and adds a new blank ingredient in the end
  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, name: "", amount: "" },
    ]);
  };

  //Copies all previous ingredients and filters out the one with the matching id
  const handleRemoveIngredient = (id) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  //Updates a specific field (name or amount) of an ingredient by id
  const updateIngredient = (id, field, value) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  //Checks if there is a name and at least one ingredient
  const validate = () => {
    if (!name.trim()) {
      return "Recipe name is required.";
    }
    const hasIngredient = ingredients.some((item) => item.name.trim());
    if (!hasIngredient) {
      return "At least one ingredient is required.";
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    const recipe = {
      name: name.trim(),
      timeMinutes: timeMinutes.trim(),
      ingredients: ingredients
        .filter((item) => item.name.trim())
        .map((item) => ({
          name: item.name.trim(),
          amount: item.amount.trim(),
        })),
      instructions: instructions.trim(),
      imageUri,
    };
    //Send recipe to server
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      if (!response.ok) {
        throw new Error("Failed to save recipe.");
      }
      resetForm();
      Alert.alert("Recipe saved!");
      navigation.navigate("Personal");
    } catch (err) {
      console.log("SAVE RECIPE ERROR:", err);
      setError("Could not save recipe. Please try again.");
    }
  };

  return (
    // SafeAreaView adds natural padding to avoid things like the ios notch
    <SafeAreaView style={styles.safeArea}>
      {/* Loads everything at once unlike the FlatList used for recipes */}
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Recipe</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetForm}
            accessibilityRole="button"
            accessibilityLabel="Reset recipe"
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/*NAME SECTION*/}
        <View style={styles.section}>
          <Text style={styles.label}>Recipe Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Chicken Pasta"
            placeholderTextColor="#afafaf"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/*PHOTO SECTION*/}
        <View style={styles.section}>
          <Text style={styles.label}>Photo</Text>
          <View style={styles.imageWrap}>
            {/* The ? and : is an if and else since it can't be used in JSX */}
            {imageUri ? (
              <>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />

                {/*Small X button to remove the image*/}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove image"
                >
                  <Text style={styles.removeImageButtonText}>×</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>
                  No image selected
                </Text>
              </View>
            )}
          </View>

          <View style={styles.row}>
            {/*BUTTONS TO PICK PHOTO OR FILE*/}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePickPhoto}
            >
              <Text style={styles.secondaryButtonText}>Choose from Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePickFile}
            >
              <Text style={styles.secondaryButtonText}>Choose File</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*TIME SECTION*/}
        <View style={styles.section}>
          <Text style={styles.label}>Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 25"
            placeholderTextColor="#afafaf"
            value={timeMinutes}
            onChangeText={setTimeMinutes}
            keyboardType="numeric"
          />
        </View>

        {/*INGREDIENTS SECTION*/}
        <View style={styles.section}>
          <Text style={styles.label}>Ingredients *</Text>
          {ingredients.map((item, index) => (
            <View key={item.id} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientName]}
                placeholder={`Ingredient ${index + 1}`}
                placeholderTextColor="#afafaf"
                value={item.name}
                onChangeText={(value) =>
                  updateIngredient(item.id, "name", value)
                }
              />
              <TextInput
                style={[styles.input, styles.ingredientAmount]}
                placeholder="Amount"
                placeholderTextColor="#afafaf"
                value={item.amount}
                onChangeText={(value) =>
                  updateIngredient(item.id, "amount", value)
                }
              />
              {ingredients.length > 1 ? (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveIngredient(item.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAddIngredient}
          >
            <Text style={styles.secondaryButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        {/*INSTRUCTIONS SECTION*/}
        <View style={styles.section}>
          <Text style={styles.label}>Step-by-step Instructions</Text>
          <TextInput
            style={[styles.input, styles.instructions]}
            placeholder="e.g. 1) Boil water..."
            placeholderTextColor="#afafaf"
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/*SUBMIT SECTION*/}
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Add Recipe</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f2ec",
  },
  container: {
    padding: 20,
    paddingBottom: 132,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2b2b2b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#f1e6dc",
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8b6f5f",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a3a3a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1d7cd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  imageWrap: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#e9dccf",
  },
  imagePreview: {
    width: "100%",
    height: 320,
  },
  imagePlaceholder: {
    flex: 1,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: "#a08f80",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageButtonText: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "700",
  },
  ingredientRow: {
    marginBottom: 12,
  },
  ingredientName: {
    marginBottom: 8,
  },
  ingredientAmount: {
    marginBottom: 8,
  },
  instructions: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#f27059",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1c9b8",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#c9654e",
    fontSize: 13,
    fontWeight: "600",
  },
  removeButton: {
    alignSelf: "flex-start",
    backgroundColor: "#fff1ed",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  removeButtonText: {
    color: "#c04b3a",
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    color: "#b3261e",
    marginBottom: 12,
    fontWeight: "600",
  },
});

export default AddRecipe;
