import { Tabs } from "expo-router/js-tabs";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";

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

const TabsLayout = () => {
  return (
    <Tabs
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
      <Tabs.Screen
        name="home"
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
      <Tabs.Screen
        name="cart"
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
      <Tabs.Screen
        name="add"
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
      <Tabs.Screen
        name="personal"
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
      <Tabs.Screen
        name="profile"
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
    </Tabs>
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

export default TabsLayout;
