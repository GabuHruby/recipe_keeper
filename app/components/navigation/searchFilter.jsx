import { StyleSheet, Text, View, FlatList } from "react-native";
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
      <Text style={styles.recipeName}>{item.name}</Text>
      <Text
        style={{
          borderColor: "gray",
          borderWidth: 1,
          height: 1,
          marginTop: 1,
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
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
    padding: 10,
    height: 600,
  },
  recipesContainer: {
    width: "50%",
    marginVertical: 10,
    alignItems: "center",
  },
  recipeName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});
