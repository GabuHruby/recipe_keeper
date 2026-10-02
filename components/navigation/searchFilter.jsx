import { useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { router, useSegments } from "expo-router";

export const getFilteredRecipes = (
  data,
  search,
  filter,
  favoriteIds,
  userId,
) => {
  const searched =
    search === ""
      ? data
      : data.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        );

  let filtered = searched;

  const manualSorters = {
    favorites: (filtered) => {
      return filtered.filter((item) => favoriteIds.includes(item._id));
    },
    created: (filtered) => {
      return filtered.filter((item) => item.createdBy === userId);
    },
    date_descending: (filtered) => {
      var sorted = [...filtered];
      //Merge sort implementation - https://www.youtube.com/watch?v=wXZyuJqNk9U
      if (sorted.length <= 1) {
        return sorted;
      }
      const mid = Math.floor(sorted.length / 2);
      const leftArr = sorted.slice(0, mid);
      const rightArr = sorted.slice(mid);
      return merge(
        manualSorters["date_descending"](leftArr),
        manualSorters["date_descending"](rightArr),
      );
      function merge(leftArr, rightArr) {
        const sortedArr = [];
        while (leftArr.length && rightArr.length) {
          if (
            new Date(leftArr[0].createdAt) > new Date(rightArr[0].createdAt)
          ) {
            sortedArr.push(leftArr.shift());
          } else {
            sortedArr.push(rightArr.shift());
          }
        }
        //If there are still elements in either array, add them to the end
        return [...sortedArr, ...leftArr, ...rightArr];
      }
    },
    date_ascending: (filtered) => {
      //Calling the top method and reversing the result
      return manualSorters["date_descending"](filtered).reverse();
    },
    name_ascending: (filtered) => {
      var sorted = [...filtered];
      //Merge sort implementation
      //https://www.youtube.com/watch?v=wXZyuJqNk9U
      if (sorted.length <= 1) {
        return sorted;
      }
      const mid = Math.floor(sorted.length / 2);
      const leftArr = sorted.slice(0, mid);
      const rightArr = sorted.slice(mid);
      return merge(
        manualSorters["name_ascending"](leftArr),
        manualSorters["name_ascending"](rightArr),
      );
      function merge(leftArr, rightArr) {
        const sortedArr = [];
        while (leftArr.length && rightArr.length) {
          if (leftArr[0].name.localeCompare(rightArr[0].name) < 0) {
            sortedArr.push(leftArr.shift());
          } else {
            sortedArr.push(rightArr.shift());
          }
        }
        //If there are still elements in either array, add them to the end
        return [...sortedArr, ...leftArr, ...rightArr];
      }
    },
    name_descending: (filtered) => {
      //Calling the top method and reversing the result
      return manualSorters["name_ascending"](filtered).reverse();
    },
  };

  const sorter = manualSorters[filter];
  if (sorter) {
    filtered = sorter([...filtered]);
  }

  return filtered;
};

const SearchFilter = ({
  item,
  isFavorite = false,
  inCart = false,
  onToggleFavorite,
  onToggleCart,
}) => {
  //Open the recipe inside whichever tab (home or personal) this list is in
  const [, tab] = useSegments();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.recipesContainer}>
      <TouchableOpacity
        style={styles.recipeBox}
        onPress={() =>
          router.push({
            pathname: `/${tab}/recipe`,
            params: { recipe: JSON.stringify(item) },
          })
        }
      >
        <View style={styles.recipeInner}>
          {item.imageUri ? (
            <Image
              source={{ uri: item.imageUri }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={{
                uri: "https://res.cloudinary.com/dq6ag1bv3/image/upload/v1768752836/No_Image_Icon_Beige_rpyey7.jpg",
              }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          )}
          <Text
            style={styles.recipeName}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text
            style={styles.recipeAuthor}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.author || "Unknown"}
          </Text>
          <View style={styles.recipeBottom}>
            {item.timeMinutes ? (
              <Text
                style={styles.recipeTime}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.timeMinutes} min
              </Text>
            ) : (
              <Text
                style={styles.recipeTime}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                --
              </Text>
            )}
            <View style={styles.recipeOptionsContainer}>
              <TouchableOpacity
                style={styles.recipeOptionsButton}
                onPress={(event) => {
                  event.stopPropagation();
                  setMenuVisible((current) => !current);
                }}
              >
                <Text style={styles.recipeOptions}>...</Text>
              </TouchableOpacity>
              {menuVisible ? (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={(event) => {
                      event.stopPropagation();
                      setMenuVisible(false);
                      if (onToggleFavorite) {
                        onToggleFavorite(item._id, !isFavorite);
                      }
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={(event) => {
                      event.stopPropagation();
                      setMenuVisible(false);
                      if (onToggleCart) {
                        onToggleCart(item._id, !inCart);
                      }
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {inCart ? "Remove from cart" : "Add to cart"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SearchFilter;

const styles = StyleSheet.create({
  recipesContainer: {
    width: "50%",
    marginVertical: 10,
  },
  recipeBox: {
    width: "89%",
    height: 270,
    alignSelf: "center",
    borderRadius: 8,
    backgroundColor: "#f7f2ec",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  recipeInner: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    paddingBottom: 8,
  },
  recipeImage: {
    width: "100%",
    height: 150,
    marginBottom: 5,
    backgroundColor: "#eee",
    alignSelf: "center",
  },
  recipeName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    paddingLeft: 8,
    paddingTop: 3,
    paddingRight: 8,
  },
  recipeAuthor: {
    fontSize: 12,
    color: "#666",
    paddingLeft: 8,
    paddingRight: 8,
    marginTop: 2,
  },
  recipeBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    alignItems: "flex-end",
    marginTop: "auto",
  },
  recipeTime: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  recipeOptionsContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 10,
  },
  recipeOptionsButton: {
    minWidth: 30,
    alignItems: "center",
  },
  recipeOptions: {
    fontSize: 25,
    color: "#666",
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    bottom: 32,
    width: 160,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e1d7cd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
    zIndex: 20,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 13,
    color: "#2b2b2b",
    fontWeight: "600",
  },
});
