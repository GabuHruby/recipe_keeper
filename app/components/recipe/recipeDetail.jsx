import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RecipeDetail = ({ route }) => {
  const navigation = useNavigation();
  const [isOwner, setIsOwner] = useState(false);
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

  const loadUserData = useCallback(async () => {
    const storedId = await AsyncStorage.getItem("userId");
    if (storedId && recipe.createdBy && storedId === recipe.createdBy) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ height: 740, paddingBottom: 40 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Text style={{ color: "#000000", fontWeight: "600" }}>Back</Text>
            </TouchableOpacity>
            {isOwner ? (
              <TouchableOpacity
                onPress={() => navigation.navigate("EditRecipe", { recipe })}
                style={styles.headerButton}
              >
                <Text style={{ color: "#000000", fontWeight: "600" }}>
                  Edit
                </Text>
              </TouchableOpacity>
            ) : null}
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
