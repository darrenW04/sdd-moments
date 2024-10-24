import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FriendsPage from './friends'; // Import FriendsPage
import ProfilePage from './profile'; // Import ProfilePage
import CreateProfile from './createProfile'; // Import CreateProfile

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Friends">
        {/* Friends Page */}
        <Stack.Screen name="Friends" component={FriendsPage} />
        {/* Profile Page */}
        <Stack.Screen name="Profile" component={ProfilePage} />
        {/* Create Profile Page */}
        <Stack.Screen name="CreateProfile" component={CreateProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
