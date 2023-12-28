import {StyleSheet,Text,View,SafeAreaView,ImageBackground,Image} from 'react-native';
import React, { useState } from 'react';
import { ThemedButton } from 'react-native-really-awesome-button';
import { useNavigation } from '@react-navigation/native';

const HomeScreenComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation(); // To access the navigation from this component
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/background_img.jpeg')}
        resizeMode="cover"
        style={styles.backgroundImg}
        onLoadStart={() => {
          setIsLoading(true);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}>
        <SafeAreaView style={[isLoading ? {opacity:0}: {opacity: 1}, styles.safeView]}>
          <View style={styles.appName}>
            <Image
              style={styles.logo}
              source={require('../assets/images/app_name.png')}
            />
          </View>
          <View style={styles.startGame}>
            <ThemedButton
              name="rick"
              type="anchor"
              textSize={20}
              textColor={"white"}
              style={styles.buttonStart}
              onPress={() => {
                navigation.push('Game', {});
              }}>
              Start Game
            </ThemedButton>
            <ThemedButton
              name="rick"
              type="secondary"
              textSize={20}
              style={styles.buttonStart}
              onPress={() => {
                navigation.push('Instructions', {});
              }}>
              How to play
            </ThemedButton>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImg: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  safeView: {
    flex: 1,
  },
  appName: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logo: {
    width: '90%',
    resizeMode: 'contain',
  },
  startGame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonStart: {
    marginBottom: 16,
  }
});

export default HomeScreenComponent;
