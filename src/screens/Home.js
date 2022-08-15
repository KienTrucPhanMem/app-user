import * as Location from 'expo-location';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { colors, device, fonts, gStyle } from '../constants';

// components
import TouchText from '../components/TouchText';
import WhereTo from '../components/WhereTo';

import * as TaskManager from 'expo-task-manager';
// icons

const { PROVIDER_GOOGLE } = MapView;

const Home = ({ navigation }) => {
  const [showMap, setShowMap] = React.useState(false);
  const [coordinates, setCoords] = React.useState({ lat: null, lon: null });

  TaskManager.defineTask(
    'UPDATE_LOCATION',
    ({ data: { locations }, error }) => {
      if (error) {
        // check `error.message` for more details.
        return;
      }
      console.log('Received new locations', locations);
    }
  );

  React.useEffect(() => {
    const getLocation = async () => {
      // get exisiting locaton permissions first
      const { status: existingStatus } =
        await Location.requestForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      // ask again to grant locaton permissions (if not already allowed)
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      // still not allowed to use location?
      if (finalStatus !== 'granted') {
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync();

      setCoords({ lat: coords.latitude, lon: coords.longitude });
      setShowMap(true);
    };

    getLocation().catch(console.error);
  }, []);

  React.useEffect(() => {
    Location.startLocationUpdatesAsync('UPDATE_LOCATION', {
      deferredUpdatesInterval: 300
    });

    return () => Location.stopLocationUpdatesAsync('UPDATE_LOCATION');
  }, []);

  console.log(coordinates);

  return (
    <View style={gStyle.container}>
      {showMap && (
        <MapView
          followsUserLocation
          provider={PROVIDER_GOOGLE}
          region={{
            latitude: coordinates.lat,
            longitude: coordinates.lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
          showsUserLocation
          style={styles.map}
        />
      )}

      {!showMap && (
        <View style={styles.containerNoLocation}>
          <Text style={styles.textLocationNeeded}>
            We need your location data...
          </Text>
          <TouchText
            onPress={() => Linking.openURL('app-settings:')}
            style={styles.btnGoTo}
            styleText={styles.btnGoToText}
            text="Go To Permissions"
          />
        </View>
      )}

      <WhereTo />
    </View>
  );
};

Home.propTypes = {
  // required
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    height: device.height,
    position: 'absolute',
    width: device.width
  },
  containerNoLocation: {
    alignItems: 'center',
    height: device.height,
    justifyContent: 'center',
    position: 'absolute',
    width: device.width
  },
  textLocationNeeded: {
    fontFamily: fonts.uberMedium,
    fontSize: 16,
    marginBottom: 16
  },
  btnGoTo: {
    backgroundColor: colors.black,
    borderRadius: 3,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  btnGoToText: {
    color: colors.white,
    fontFamily: fonts.uberMedium,
    fontSize: 16
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: device.iPhoneNotch ? 58 : 34
  },
  help: {
    textAlign: 'center',
    width: 32
  },
  placeholder: {
    height: 32,
    width: 32
  },
  rightContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 40
  },
  icon: {
    borderRadius: 18,
    height: 36,
    shadowColor: colors.black,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 36
  },
  iconQRCode: {
    backgroundColor: colors.blue,
    marginBottom: 16
  },
  iconShield: {
    backgroundColor: colors.white
  }
});

export default Home;
