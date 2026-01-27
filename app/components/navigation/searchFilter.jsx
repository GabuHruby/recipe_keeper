import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";

const SearchFilter = ({
  data,
  search,
  setSearch,
  filter,
  favoriteIds,
  userId,
}) => {
  const navigation = useNavigation();

  //useMemo will remember the filtered data and will only recompute when data or search changes
  const filteredData = useMemo(() => {
    const searched =
      search === ""
        ? data
        : data.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          );

    //Set filtered depending on what has already been searched
    let filtered = searched;

    /*
    if (filter === "favorites") {
      filtered = searched.filter((item) => favoriteIds.includes(item._id));
    } else if (filter === "created") {
      filtered = searched.filter((item) => item.createdBy === userId);
    }

    //Easy sorting
    const sorters = {
      date_descending: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      date_ascending: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      name_ascending: (a, b) => a.name.localeCompare(b.name),
      name_descending: (a, b) => b.name.localeCompare(a.name),
    };
    
    //Sets sorter to one of the functions above
    const sorter = sorters[filter];
    if (sorter) {
      filtered = [...filtered].sort(sorter);
    }*/

    //Manual Sorting
    const manualSorters = {
      favorites: (filtered) => {
        return searched.filter((item) => favoriteIds.includes(item._id));
      },
      created: (filtered) => {
        return searched.filter((item) => item.createdBy === userId);
      },
      date_descending: (filtered) => {
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
          manualSorters["date_descending"](leftArr),
          manualSorters["date_descending"](rightArr)
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
          manualSorters["name_ascending"](rightArr)
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
  }, [data, search, filter, favoriteIds, userId]); //Saved for next time

  const renderItem = ({ item }) => (
    <View style={styles.recipesContainer}>
      <TouchableOpacity
        style={styles.recipeBox}
        onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
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
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeAuthor}>{item.author || "Unknown"}</Text>
          <View style={styles.recipeBottom}>
            {item.timeMinutes ? (
              <Text style={styles.recipeTime}>{item.timeMinutes} min</Text>
            ) : (
              <Text style={styles.recipeTime}>--</Text>
            )}
            <View style={styles.recipeOptionsContainer}>
              <Text style={styles.recipeOptions}>...</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatList}
        data={filteredData}
        renderItem={renderItem}
        //Key extractor assigns a unique key to each item in the list
        keyExtractor={(item, index) =>
          item._id?.toString() ??
          item.id?.toString() ??
          item + "-" + index.toString()
        }
        numColumns={2}
      />
    </View>
  );
};

export default SearchFilter;

const styles = StyleSheet.create({
  container: {
    height: 600,
  },
  flatList: {
    padding: 10,
  },
  recipesContainer: {
    width: "50%",
    marginVertical: 10,
  },
  recipeBox: {
    width: "89%",
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
    borderRadius: 8,
    overflow: "hidden",
    paddingBottom: 10,
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
  },
  recipeAuthor: {
    fontSize: 12,
    color: "#666",
    paddingLeft: 8,
    marginTop: 2,
  },
  recipeBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 10,
  },
  recipeTime: {
    fontSize: 12,
    paddingTop: 14,
    color: "#666",
  },
  recipeOptionsContainer: {
    alignItems: "center",
    paddingBottom: 10,
    paddingRight: 10,
  },
  recipeOptions: {
    fontSize: 25,
    color: "#666",
  },
});
