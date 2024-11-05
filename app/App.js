import "react-native-gesture-handler";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";

import FriendsPage from "./friends";
import ProfilePage from "./profile";
import CreateProfile from "./createProfile";

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();

function FriendsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Friends" component={FriendsPage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="CreateProfile" component={CreateProfile} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="CreateProfile" component={CreateProfile} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tabs.Navigator initialRouteName="Friends">
        <Tabs.Screen
          name="Friends"
          component={FriendsStack}
          options={{
            tabBarLabel: "Friends",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="users" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" color={color} size={size} />
            ),
          }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
