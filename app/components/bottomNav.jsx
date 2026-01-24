import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../tabs/home";
import CartScreen from "../tabs/cart";
import PersonalScreen from "../tabs/personal";
import ProfileScreen from "../tabs/profile";
import AddRecipeScreen from "../tabs/addRecipe";
import RecipeDetailScreen from "./recipe/recipeDetail";
import EditRecipeScreen from "./recipe/editRecipe";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStackScreen = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeList"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RecipeDetail"
      component={RecipeDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditRecipe"
      component={EditRecipeScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const PersonalStackScreen = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="PersonalList"
      component={PersonalScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RecipeDetail"
      component={RecipeDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditRecipe"
      component={EditRecipeScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -30,
      justifyContent: "center",
      alignItems: "center",
      ...style.shadow,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 35,
        backgroundColor: "#e32f45",
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

const BottomNav = ({ setAuth }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          marginHorizontal: 20,
          bottom: 25,
          elevation: 0,
          backgroundColor: "#ffffff",
          borderRadius: 15,
          height: 90,
          paddingTop: 14,
          ...style.shadow,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/home.png")}
              resizeMode="contain"
              style={style.iconImage(focused)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={style.labelText(focused)}>HOME</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/cart.png")}
              resizeMode="contain"
              style={style.iconImage(focused)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={style.labelText(focused)}>CART</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddRecipeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/add.png")}
              resizeMode="contain"
              style={{
                width: 40,
                height: 40,
                tintColor: "#fff",
              }}
            />
          ),
          tabBarLabel: () => null,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Personal"
        component={PersonalStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/personal.png")}
              resizeMode="contain"
              style={style.iconImage(focused)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={style.labelText(focused)}>RECIPES</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen setAuth={setAuth} />}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/user.png")}
              resizeMode="contain"
              style={style.iconImage(focused)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={style.labelText(focused)}>PROFILE</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const style = StyleSheet.create({
  shadow: {
    shadowColor: "#7F5DF0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  iconImage: (focused) => ({
    width: 25,
    height: 25,
    tintColor: focused ? "#e32f45" : "#748c94",
  }),
  labelText: (focused) => ({
    color: focused ? "#e32f45" : "#748c94",
    fontSize: 10,
    paddingTop: 4,
  }),
});

export default BottomNav;
