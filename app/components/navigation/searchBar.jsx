import { useState } from "react";
import { Pressable, StyleSheet, View, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import SearchFilter from "../navigation/searchFilter";

const SearchBar = ({ recipes }) => {
  const [search, setSearch] = useState("");

  const handlePress = () => {
    // Placeholder for filter functionality
    console.log("Filter button pressed");
  };
  return (
    <View style={styles.container}>
      <View style={styles.navigator}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color="black"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
        </View>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Feather
            name="filter"
            size={24}
            color="black"
            style={{ marginLeft: 15 }}
          />
        </Pressable>
      </View>
      <SearchFilter data={recipes} search={search} setSearch={setSearch} />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f2ec",
  },
  navigator: {
    alignItems: "center",
    flexDirection: "row",
    margin: 15,
    marginTop: 0,
    marginBottom: 10,
  },
  searchContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1d7cd",
    borderRadius: 15,
  },
  searchIcon: {
    marginLeft: 1,
    marginRight: 4,
  },
});
