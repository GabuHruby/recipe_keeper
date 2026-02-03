import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditRecipe = ({ route }) => {
  const navigation = useNavigation();

  //Safety check to ensure recipe data exists
  const recipe = route?.params?.recipe;

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [checked, setChecked] = useState(recipe?.private || false);
  const [name, setName] = useState(recipe.name);
  const [timeMinutes, setTimeMinutes] = useState(recipe.timeMinutes || "");
  //add unique ids to ingredients if they don't have them
  const [ingredients, setIngredients] = useState(
    recipe.ingredients.map((item, index) => ({
      id: item.id || `${Date.now()}-${index}`,
      name: item.name,
      amount: item.amount,
    }))
  );
  const [instructions, setInstructions] = useState(recipe.instructions || "");
  const [imageUri, setImageUri] = useState(recipe.imageUri || null);
  const [error, setError] = useState("");
  const [altered, setAltered] = useState(false);

  const getImageMeta = (uri) => {
    const cleanUri = uri.split("?")[0];
    const fileName = cleanUri.split("/").pop() || `recipe-${Date.now()}.jpg`;
    const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
    const typeMap = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      heif: "image/heif",
    };
    return { name: fileName, type: typeMap[ext] || "image/jpeg" };
  };

  const uploadImage = async (uri) => {
    const { name, type } = getImageMeta(uri);
    const formData = new FormData();
    formData.append("file", {
      uri,
      name,
      type,
    });
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Image upload failed.");
    }
    const data = await response.json();
    return data.url;
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Photo library access is required to choose an image."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setImageUri(asset.uri);
        if (!altered) setAltered(true);
      }
    }
  };

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });
    if (result.canceled) {
      return;
    }
    const asset = result.assets?.[0];
    const uri = asset?.uri || result.uri;
    if (uri) {
      setImageUri(uri);
      if (!altered) setAltered(true);
    }
  };

  const handleChooseImage = () => {
    Alert.alert("Choose image", "Select a source", [
      { text: "Photos", onPress: handlePickPhoto },
      { text: "Files", onPress: handlePickFile },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const deleteRecipe = () => {
    //I know they can only be in this page if they are the owner, but just in case someone makes their way to this page not being the owner
    try {
      fetch(`${API_BASE_URL}/recipes/${recipe._id}`, {
        method: "DELETE",
      }).then(() => {
        navigation.goBack();
        navigation.goBack();
        Alert.alert("Recipe deleted successfully.");
      });
    } catch (error) {
      console.error("Failed to delete recipe:", error);
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

  const saveRecipe = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    let uploadedImageUrl = imageUri;
    const updatedRecipe = {
      name: name.trim(),
      timeMinutes: timeMinutes.trim(),
      ingredients: ingredients
        .filter((item) => item.name.trim())
        .map((item) => ({
          name: item.name.trim(),
          amount: item.amount.trim(),
        })),
      instructions: instructions.trim(),
      imageUri: uploadedImageUrl,
      author: (await AsyncStorage.getItem("username")) || "",
      createdBy: (await AsyncStorage.getItem("userId")) || "",
      private: checked,
    };
    //Send recipe to server
    try {
      if (imageUri) {
        uploadedImageUrl = await uploadImage(imageUri);
        updatedRecipe.imageUri = uploadedImageUrl;
      }
      const response = await fetch(`${API_BASE_URL}/recipes/${recipe._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecipe),
      });
      if (!response.ok) {
        throw new Error("Failed to save recipe.");
      }

      await response.json();
      Alert.alert("Recipe saved!");
      navigation.goBack();
    } catch (err) {
      console.log("SAVE RECIPE ERROR:", err);
      setError("Could not save recipe. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Text style={{ color: "#000000", fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>

          {altered ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={saveRecipe}
                style={styles.saveHeaderButton}
              >
                <Text style={{ color: "#000000", fontWeight: "600" }}>
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deleteRecipe}
                style={styles.headerButton}
              >
                <Text style={{ color: "#000000", fontWeight: "600" }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={deleteRecipe}
              style={styles.headerButton}
            >
              <Text style={{ color: "#000000", fontWeight: "600" }}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.imageWrap}>
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImageUri(null);
                  if (!altered) setAltered(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Remove image"
              >
                <Text style={styles.removeImageButtonText}>×</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No image selected</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.chooseImageButton(imageUri)}
            onPress={handleChooseImage}
            accessibilityRole="button"
            accessibilityLabel="Choose image"
          >
            <Image
              source={require("../../../assets/icons/camera.png")}
              style={styles.camera}
            />
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
            onChangeText={(text) => {
              setName(text);
              if (!altered) setAltered(true);
            }}
          />
        </View>

        <View style={styles.divider} />

        {/*TIME SECTION*/}
        <View style={styles.section}>
          <Text style={styles.label}>Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 25"
            placeholderTextColor="#afafaf"
            value={timeMinutes}
            onChangeText={(text) => {
              setTimeMinutes(text);
              if (!altered) setAltered(true);
            }}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.divider} />

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
                onChangeText={(value) => {
                  updateIngredient(item.id, "name", value);
                  if (!altered) setAltered(true);
                }}
              />
              <TextInput
                style={[styles.input, styles.ingredientAmount]}
                placeholder="Amount"
                placeholderTextColor="#afafaf"
                value={item.amount}
                onChangeText={(value) => {
                  updateIngredient(item.id, "amount", value);
                  if (!altered) setAltered(true);
                }}
              />
              {ingredients.length > 1 ? (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    handleRemoveIngredient(item.id);
                    if (!altered) setAltered(true);
                  }}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              handleAddIngredient();
              if (!altered) setAltered(true);
            }}
          >
            <Text style={styles.secondaryButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/*INSTRUCTIONS SECTION*/}
        <View style={styles.section}>
          <Text style={styles.label}>Step-by-step Instructions</Text>
          <TextInput
            style={[styles.input, styles.instructions]}
            placeholder="e.g. 1) Boil water..."
            placeholderTextColor="#afafaf"
            value={instructions}
            onChangeText={(text) => {
              setInstructions(text);
              if (!altered) setAltered(true);
            }}
            multiline
          />
        </View>

        <View style={styles.divider} />

        {/*PUBLIC/PRIVATE SECTION (used pressable to not have the opacity change on click*/}
        <View style={styles.section}>
          <Text style={styles.label}>Privacy</Text>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={() => {
                setChecked(!checked);
                if (!altered) setAltered(true);
              }}
            >
              <Ionicons
                name={checked ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={checked ? "#f27059" : "#8b6f5f"}
              />
            </Pressable>
            <Text
              style={{
                paddingTop: 3,
                marginLeft: 8,
                fontSize: 15,
                color: "#3a3a3a",
              }}
            >
              {checked
                ? "Private (only you can see this recipe)"
                : "Public (family can see this recipe)"}
            </Text>
          </View>
        </View>
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
    paddingTop: 0,
    paddingBottom: 132,
  },
  divider: {
    height: 5,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
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
  },
  saveHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#5eb37c",
    borderRadius: 12,
  },
  imageWrap: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#e9dccf",
    marginBottom: 16,
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
  chooseImageButton: (imageUri) => ({
    position: "absolute",
    top: imageUri ? 272 : 130,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  }),
  camera: {
    width: 20,
    height: 20,
    tintColor: "#888",
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

export default EditRecipe;
