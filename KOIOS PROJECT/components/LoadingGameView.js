import { StyleSheet, SafeAreaView, ActivityIndicator, ImageBackground } from 'react-native';

const gameBackgroundImg = '../assets/images/backgrounds/game.png';

export const LoadingGameView = () => {
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ImageBackground source={require(gameBackgroundImg)} resizeMode="stretch" style={styles.backgroundImg}>
        <ActivityIndicator size="large" color="#51b2b6" />
      </ImageBackground>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  safeAreaContainer :{
    flex: 1,
    backgroundColor: '#cfe1de',
    alignItems: 'center',
    justifyContent: 'center',
    width:'100%',
    height:'100%',
    paddingTop: Platform.OS === 'android' ? 35 : 0
  },
  backgroundImg: {
    flex: 1,
    width:"100%",
    height:"100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
});
