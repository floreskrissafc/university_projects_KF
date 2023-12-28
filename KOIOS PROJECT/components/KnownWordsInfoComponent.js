import { StyleSheet, Text, View, TouchableOpacity,
         Image, Dimensions, ImageBackground, Switch } from 'react-native';
import { insertScore } from '../database.js';
import React, { useState } from 'react';

const backgroundImg = '../assets/images/backgrounds/6.png';
const owlImg = '../assets/images/square_imgs/40.png';
const screenWidth = Dimensions.get("window").width;

export const KnownWordsInfoComponent = (props) => {

  const language = props.lang;

  const [switchText, setSwitchText] = useState("Unknown Word");

  const [switchVal, setSwitchVal] = useState(false);

  const toggleSwitch = (newVal) => {
    if ( newVal ){
      setSwitchText("Known Word");
    } else {
      setSwitchText("Unknown Word");
    }
    setSwitchVal(newVal);
  };

  return (
    <View style={styles.container}>

      <ImageBackground source={require(backgroundImg)} resizeMode="stretch" style={{width:"100%"}}>

        <View style={styles.contentWrapper}>

          <View style={styles.pageTitleWrapper}>

            <Text style={styles.pageTitleText}>Mark known words</Text>

          </View>

          <View style={styles.definitionWrapper}>

            <Text style={styles.infoText}>
              Remember that you can use the sliders next to the words to mark them as known.
            </Text>

          </View>

          <View style={styles.owlAndTextWrapper}>

            <View style={styles.owlWrapper}>

              <Image source={require(owlImg)} style={styles.owlImg} resizeMode="contain"/>

            </View>

            <View style={styles.formulaWrapper}>

              <Text style={[styles.infoText, {textAlign:"center"}]}>This way you won't see that word again in your sessions or reviews.</Text>

            </View>

          </View>

          <View style={styles.switchWrapper}>

            <Switch
              trackColor={{false: '#d14956', true: '#51b2b6'}}
              thumbColor={'white'}
              ios_backgroundColor={switchVal ? '#51b2b6' : '#d14956'}
              onValueChange={(newVal)=>toggleSwitch(newVal)}
              value={switchVal}
              style={styles.switch}
            />

          </View>

          <View style={styles.definitionWrapper}>

            <Text style={styles.infoText}>
              {switchText}
            </Text>

          </View>

          <View style={styles.buttonWrapper}>

            <TouchableOpacity style={styles.statsButton} onPress = {() => { props.onBackToStats(2)}}>

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
    width:"85%",
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
    lineHeight:25,
    color:"#3F3226"
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
    alignItems:"center",
    justifyContent:"center"
  },
  numeratorDenominatorWrapper:{
    flexDirection:"column",
  },
  owlImg:{
    width:screenWidth*0.5,
  },
  switchWrapper:{
    alignItems:"center"
  },
  switch:{
    transform: [{ scaleX: 2 }, { scaleY: 2 }],
    marginBottom:screenWidth*0.02
  },
  statsButton:{
    marginTop:screenWidth*0.1,
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
