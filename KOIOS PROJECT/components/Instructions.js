import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, SafeAreaView, Dimensions, ImageBackground, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useNavigation } from '@react-navigation/native';


const screenWidth = Dimensions.get("window").width;

const backgroundImg = '../assets/images/backgrounds/6.png';

const gameScreen =  '../assets/images/instructions_imgs/gameScreen.png';

const statsScreen =  '../assets/images/instructions_imgs/statsScreen.png';

const coursePage =  '../assets/images/instructions_imgs/coursePage.png';

const streaks = '../assets/images/instructions_imgs/streaks.png';

const stats_slider = '../assets/images/instructions_imgs/stats_slider.png';

const chooseGame = '../assets/images/instructions_imgs/chooseGame.png';

const badges = '../assets/images/instructions_imgs/badges.png';

const stats = '../assets/images/instructions_imgs/stats.png';

const studyOwl = '../assets/images/square_imgs/29.png';

const appLogo = '../assets/images/square_imgs/38.png';

const close = '../assets/images/square_imgs/30.png';


const slides = [
  {
    key: 'one',
    title: 'Welcome!',
    text: `Welcome to KOIOS! This game was designed to help you learn the words you need to ace your CEFR (Common European Framework of Reference) tests.`,
    image: require(appLogo),
    backgroundColor: '#59b2ab',
  },
  {
    key: 'two',
    title: 'Game objective',
    text: `You can learn new words for each of the six levels: A1 through C2, for both the English and Spanish courses.`,
    image: require(studyOwl),
    backgroundColor: '#59b2ab',
  },
  {
    key: 'seven',
    title: 'Choosing a Game',
    text: `You can choose between learning words in Spanish or English.\n\nWhen you click the Choose Level button you can choose any of the six CEFR levels to learn new words.`,
    image: require(chooseGame),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'eight',
    title: 'Choosing Level',
    text: `Choose between any of the six CEFR levels your wish to practice.\n\nYou can see the progress you are making on each of the courses with the progress chart on the right side.`,
    image: require(coursePage),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'three',
    title: 'Playing the Game',
    text: `The game will provide a definition for a word and a hint of the first letters of the word you have to guess.\n\nYou will have 60 seconds to come up with as many words as you can.`,
    image: require(gameScreen),
    backgroundColor: '#febe29',
  },
  {
    key: 'four',
    title: 'Skipping a word',
    text: `If you don't know the word you can skip it using the button on the lower left side.\n\nYou earn points each time you input the matching word for a particular definition.`,
    image: require(gameScreen),
    backgroundColor: '#febe29',
  },
  {
    key: 'five',
    title: 'Pausing the Game',
    text: `If you want to pause the game use the button on the upper left side.\n\nYou must use the provided letters to form the word that matches the given definition.`,
    image: require(gameScreen),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'six',
    title: 'Making errors',
    text: `If you choose the wrong letter, use the backspace button on the lower right side to delete it from your answer.\n\nPress the Submit button to check your answer.`,
    image: require(gameScreen),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'ten',
    title: 'Stats',
    text: `Once the game is finished you can see your Stats.\n\nYou can compare your current score with your highest score and check your accuracy!`,
    image: require(stats),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'eleven',
    title: 'Stats',
    text: `You can also see the list of words studied during the session.\n\n You can use the sliders next to each word to mark it as known, so you don't have to study it again.`,
    image: require(stats_slider),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'nine',
    title: 'Earning Badges',
    text: `Once you complete a course you will be granted a badge.\n\nEach level grants a different badge. Try earning them ALL!`,
    image: require(badges),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'twelve',
    title: 'Your Streaks',
    text: `You can visit your Streaks page from the Home Screen.\n\nHere you'll be able to see how many days you have studied, how much time and your longest streak.`,
    image: require(streaks),
    backgroundColor: '#22bcb5',
  },

];

const Instructions = () => {

  const _renderItem = ({ item }) => {

    return (

      <ImageBackground source={require(backgroundImg)} resizeMode="stretch" style={styles.backgroundImg}>

        <SafeAreaView style={styles.safeAreaContainer}>

          <TouchableOpacity style={styles.closeButton} onPress={_onCloseButton}>

            <Image source={require(close)} resizeMode="contain" style={{maxWidth:"100%", maxHeight:"100%", flex:1}}/>

          </TouchableOpacity>

          <View style={[styles.slide]}>

            <View style={styles.titleWrapper}>

              <Text style={styles.title}>{item.title}</Text>

            </View>

            <Image style={styles.image} source={item.image} resizeMode="contain" />

            <View style={styles.textWrapper}>

              <Text style={styles.text}>{item.text}</Text>

            </View>

          </View>

        </SafeAreaView>

      </ImageBackground>
    );
  };

  _renderSkipButton = () => {
    return (
      <View style={{opacity:0}}>

      </View>
    );
  };

  _renderNextButton = () => {
    return (
      <View style={{height:40, justifyContent:"center", alignItems:"center"}}>
        <Text style={{fontSize:20}}>Next</Text>
      </View>
    );
  };

  const navigation = useNavigation();

  const _onDone = () => {
    navigation.navigate('Home');
  };

  const _onCloseButton = () => {
    navigation.pop(); // Removing the current screen from the stack
  }

  return (
    <View style={{ flex: 1 }}>
      <AppIntroSlider
        renderItem={_renderItem}
        data={slides}
        onDone={_onCloseButton}
        showSkipButton
        onSkip={_onDone}
        renderSkipButton={this._renderSkipButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width:"100%",
  },
  safeAreaContainer :{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: screenWidth * 0.09,
  },
  titleWrapper:{
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  },
  title:{
    fontSize: screenWidth * 0.08,
    fontWeight: 900,
    color:"#757AAA"
  },
  image:{
    flex:3,
  },
  closeButton:{
    position: 'absolute',
    right: 0,
    top: 0,
    height:40,
    width:40,
    justifyContent:"center",
    alignItems:"center",
    marginTop: screenWidth * 0.05,
    zIndex: 10
  },
  textWrapper:{
    flex:2,
    width:"85%"
  },
  text:{
    fontSize: screenWidth * 0.04,
    fontWeight: 600,
    textAlign:"justify",
    lineHeight: screenWidth * 0.06,
    marginTop: screenWidth * 0.03,
    color:"#2B313D"
  },
  backgroundImg: {
    flex: 1,
    width:"100%",
    height:"100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Instructions;
