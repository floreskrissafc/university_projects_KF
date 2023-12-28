import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View, SafeAreaView,
         ActivityIndicator, ImageBackground, ScrollView,
         Image, TouchableOpacity, Dimensions} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {levelDefinitions} from '../assets/dictionaries/levelDefinitionsEnglish.js';
import { getWordCountByLevels, countWordsByRevisions } from '../database.js';
import {ProgressChart} from "react-native-chart-kit";

const backgroundImg = '../assets/images/backgrounds/gameLevelsBackground.png';

const homeLogo = '../assets/images/square_imgs/home.png';

const screenWidth = Dimensions.get("window").width;

// These are the badges images that are shown instead of the Progress charts
// when the user completes a level
const levelImagePaths = {
  "18.png": require("../assets/images/square_imgs/18.png"),
  "19.png": require("../assets/images/square_imgs/19.png"),
  "20.png": require("../assets/images/square_imgs/20.png"),
  "22.png": require("../assets/images/square_imgs/22.png"),
  "23.png": require("../assets/images/square_imgs/23.png"),
  "24.png": require("../assets/images/square_imgs/24.png"),
};

const LongTextComponent = ({ text, maxLines }) => {
  const [showFullText, setShowFullText] = useState(false);
  // Function to toggle between full and limited text
  const toggleText = () => {
    setShowFullText(!showFullText);
  };
  return (
    <View style={styles.longTextContainer}>
      <Text
        style={styles.longText}
        numberOfLines={showFullText ? undefined : maxLines}
      >
        {text}
      </Text>
      {text.length > maxLines * 20 && ( // Approximate characters per line
        <TouchableOpacity onPress={toggleText}>
          <Text style={styles.readMore}>
            {showFullText ? 'Read Less ^' : 'Read More...'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const LevelComponent = ({ levelData, language, totalWordCounts, gameName }) => {

  const navigation = useNavigation();

  const { levelName, levelDescription, levelImgName } = levelData;

  const pathToImg = levelImagePaths[levelImgName];

  const totalWordCount = totalWordCounts[levelName];

  const [completedWordCount, setCompletedWordCount] = useState(0);

  const [studiedWordsCount, setStudiedWordsCount] = useState(0);

  const [completionPercentage, setCompletionPercentage] = useState(0);

  const tableName = gameName == "Learn English for CEFR" ? "English_Words":"Spanish_Words";

  const [dataForProgressChart, setDataForProgressChart] = useState([]);

  const goToGame = (lang, level, review) =>{
    navigation.replace('Game',{ language: lang, levelName:level, tableName:tableName, isReview: review});
  };

  useEffect(() => {
    const fetchWordCounts = async () => {
      try {
        const completedWordsAmount = await countWordsByRevisions(tableName, levelName, 4);

        setCompletedWordCount(completedWordsAmount);

        const completion = ((completedWordsAmount/totalWordCount)*100).toFixed(2);

        setCompletionPercentage(completion);

        setDataForProgressChart([completion / 100] );

        const studiedWordsAmount = await countWordsByRevisions(tableName, levelName, 1);

        setStudiedWordsCount(studiedWordsAmount);

      } catch (error) {
        console.error('Error fetching word counts:', error);
      }
    };
    fetchWordCounts();
  }, []);

  // example chartConfig object for the graph library
  // taken from https://github.com/indiespirit/react-native-chart-kit
  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#FFFFFF",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(25, 25, 112, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 1,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      dx: -5,
      fontSize: 12,
    }
  };
  return (
    <View style={styles.gameWrapper}>
      <View style={styles.levelWrapper}>
        <View style={styles.flagWrapper}>
          { completionPercentage == 100 ? (
            <Image source={pathToImg} style={styles.badgeLogo} resizeMode="contain" />) : (
              <View style={styles.progressChartWrapper}>
                <ProgressChart
                  data={dataForProgressChart}
                  width={screenWidth*0.25}
                  height={screenWidth*0.25}
                  strokeWidth={20}
                  radius={screenWidth*0.1}
                  chartConfig={chartConfig}
                  hideLegend={true}
                />
                <View style={styles.progressTextWrapper}>
                  <Text style={styles.progressLevelName}>{levelName}</Text>
                </View>
              </View>) }
        </View>
        <View style={styles.gameInfoWrapper}>
          <Text style={styles.levelTitleText}>{levelName} Level {completionPercentage == 100 ? "(COMPLETED)": ""}</Text>
          <LongTextComponent style={styles.levelInfoText} text={levelDescription} maxLines={3}/>
          <Text style={styles.completionText}>{completionPercentage}% complete</Text>
          <Text style={styles.completionText}>{studiedWordsCount} studied words from {totalWordCount}</Text>
        </View>
      </View>
      <View style={styles.buttonsWrapper}>
        <TouchableOpacity style={[styles.choiceButton, styles.startLevelButton]} onPress={()=> goToGame(language,levelName, false)}>
          <Text style={styles.choiceButtonText}>{studiedWordsCount == 0 ? "Start Level" : "Continue"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.choiceButton, styles.reviewLevelButton,{ opacity: studiedWordsCount === 0 ? 0.3 : 1 } ]} disabled={ studiedWordsCount == 0 ? true : false } onPress={()=> goToGame(language,levelName, true)}>
          <Text style={styles.choiceButtonText}>Review Level</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export function GameLevelsComponent() {

  const route = useRoute();

  const navigation = useNavigation();

  const { title, language} = route.params;

  const tableName = title == "Learn English for CEFR" ? 'English_Words':'Spanish_Words';

  const [wordCounts, setWordCounts] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWordCounts = async () => {
      try {
        const wordCountsData = await getWordCountByLevels(tableName);
        setWordCounts(wordCountsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching word counts:', error);
      }
    };
    fetchWordCounts();
  }, []);

  const pressHomeButton = ()=>{
    navigation.replace('Home',{});
  }

  return (
    <View style={styles.container}>

      <SafeAreaView style={styles.safeAreaContainer}>

        <ImageBackground source={require(backgroundImg)} resizeMode="stretch" style={styles.backgroundImg}>

        {isLoading ? (
            <ActivityIndicator size="large" color="#51b2b6" />
          ) : (
            <View style={styles.mainContent}>

              <View style={styles.headerBar}>

                <View style={styles.headerTitleWrapper}>

                  <Text style={styles.headerTitle}>{title}</Text>

                </View>

                <TouchableOpacity style={styles.homeButton} onPress={ pressHomeButton }>

                  <Image source={require(homeLogo)} style={styles.topLogos} resizeMode="contain"/>

                </TouchableOpacity>
              </View>
              <View style={styles.content}>
                <ScrollView style={styles.scrollViewContainer}>
                  {levelDefinitions.map((levelData, index) => (
                    <LevelComponent key={index} levelData={levelData} language={language} totalWordCounts={wordCounts} gameName={title}/>
                  ))}
                </ScrollView>
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
    backgroundColor: '#F3FCF9',
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
  mainContent:{
    width:"100%",
    height:"100%",
    alignItems:"center"
  },
  scrollViewContainer:{
    flex:1,
    width:"100%"
  },
  headerBar:{
    flex: 1,
    width:"100%",
    backgroundColor:"#757AAA",
    flexDirection:"row",
    paddingLeft:screenWidth*0.02,
    paddingRight:screenWidth*0.02
  },
  content:{
    flex:10,
    width:"95%",
    alignItems: 'center',
    marginTop:screenWidth*0.03,

  },
  headerTitleWrapper:{
    flex:4,
    alignItems:"flex-start",
    justifyContent:"center"
  },
  headerTitle:{
    textAlign:"center",
    color:"white",
    fontSize:screenWidth*0.05,
    fontWeight:900,
    marginLeft:screenWidth*0.05
  },
  homeButton:{
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  },
  topLogos:{
    maxWidth:"60%",
    maxHeight:"60%",
  },
  gameWrapper:{
    marginBottom:screenWidth*0.03,
    backgroundColor:"rgba(117,122,170,0.26)",
    width:"100%",
    justifyContent:"center",
    alignItems:"center",
    paddingTop:screenWidth*0.05,
    paddingBottom:screenWidth*0.05,
    borderRadius:screenWidth*0.05
  },
  levelWrapper:{
    flexDirection:"row",
    width:"91%",
    marginBottom:screenWidth*0.03,
  },
  flagWrapper:{
    justifyContent:"center",
    alignItems:"center",
  },
  gameInfoWrapper:{
    flex:1,
    marginLeft:screenWidth*0.04,
  },
  progressTextWrapper:{
    position:"absolute",
    top:0,
    left:screenWidth*0.081,
    height:"100%",
    justifyContent:"center"
  },
  progressChartWrapper:{
    position:"relative",
    justifyContent:"center",
    alignItems:"center"
  },
  progressLevelName:{
    alignSelf:"center",
    textAlign:"center",
    fontSize:screenWidth*0.07,
    fontWeight:900,
    color:"#757AAA"
  },
  buttonsWrapper:{
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    paddingLeft: screenWidth*0.04,
    paddingRight: screenWidth*0.04
  },
  choiceButton:{
    flex:1,
    width:screenWidth*0.4,
    padding:screenWidth*0.025,
    borderRadius:screenWidth*0.02,
    justifyContent:"center",
    alignItems:"center",
  },
  startLevelButton:{
    backgroundColor:"#51B2B6",
    marginRight:screenWidth*0.03,
    borderColor:"#88d1e8",
    borderWidth: 1
  },
  reviewLevelButton:{
    backgroundColor:"#40B9DF",
    borderColor:"#9ce8d1",
    borderWidth: 1
  },
  badgeLogo:{
    width:screenWidth*0.25,
    height:screenWidth*0.25,
  },
  levelTitleText:{
    fontSize:screenWidth*0.048,
    fontWeight:900,
    color:"#757aaa"
  },
  choiceButtonText:{
    color:"white",
    fontWeight:900,
    fontSize:screenWidth*0.04,
  },
  longTextContainer:{
    alignItems: 'flex-start',
    marginTop:screenWidth*0.02,
  },
  longText:{
    fontSize: screenWidth*0.032,
    textAlign:'justify',
    color:"#5e6574",
    fontWeight:500
  },
  readMore: {
    color: '#6583AA',
    fontSize: screenWidth*0.032,
  },
  completionText:{
    marginTop:screenWidth*0.03,
    fontSize:screenWidth*0.032,
    fontWeight: 700,
    color:"#5e6574"
  }
});
