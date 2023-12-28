import { StyleSheet, Text, View, TouchableOpacity,Image, Dimensions, ImageBackground } from 'react-native';
import { insertScore } from '../database.js';

const backgroundImg = '../assets/images/backgrounds/6.png';
const owlImg = '../assets/images/square_imgs/28.png';
const screenWidth = Dimensions.get("window").width;

export const AccuracyInfoComponent = (props) => {
  const language = props.lang;
  return (
    <View style={styles.container}>
      <ImageBackground source={require(backgroundImg)} resizeMode="stretch" style={{width:"100%"}}>
        <View style={styles.contentWrapper}>

          <View style={styles.pageTitleWrapper}>
            <Text style={styles.pageTitleText}>How is accuracy calculated?</Text>
          </View>

          <View style={styles.definitionWrapper}>
            <Text style={styles.infoText}>
              Accuracy is calculated as the number of correct responses divided by the amount of total responses:
            </Text>
          </View>

          <View style={styles.owlAndTextWrapper}>
            <View style={styles.owlWrapper}>
              <Image source={require(owlImg)} style={styles.owlImg} resizeMode="contain"/>
            </View>
            <View style={styles.formulaWrapper}>
              <View>
                <Text style={styles.formulaText}>acc = </Text>
              </View>
              <View style={styles.numeratorDenominatorWrapper}>
                <View style={{borderBottomColor:"black",borderBottomWidth:1}}>
                  <Text style={[styles.formulaText, ]}> # Correct Answers</Text>
                </View>
                <Text style={styles.formulaText}> # Total Answers</Text>
              </View>
            </View>
          </View>

          <View style={styles.definitionWrapper}>
            <Text style={styles.infoText}>
              The total answers include the correct, incorrect and skipped answers you provide during the game.
            </Text>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.statsButton} onPress = {() => { props.onBackToStats(1)}}>
              <Text style={styles.buttonText}>Back to Stats</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    width:"100%",
    height:"100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper:{
    width:"90%",
    height:"100%",
    alignItems:"center",
    justifyContent:"center",
    alignSelf:"center"
  },
  pageTitleText:{
    fontSize: screenWidth*0.075,
    textAlign:"center",
    fontWeight:900,
    color:"#757AAA",
    marginBottom: screenWidth*0.03
  },
  infoText:{
    fontSize:screenWidth*0.04,
    fontWeight:700,
    textAlign:"justify",
    padding: screenWidth*0.05,
    lineHeight:25
  },
  owlAndTextWrapper:{
    flexDirection:"row",
    width:"100%",
  },
  owlWrapper:{
    flex:1
  },
  formulaWrapper:{
    flex:1,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center"

  },
  numeratorDenominatorWrapper:{
    flexDirection:"column",
  },
  formulaText:{
    fontSize: screenWidth*0.04
  },
  owlImg:{
    width:screenWidth*0.5,
  },
  buttonWrapper:{
    //
  },
  statsButton:{
    marginTop:screenWidth*0.05,
    backgroundColor:"#757AAA",
    paddingTop:screenWidth*0.03,
    paddingBottom:screenWidth*0.03,
    paddingLeft:screenWidth*0.05,
    paddingRight:screenWidth*0.05,
    borderRadius: screenWidth*0.03
  },
  buttonText:{
    fontSize:screenWidth*0.07,
    fontWeight:800,
    color:"white"
  }


})
