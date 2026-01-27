import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import SearchFilter from "../navigation/searchFilter";

const SearchBar = ({ recipes, filterOptions = [], favoriteIds, userId }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(filterOptions[0]?.value || "none");

  const handlePress = () => {
    //Leaves if there is no filter options
    if (!filterOptions.length) {
      return;
    }
    //Gets labels from filter options
    const labels = filterOptions.map((option) => option.label);
    //Check if user is on IOS or Android
    /*if (Platform.OS === "ios") {
      //https://reactnative.dev/docs/actionsheetios
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...labels, "Reset", "Cancel"],
          cancelButtonIndex: labels.length + 1,
          destructiveButtonIndex: labels.length,
        },
        (buttonIndex) => {
          if (buttonIndex >= 0 && buttonIndex < labels.length) {
            setFilter(filterOptions[buttonIndex].value);
          } else if (buttonIndex === labels.length) {
            setFilter("date_descending");
          }
          //Cancel button does nothing it just leaves
        }
      );
      return;
    }*/ //Tried using IOS but the cancel button was not wroking properly so I am going to leave it just in case but use android system as the default
    //Android Alert as a fallback
    Alert.alert(
      "Sort & filter",
      "Choose an option",
      [
        //Mapping only the labels from the filter options and setting the filter to that on press
        ...filterOptions.map((option) => ({
          text: option.label,
          onPress: () => setFilter(option.value),
        })),
        {
          text: "Reset",
          style: "destructive",
          onPress: () => setFilter("date_descending"),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
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
      <SearchFilter
        data={recipes}
        search={search}
        setSearch={setSearch}
        filter={filter}
        favoriteIds={favoriteIds}
        userId={userId}
      />
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
