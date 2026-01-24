import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
          <TouchableOpacity onPress={deleteRecipe} style={styles.headerButton}>
            <Text style={{ color: "#000000", fontWeight: "600" }}>Delete</Text>
          </TouchableOpacity>
        </View>

        {recipe.imageUri ? (
          <Image
            source={{ uri: recipe.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.emptyImage}>
            <TouchableOpacity
              style={styles.chooseImageButton}
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel="Choose image"
            >
              <Image
                source={require("../../../assets/icons/camera.png")}
                style={styles.camera}
              />
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.title}>{recipe.name}</Text>
        {recipe.timeMinutes ? (
          <Text style={styles.meta}>Time: {recipe.timeMinutes} min</Text>
        ) : null}

        {Array.isArray(recipe.ingredients) && recipe.ingredients.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((item, index) => (
              <Text key={`${item.name}-${index}`} style={styles.listItem}>
                {item.name}
                {item.amount ? ` - ${item.amount}` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        {recipe.instructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructions}>{recipe.instructions}</Text>
          </View>
        ) : null}
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
  emptyImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
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
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b2b2b",
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: "#6f6f6f",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
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

export default EditRecipe;
