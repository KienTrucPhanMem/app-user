import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TextInput from '../components/TextInput';
import { colors, device, fonts } from '../constants';

// icons

const WhereTo = () => (
  <View style={styles.container}>
    <View style={styles.containerBanner}>
      <Text style={styles.bannerText}>Nhập địa chỉ bạn muốn đến</Text>
      <Text style={styles.bannerMuted}>Bike</Text>
    </View>

    <View style={styles.containerInput}>
      <View style={styles.containerSquare}>
        <View style={styles.square} />
      </View>
      <TextInput
        returnKeyType="next"
        onChangeText={(text) => {}}
        placeholder="Đi đến"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'absolute',
    shadowColor: colors.black,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    top: device.iPhoneNotch ? 144 : 120,
    width: device.width - 40
  },
  containerBanner: {
    backgroundColor: colors.green,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  bannerText: {
    color: colors.white,
    fontFamily: fonts.uberMedium,
    fontSize: 12
  },
  bannerMuted: {
    color: colors.mint,
    fontFamily: fonts.uberMedium,
    fontSize: 12
  },
  containerInput: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    height: 48
  },
  containerSquare: {
    alignItems: 'center',
    flex: 2
  },
  square: {
    backgroundColor: colors.black,
    height: 8,
    width: 8
  },
  text: {
    color: colors.greyAbbey,
    flex: 8,
    fontFamily: fonts.uberMedium,
    fontSize: 20
  },
  containerIcon: {
    alignItems: 'center',
    borderLeftColor: colors.greyMercury,
    borderLeftWidth: 1,
    flex: 2
  }
});

export default WhereTo;
