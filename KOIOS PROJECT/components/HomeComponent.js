
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, ImageBackground, ActivityIndicator, Image, TouchableOpacity} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { createAndPopulateDatabase } from '../database';

const homeBackgroundImg = '../assets/images/backgrounds/home.png';
const appLogo = '../assets/images/square_imgs/app_logo.png';
const screenWidth = Dimensions.get("window").width;

export function HomeComponent() {

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check the database initialization status
    // the first time the game loads the database is created
    AsyncStorage.getItem('databaseInitialized')
      .then((value) => {
        if (value === null) {
          createAndPopulateDatabase()
            .then( () => {
              AsyncStorage.setItem('databaseInitialized', 'true')
                .then(() => {
                  AsyncStorage.setItem('maxScoreSpanish', '0');
                  AsyncStorage.setItem('maxScoreEnglish', '0');
                  setIsLoading(false);
                });
            })
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const pressHomeLogo = () =>{
    navigation.navigate('Streaks',{language:'English'});
  };

  const pressSelectGame = () =>{
    navigation.navigate('YourGames',{language:"English"})
  };

  const pressInstructions = () =>{
    navigation.navigate('Instructions',{language:"English"})
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <ImageBackground source={require(homeBackgroundImg)} resizeMode="stretch" style={styles.backgroundImg}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#51b2b6" />
          ) : (
            <View style={styles.screenContainer}>

              <View style={styles.homeScreenLogoContainer}>
                <Image source={require(appLogo)} style={styles.appLogo} resizeMode="contain"/>
              </View>

              <View style={styles.homeScreenButtonContainer}>

                <TouchableOpacity style={[styles.homeScreenButton,{backgroundColor:"#88d1e8"}]}
                                  onPress={pressSelectGame}>

                  <Text style={styles.homeScreenButtonText}>Select Game</Text>

                </TouchableOpacity>

                <TouchableOpacity style={[styles.homeScreenButton,{backgroundColor:"#9ce8d1"}]}
                                  onPress={pressHomeLogo}>

                  <Text style={styles.homeScreenButtonText}>Your Streaks</Text>

                </TouchableOpacity>


                <TouchableOpacity style={[styles.homeScreenButton,{backgroundColor:"#ffbd59"}]}
                                  onPress={ pressInstructions} >

                  <Text style={styles.homeScreenButtonText}>Instructions</Text>

                </TouchableOpacity>

              </View>

            </View>
          )}

        </ImageBackground>

      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff1d1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backgroundImg: {
    flex: 1,
    width:"100%",
    height:"100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeAreaContainer :{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width:'100%',
    height:'100%',
    paddingTop: Platform.OS === 'android' ? 37 : 0
  },
  screenContainer:{
    width:"100%",
    height:"100%",
    alignItems:"center",
    justifyContent:"center"
  },
  homeScreenLanguageContainer:{
    flex: 1,
    flexDirection:"row",
    alignItems: 'center',
    justifyContent: 'space-between',
    width:"100%",
    paddingLeft:"25%",
    paddingRight:"25%"
  },
  homeScreenLogoContainer:{
    width: screenWidth*0.6,
    aspectRatio: 1,
    marginBottom: screenWidth * 0.07
  },
  appLogo:{
    flex:1,
    width:"100%",
  },
  homeScreenButtonContainer:{
    width: screenWidth * 0.6,
    alignItems: 'center',
    marginTop: "5%",
  },
  homeScreenButton:{
    alignItems: 'center',
    justifyContent: 'center',
    width:"80%",
    borderRadius:10,
    marginBottom:screenWidth * 0.04,
    paddingTop: screenWidth * 0.03,
    paddingBottom: screenWidth * 0.03,
  },
  homeScreenButtonText:{
    color:"white",
    fontSize: screenWidth * 0.05,
    fontWeight:900,
  }
})
