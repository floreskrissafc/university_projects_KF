
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, Text, View,
        SafeAreaView, ImageBackground, Image,
        TouchableOpacity, Dimensions} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';

const backgroundImg = '../assets/images/backgrounds/yourGamesBackground.png';

const usaFlagImg = '../assets/images/square_imgs/usa.png';

const spainFlagImg = '../assets/images/square_imgs/spain.png';

const homeLogo = '../assets/images/square_imgs/home.png';

const screenWidth = Dimensions.get("window").width;


export function YourGamesComponent() {

  const navigation = useNavigation();

  let title1 = "Learn Spanish for CEFR";

  let title2 = "Learn English for CEFR";

  let language = "English";

  function goToLevels(gameTitle){
    // function called when users click the Choose Level buttons
    navigation.navigate('GameLevels', {language: language, title: gameTitle});
  }

  const homeLogoPress = () =>{
    navigation.replace('Home',{language:'English'});
  };

  return (
    <View style={styles.container}>

      <SafeAreaView style={styles.safeAreaContainer}>

        <ImageBackground source={require(backgroundImg)} resizeMode="stretch" style={styles.backgroundImg}>

          <View style={styles.headerBar}>

            <View style={styles.headerTitleWrapper}>

              <Text style={styles.headerTitle}>Your Games</Text>

            </View>

            <TouchableOpacity style={styles.userButton} onPress={homeLogoPress}>

              <Image source={require(homeLogo)} style={styles.topLogos} resizeMode="contain"/>

            </TouchableOpacity>

          </View>

          <View style={styles.content}>

            <View style={styles.gameWrapper}>

              <View style={styles.flagWrapper}>

                <Image source={require(spainFlagImg)} style={styles.flagLogo} resizeMode="contain"/>

              </View>

              <View style={styles.gameTitleWrapper}>

                <Text style={styles.gameTitleText}>{title1}</Text>

              </View>

              <TouchableOpacity style={[styles.choiceButton, {backgroundColor:"#9ce8d1"}]} onPress={()=>goToLevels(title1)}>

                <Text style={styles.choiceButtonText}>Choose Level</Text>

              </TouchableOpacity>

            </View>

            <View style={styles.gameWrapper}>

              <View style={styles.flagWrapper}>

                <Image source={require(usaFlagImg)} style={styles.flagLogo} resizeMode="contain"/>

              </View>

              <View style={styles.gameTitleWrapper}>

                <Text style={styles.gameTitleText}>{title2}</Text>

              </View>

              <TouchableOpacity style={[styles.choiceButton, {backgroundColor:"#9ce8d1"}]}
                                        onPress={()=>goToLevels(title2)}>

                <Text style={styles.choiceButtonText}>Choose Level</Text>

              </TouchableOpacity>

            </View>

            <View style={{flex:1}}></View>

          </View>

        </ImageBackground>

      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFF7',
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
  headerBar:{
    flex: 1,
    width:"100%",
    backgroundColor:"#757aaa",
    flexDirection:"row",
    paddingLeft: screenWidth * 0.02,
    paddingRight: screenWidth * 0.02
  },
  content:{
    flex:10,
    width:"85%",
    alignItems: 'center',
    marginTop: screenWidth * 0.05,
  },
  headerTitleWrapper:{
    flex:4,
    alignItems:"flex-start",
    justifyContent:"center"
  },
  headerTitle:{
    textAlign: "center",
    color: "white",
    fontSize: screenWidth * 0.065,
    fontWeight: 900,
    marginLeft:screenWidth * 0.05
  },
  userButton:{
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  },
  topLogos:{
    maxWidth:"60%",
    maxHeight:"60%",
  },
  gameWrapper:{
    flex: 2.5,
    marginBottom: screenWidth * 0.05,
    backgroundColor:"rgba(214,214,232,0.7)",
    width:"100%",
    justifyContent:"center",
    alignItems:"center",
    paddingTop: screenWidth * 0.05,
    paddingBottom: screenWidth * 0.05,
    borderRadius: screenWidth * 0.05
  },
  flagWrapper:{
    marginBottom: screenWidth * 0.03,
    flex:1.7
  },
  gameTitleWrapper:{
    paddingBottom: screenWidth * 0.01,
    flex: 1,
    justifyContent:"center",
  },
  choiceButton:{
    width: screenWidth * 0.6,
    borderRadius: screenWidth * 0.03,
    justifyContent:"center",
    alignItems:"center",
    flex: 1
  },
  flagLogo:{
    maxWidth:"100%",
    maxHeight:"100%"
  },
  gameTitleText:{
    fontSize: screenWidth * 0.048,
    fontWeight: 900,
    color:"#757aaa"
  },
  choiceButtonText:{
    color:"white",
    fontWeight:900,
    fontSize: screenWidth * 0.045,

  },
})
