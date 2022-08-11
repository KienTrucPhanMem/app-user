import { createDrawerNavigator } from '@react-navigation/drawer';
import * as React from 'react';

// screens
import Home from '../screens/Home';

// components
import { useSelector } from 'react-redux';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default ({ navigation }) => {
  const auth = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (!auth.accessToken) {
      navigation.navigate('LoginScreen');
    }
  });

  if (!auth.accessToken) return null;

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={Home} />
    </Drawer.Navigator>
  );
};
