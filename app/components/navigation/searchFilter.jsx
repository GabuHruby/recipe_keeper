import { StyleSheet, Text, View, FlatList, Image } from "react-native";
import React, { useMemo } from "react";

const SearchFilter = ({ data, search, setSearch }) => {
  //useMemo will remember the filtered data and will only recompute when data or search changes
  const filteredData = useMemo(() => {
    if (search === "") {
      return data;
    }

    return data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]); //Saved for next time

  const renderItem = ({ item }) => (
    <View style={styles.recipesContainer}>
      <View style={styles.recipeBox}>
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
          <Text style={styles.recipeAuthor}>Placeholder</Text>
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
      </View>
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
