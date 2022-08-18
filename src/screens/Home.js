import * as Location from 'expo-location';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { colors, device, fonts, gStyle } from '../constants';
import { Polyline } from 'react-native-maps';
import Button from '../components/Button';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// components
import TouchText from '../components/TouchText';
import WhereTo from '../components/WhereTo';

import * as TaskManager from 'expo-task-manager';
import { booking, updateFCMToken } from '../apis/passenger';
import { useSelector } from 'react-redux';
import { getPlacesReverse } from '../apis/place';
// icons

const { PROVIDER_GOOGLE } = MapView;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

const Home = ({ navigation }) => {
  const auth = useSelector((state) => state.auth);

  const [showMap, setShowMap] = React.useState(false);
  const [coordinates, setCoords] = React.useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  });
  const [destination, setDestination] = React.useState();
  const [step, setStep] = React.useState(0);

  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  const handlePlaceClick = (place) => {
    if (place) {
      setDestination({
        latitude: place.latitude,
        longitude: place.longitude,
        address: `${place.number || ''} ${place.street || ''} ${
          place.county || ''
        } ${place.region || ''} ${place.country || ''}`
      });

      setStep(1);
    } else {
      setDestination(undefined);
      setStep(0);
    }
  };

  const handleBooking = async () => {
    //Call api booking
    if (auth) {
      try {
        const res = await getPlacesReverse({
          query: `${coordinates.latitude},${coordinates.longitude}`,

          country: 'VN',
          limit: 5
        });

        console.log({
          passengerId: auth._id,
          from: {
            latitude: res.data.data[0].latitude,
            longitude: res.data.data[0].longitude,
            address: `${res.data.data[0].number || ''} ${
              res.data.data[0].street || ''
            } ${res.data.data[0].county || ''} ${
              res.data.data[0].region || ''
            } ${res.data.data[0].country || ''}`
          },
          to: destination
        });

        await booking({
          passengerId: auth._id,
          from: {
            latitude: res.data.data[0].latitude,
            longitude: res.data.data[0].longitude,
            address: `${res.data.data[0].number || ''} ${
              res.data.data[0].street || ''
            } ${res.data.data[0].county || ''} ${
              res.data.data[0].region || ''
            } ${res.data.data[0].country || ''}`
          },
          to: destination
        });

        setStep(2);
      } catch (e) {
        console.log(e);
      }
    }
  };

  TaskManager.defineTask(
    'UPDATE_LOCATION',
    ({ data: { locations }, error }) => {
      if (error) {
        // check `error.message` for more details.
        return;
      }
    }
  );

  //Get location
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

      setCoords((state) => ({
        ...state,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
      setShowMap(true);
    };

    getLocation().catch(console.error);
  }, []);

  //Get notification
  React.useEffect(() => {
    if (auth) {
      registerForPushNotificationsAsync()
        .then(async (token) => {
          try {
            const res = await updateFCMToken({ id: auth._id, token });
          } catch (e) {
            console.log(e);
          }
        })
        .catch((e) => console.log(e));

      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log({ notification });
        });

      // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log({ response });
        });
    }

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [auth]);

  React.useEffect(() => {
    Location.startLocationUpdatesAsync('UPDATE_LOCATION', {
      deferredUpdatesInterval: 300
    });

    return () => Location.stopLocationUpdatesAsync('UPDATE_LOCATION');
  }, []);

  return (
    <View style={gStyle.container}>
      {showMap && (
        <MapView
          followsUserLocation
          provider={PROVIDER_GOOGLE}
          region={coordinates}
          showsUserLocation
          style={styles.map}
        >
          {destination ? (
            <>
              <Polyline
                coordinates={[
                  coordinates,
                  {
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                  }
                ]}
                strokeColor={'21E1E1'}
                strokeWidth={6}
                lineDashPattern={[1]}
              />

              <MapView.Marker
                coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude
                }}
              />
            </>
          ) : null}
        </MapView>
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

      {step !== 0 && (
        <View style={styles.bookButton}>
          {step === 1 && (
            <Button mode="contained" onPress={handleBooking}>
              Đặt xe
            </Button>
          )}

          {step === 2 && (
            <Text style={styles.findingDriver}>Đang tìm tài xế ...</Text>
          )}

          {step === 3 && (
            <View style={styles.bookingContainer}>
              <Text style={styles.bookingTitle}>Thông tin cuốc xe</Text>
              <Text
                style={styles.bookingInfo}
              >{`Tài xế: ${'Nguyễn Văn A'}`}</Text>
              <Text
                style={styles.bookingInfo}
              >{`Điểm đón: ${'227 Nguyen Van Cu'}`}</Text>
              <Text
                style={styles.bookingInfo}
              >{`Điểm đến: ${'227 Nguyen Van Cu'}`}</Text>
            </View>
          )}

          {step === 4 && (
            <View style={styles.bookingContainer}>
              <Text style={styles.bookingTitle}>Hoàn thành</Text>
              <Text style={styles.bookingTitle}>
                Cảm ơn bạn đã sử dụng dịch vụ
              </Text>
              <Button mode="contained" onPress={() => setStep(0)}>
                Đóng
              </Button>
            </View>
          )}
        </View>
      )}

      {(step === 0 || step === 1) && (
        <WhereTo onPlaceClick={handlePlaceClick} />
      )}
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
  },
  bookButton: {
    position: 'absolute',
    bottom: 60,
    width: device.width - 40,
    alignSelf: 'center'
  },
  findingDriver: {
    fontSize: 18,
    backgroundColor: colors.green,
    padding: 16,
    borderRadius: 4,
    color: colors.white
  },
  bookingContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4
  },
  bookingTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center'
  },
  bookingInfo: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold'
  }
});

export default Home;

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' }
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    });
  }

  return token;
}
