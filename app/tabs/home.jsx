import { useState } from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/navigation/searchBar";

const HomeScreen = () => {
  const recipes = [
    {
      name: "Spaghetti Bolognese",
      id: 1,
    },
    {
      name: "Chicken Curry",
      id: 2,
    },
    {
      name: "Beef Stroganoff",
      id: 3,
    },
    {
      name: "Carbonara",
      id: 4,
    },
    {
      name: "Tacos",
      id: 5,
    },
    {
      name: "Hamburgers",
      id: 6,
    },
    {
      name: "Chicken Stroganoff",
      id: 7,
    },
  ];

  return (
    <SafeAreaView>
      <SearchBar recipes={recipes} />
    </SafeAreaView>
  );
};

export default HomeScreen;
/*
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#efefefff",
    margin: 15,
    width: "90%",
  },
  navigator: {
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
  },
  searchContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: "#cececeff",
    borderRadius: 15,
  },
  searchIcon: {
    marginLeft: 1,
    marginRight: 4,
  },
});
*/
