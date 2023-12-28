import Slideshow from './Slideshow.js';
import { StyleSheet, Text, View, SafeAreaView, ImageBackground, Platform, StatusBar } from 'react-native';
import React, {  useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const InstructionScreenComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/game_background.jpeg')}
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
          <Slideshow navigation = {navigation} containerStyle={ styles.slides } overlay={true} height={500}
            dataSource={[
              { url:require('../assets/images/1.png'),
                title: "Game's Goal",
                caption:"You will be given definitions for words, you must provide a word that fits that definition.\n\nTry to match as many words as you can before the time runs out!" },

              { url:require('../assets/images/2.png'),
                title: "Pausing and Restarting the Game",
                caption:"On the top left you can see the Pause button, press it and the game will be paused."},

              { url:require('../assets/images/5.png'),
                title: "Pausing and Restarting the Game",
                caption:"Once you pause the game, you can Resume it or you can press the Restart button to start a new game. You can also access the game instructions if you need them."},

              { url:require('../assets/images/3.png'),
                title: "Timer",
                caption:"The timer in the top right corner will tell you how much time there is left in the game.\n\nOnce the timer reaches 5 seconds a ticking sound will let you know time has almost run out." },

              { url:require('../assets/images/4.png'),
                title: "Matched words",
                caption:"Every time you correctly guess a word, the counter on the top center of the game with be updated to show how many words you have matched in the game." },

              { url:require('../assets/images/6.png'),
                title: "Stats Screen",
                caption:"Once you finish the game, you can see your results in the Stats Screen. Here you can see your overall highest score and your current score in the top section."},

              { url:require('../assets/images/7.png'),
                title: "Stats Screen",
                caption:"Scroll down in the Stats Screen and you will be able to see which words you matched, which you missed and the ones you skipped, along with their definitions."},

              { url:require('../assets/images/good_luck.png'),
                title: "Good Luck"},
          ]}/>
        </SafeAreaView>
      </ImageBackground>
    </View>


  )
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slides:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight + 5 : 0,
  },
  backgroundImg: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  safeView: {
    flex: 1,
  }
});

export default InstructionScreenComponent;
