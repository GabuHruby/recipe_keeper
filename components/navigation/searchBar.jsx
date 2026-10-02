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

const SearchBar = ({
  search,
  setSearch,
  filter,
  setFilter,
  filterOptions = [],
}) => {
  const handlePress = () => {
    //Leaves if there is no filter options
    if (!filterOptions.length) {
      return;
    }
    //Gets labels from filter options
    const labels = filterOptions.map((option) => option.label);
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
      { cancelable: true },
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
