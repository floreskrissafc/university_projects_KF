import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView,
         FlatList, Switch, ScrollView, Dimensions,
         Image, ImageBackground, TouchableOpacity} from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import {LineChart, PieChart} from "react-native-chart-kit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLast10Scores } from '../database.js';
import { updateRevisionsForWordsInTable,
         getRevisionsForWordsInTable,
         updateRevisionsBySwitchValue } from '../database.js';
import {AccuracyInfoComponent} from './AccuracyInfoComponent.js';
import {KnownWordsInfoComponent} from './KnownWordsInfoComponent.js';

const owlChartImg = '../assets/images/square_imgs/owlChartImg.png';
const statsBackgroundImg = '../assets/images/backgrounds/statsBackgroundImg.png';
const soundSymbol = '../assets/images/square_imgs/soundIcon.png'; //didn't have time to include sounds
const screenWidth = Dimensions.get("window").width;

export function StatsComponent(){

  const route = useRoute();

  const navigation = useNavigation();

  const { score, wordData, maxScore, tableName, language, level } = route.params;

  const wordsArray = Object.keys(wordData);

  const [wordsSwitchStatus, setWordsSwitchStatus] = useState({});

  // I need to set some values by default, if not the SVG library won't work
  const [scoresArray, setScoresArray] = useState([0,0,0,0,0,0,0,0,0,0]);

  const [containerWidth, setContainerWidth] = useState(screenWidth * 0.7);

  const getWordIndexMapping = () => {
    const mapping = {};
    let index = 0;
    for (const word in wordData) {
      mapping[word] = index;
      index++;
    }
    return mapping;
  }

  const updateWordRevisionsBySwitchValue = (wordsObj, lang) =>{
    updateRevisionsBySwitchValue(tableName,wordsObj);
  }

  const wordIndexMapping = getWordIndexMapping();

  const getStatusArray = () => {
    const statusArray = Object.keys(wordIndexMapping).map(() => false);
    return statusArray;
  };

  const [knownWord, setKnownWord] = useState([]);

  const [dataForPieChart, setDataForPieChart] = useState([]);

  const [accuracyScore, setAccuracyScore] = useState(0);

  const [layoverState, setLayoverState] = useState(false);

  const [accuracyInfoVisibility, setAccuracyInfoVisibility] = useState(false);

  const [knownWordsInfoVisibility, setKnownWordsInfoVisibility] = useState(false);

  const toggleSwitch = (newVal, word) => {
    let index = wordIndexMapping[word.word];
    let updatedKnownWord = [...knownWord];
    updatedKnownWord[index] = newVal;
    setKnownWord(updatedKnownWord);
    let updatedSwitchArray = { ...wordsSwitchStatus };
    updatedSwitchArray[word.word] = newVal;
    setWordsSwitchStatus(updatedSwitchArray);
  };

  const data = {
    datasets: [
      {
        data: scoresArray,
        color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`, // dot color in line graph
        strokeWidth: 2,
        withDots: true,
      }
    ],
  };

  // example chartConfig object for the graph library
  // taken from https://github.com/indiespirit/react-native-chart-kit
  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#FFFFFF",
    backgroundGradientToOpacity: 1,
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

  // Function to get words with a specific status, either 0, 1 or 2
  // 0 means correct, 1 means skipped, 2 means incorrect
  const getWordsByStatus = (status) => {
    return Object.entries(wordData).filter(([, data]) => data.status === status);
  };

  const getDataForPieChart = () =>{
    let correctAmount = getWordsByStatus(0).length;
    let skippedAmount = getWordsByStatus(1).length;
    let incorrectAmount = getWordsByStatus(2).length;
    let data = [];
    if ( correctAmount == 0 && skippedAmount == 0 && incorrectAmount == 0){
      data = [{name:"Correct", quantity: 0, color:"#00798c"},
              {name:"Skipped", quantity: 0, color:"#edae49"},
              {name:"Incorrect", quantity: 1, color:"#d14956"}];
    }
    else {
      data = [{name:"Correct", quantity: correctAmount, color:"#00798c"},
              {name:"Skipped", quantity: skippedAmount, color:"#edae49"},
              {name:"Incorrect", quantity: incorrectAmount, color:"#d14956"}];
    }
    return data;
  }

  useEffect(() => {

    const initialStatusArray = getStatusArray();

    const initialWordsSwitchStatus = Object.fromEntries(wordsArray.map(word => [word, false]));

    const dataPie = getDataForPieChart();

    const totalCount = dataPie[0].quantity + dataPie[1].quantity + dataPie[2].quantity;

    const correctCount = dataPie[0].quantity;

    const accuracy = ((correctCount / totalCount) * 100).toFixed(2);

    setKnownWord(initialStatusArray);

    setWordsSwitchStatus(initialWordsSwitchStatus);

    setDataForPieChart(dataPie);

    setAccuracyScore(accuracy);

    // Fetch the last 10 scores from the database
    const courseName = tableName == "English_Words" ? "English" :"Spanish";

    // Get the last ten scores (or less) that the user achieved for this game
    getLast10Scores(courseName)
      .then((scores) => {
        setScoresArray(scores);
      })
      .catch((error) => {
        console.error('Error fetching scores:', error);
      });
  }, []);

  // Function to render a single word+definition seen during the game
  // for the Studied Words section
  const renderItem = (item, index) => {

    const currentWordIndex = wordIndexMapping[item[0]];

    const [word, data] = item;

    return (

      <View key={index} style={styles.wordDefSwitchWrapper}>

        <View style={styles.wordDefIconWrapper}>

          <View style={styles.wordDefWrapper}>

            <Text style={styles.studiedWord}>{word}</Text>

            {/*
              // This is the code for the sound element that is missing from my project
            <TouchableOpacity style={styles.soundSymbol}>

              <Image source={require(soundSymbol)} resizeMode="contain" style={styles.soundIcon}/>

            </TouchableOpacity>
            */}

          </View>

          <Text style={styles.wordDefinition}>{data.definition}</Text>

        </View>

        <View style={styles.switchWrapper}>

          <Switch
            trackColor={{false: '#d14956', true: '#51b2b6'}}
            thumbColor={'white'}
            ios_backgroundColor={knownWord[currentWordIndex] ? '#51b2b6' : '#d14956'}
            onValueChange={(newVal)=>toggleSwitch(newVal, {word})}
            value={knownWord[currentWordIndex]}
            style={styles.switch}
          />
        </View>

      </View>
    );
  };

  const backToStats = (identifier) =>{
    setLayoverState(false);

    if ( identifier == 1){

      setAccuracyInfoVisibility(!accuracyInfoVisibility);

    } else {

      setKnownWordsInfoVisibility(!knownWordsInfoVisibility);
    }
  };

  const saveSwitchValues = () => {
    // If a word was marked as known, this updates the corresponding database table
    updateWordRevisionsBySwitchValue(wordsSwitchStatus, language);
  };

  const pressHomeButton = () =>{
    saveSwitchValues();
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    navigation.dispatch(resetAction);
  };

  const pressPlayAgainButton = () =>{
    saveSwitchValues();
    navigation.replace('Game',{ language: language, levelName:level, tableName: tableName, isReview: false});
  };

  return (

    <View style={styles.container}>

      <View style={[styles.layoverContainer, layoverState == true ? {zIndex: 3} : {zIndex: -2, opacity: 0} ]}>
          {accuracyInfoVisibility ? (<AccuracyInfoComponent lang={language} onBackToStats={backToStats}/>) : (<KnownWordsInfoComponent lang={language} onBackToStats={backToStats}/>)}
      </View>

      <SafeAreaView style={styles.safeAreaContainer}>

        <ImageBackground source={require(statsBackgroundImg)} resizeMode="stretch" style={styles.backgroundImg}>

          <ScrollView style={styles.scrollViewContainer}>

            {/* Code for Line Chart */}
            <View style={styles.sectionContainer}>

              <View style={styles.sectionTitleWrapper}>

                <Text style={styles.sectionTitle}>Scores</Text>

              </View>

              <View style={styles.scoresWrapper}>

                <View style={{flexDirection:"row", marginBottom:"2%"}}>

                  <Text style={styles.scoreText}>Score: </Text>

                  <Text style={[styles.scoreText,{color:"#696969"}]}>{score}</Text>

                </View>

                <View style={{flexDirection:"row"}}>

                  <Text style={styles.scoreText}>Highest Score: </Text>

                  <Text style={[styles.scoreText,{color:"red"}]}>{maxScore}</Text>
                </View>

              </View>

              <View style={styles.chartWrapper}>

                <View style={styles.lineChartContainer}
                      onLayout={(event) => {
                        // Capture the width of the container when it's laid out
                        const { width } = event.nativeEvent.layout;
                        setContainerWidth(width);
                      }}
                >
                  <LineChart
                    data={data}
                    width = {containerWidth}
                    height={containerWidth*0.95}
                    chartConfig={chartConfig}
                    withInnerLines={true}
                    withOuterLines={true}
                    fromZero={true}
                    yAxisInterval={500}
                    withHorizontalLines={true}
                    getDotColor={(dataPoint, dataPointIndex) => {
                      // Check if it's the last data point
                      if (dataPointIndex === data.datasets[0].data.length - 1) {
                        // Return a different color for the last point
                        return 'red';
                      }
                      // Return the default color for other points
                      return `rgba(106, 90, 205, 1)`;
                    }}
                    getDotProps={(value, index) => ({
                      r: index === scoresArray.length - 1 ? 6 : 4,
                      strokeWidth: index === scoresArray.length - 1 ? "4" : "0",
                      stroke: "#ffa726"
                    })}
                    style={styles.lineChartStyle}
                  />
                </View>

                <View style={styles.lineChartOwlContainer}>

                  <View style={{width:"100%", height: "100%"}}>

                    <View style={styles.chartTextWrapper}>

                      <Text style={styles.owlText}>Today you are here</Text>

                    </View>

                    <View style={styles.owlImgWrapper}>

                      <Image style={styles.owlImg} source={require(owlChartImg)} resizeMode="center"/>

                    </View>

                    <View style={styles.chartTextWrapper}>

                      <Text style={styles.owlText}></Text>

                    </View>

                  </View>

                </View>

              </View>

            </View>

            {/* Code for Pie Chart */}
            <View style={styles.sectionContainer}>
              <View style={[styles.sectionTitleWrapper,styles.sectionTitlePlusQuestionMarkWrapper]}>
                <Text style={[styles.sectionTitle, styles.sectionTitleAndQuestionMark]}>Accuracy</Text>
                <TouchableOpacity style={styles.questionMarkButton} onPress={()=> { setLayoverState(true);
                                                                                    setAccuracyInfoVisibility(true);}}>
                  <Text style={styles.questionMark}>?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pieChartSectionWrapper}>
                <View style={styles.pieChartWrapper}>
                  <PieChart
                    data={dataForPieChart}
                    width={containerWidth*0.8}
                    height={containerWidth*0.8}
                    chartConfig={chartConfig}
                    accessor={"quantity"}
                    backgroundColor={"transparent"}
                    absolute={true}
                    hasLegend={false}
                    avoidFalseZero={true}
                    center={[containerWidth*0.20, 0]}
                    />
                </View>
                <View style={{flex:2}}>
                  <View style={styles.pieChartLegendWrapper}>
                    <View style={styles.pieChartLegendItem}>
                      <View style={[styles.legendColorSymbol,{ backgroundColor:"#00798c" }]}></View>
                      <View style={styles.legendTextWrapper}><Text style={styles.legendText}>Correct</Text></View>
                    </View>

                    <View style={styles.pieChartLegendItem}>
                      <View style={ [styles.legendColorSymbol,{ backgroundColor:"#d14956" }]}></View>
                      <View style={styles.legendTextWrapper}><Text style={styles.legendText}>Incorrect</Text></View>
                    </View>

                    <View style={[styles.pieChartLegendItem,{marginBottom:0}]}>
                      <View style={[styles.legendColorSymbol,{ backgroundColor:"#edae49" }]}></View>
                      <View style={styles.legendTextWrapper}><Text style={styles.legendText}>Skipped</Text></View>
                    </View>

                  </View>
                </View>
              </View>

              <View style={styles.accuracyScoreWrapper}>
                <Text style={styles.accuracyScoreText}>Accuracy score = { accuracyScore } %</Text>
              </View>
            </View>

            {/* Code for Words Studied during game */}
            <View style={[styles.sectionContainer, {paddingBottom:"20%"}]}>
              <View style={[styles.sectionTitleWrapper,styles.sectionTitlePlusQuestionMarkWrapper]}>
                <Text style={[styles.sectionTitle, styles.sectionTitleAndQuestionMark]}>Words Studied</Text>
                <TouchableOpacity style={styles.questionMarkButton} onPress={() =>{ setKnownWordsInfoVisibility(true);
                                                                                    setLayoverState(true);}}>
                  <Text style={styles.questionMark}>?</Text>
                </TouchableOpacity>
              </View>

              {/* Section for Correct words */}
              <View style={styles.wordSectionContainer}>
                <Text style={styles.wordStatusTitle}>Correct</Text>
                {getWordsByStatus(0).length === 0 ? (
                  <Text style={styles.noAnswersForSection}>No correct answers for this game.</Text>
                ) : (
                  getWordsByStatus(0).map((item, index) => renderItem(item, index))
                )}
              </View>

              {/* Section for Skipped words */}
              <View style={styles.wordSectionContainer}>
                <Text style={styles.wordStatusTitle}>Skipped</Text>
                {getWordsByStatus(1).length === 0 ? (
                  <Text style={styles.noAnswersForSection}>No skipped answers for this game.</Text>
                ) : (
                  getWordsByStatus(1).map((item, index) => renderItem(item, index))
                )}
              </View>

              {/* Section for Incorrect words */}
              <View style={styles.wordSectionContainer}>
                <Text style={styles.wordStatusTitle}>Incorrect</Text>
                {getWordsByStatus(2).length === 0 ? (
                  <Text style={styles.noAnswersForSection}>No incorrect answers for this game.</Text>
                ) : (
                  getWordsByStatus(2).map((item, index) => renderItem(item, index))
                )}
              </View>
            </View>
          </ScrollView>

          {/* Code for buttons at the bottom of the screen */}
          <View style={styles.bottomButtonsContainer}>

            <TouchableOpacity style={[styles.bottomButton, styles.homeButton]} onPress={ pressHomeButton }>

              <Text style={styles.bottonButtonText}>Home</Text>

            </TouchableOpacity>

            <TouchableOpacity style={[styles.bottomButton, styles.playAgainButton]} onPress={ pressPlayAgainButton }>

              <Text style={styles.bottonButtonText}>Play Again</Text>

            </TouchableOpacity>

          </View>

        </ImageBackground>

      </SafeAreaView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:"100%",
    height:"100%",
    alignItems: 'center',
    justifyContent: 'center'
  },
  safeAreaContainer :{
    flex: 1,
    backgroundColor: '#f9eef1',
    alignItems: 'center',
    justifyContent: 'center',
    width:'100%',
    height:'100%',
    paddingTop: Platform.OS === 'android' ? 37 : 0
  },
  layoverContainer:{
    flex:1,
    height:"100%",
    width:"100%",
    position:"absolute",
    top:0,
    left:0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImg: {
    flex: 1,
    width:"100%",
    height:"100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContainer:{
    flex:1,
    width:"95%"
  },
  sectionContainer:{
    marginBottom: "2%",
    backgroundColor:"rgba(117,122,170,0.2)",
    borderRadius:20,
    paddingBottom:"2%"
  },
  sectionTitleWrapper:{
    backgroundColor:"#757AAA",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  sectionTitle:{
    alignSelf:"center",
    color:"white",
    fontWeight: 900,
    fontSize: 23,
    paddingTop: "2%",
    paddingBottom:"2%"
  },
  lineChartStyle:{
    backgroundColor:"white",
    alignSelf: 'center',
    paddingTop: 20,
    width:"100%"
  },
  scoresWrapper:{
    width:"90%",
    alignSelf:"center",
    marginBottom:"2%",
    marginTop:"4%"
  },
  scoreText:{
    fontWeight:"900",
    fontSize:15
  },
  seenWordsContainer:{
    flex:1,
    backgroundColor:"lightgray"
  },
  wordSectionContainer: {
    padding: 20,
  },
  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  chartWrapper: {
    flex:1,
    flexDirection:'row',
    width:"90%",
    alignSelf:"center",
    marginBottom: screenWidth * 0.04,
    marginTop: screenWidth * 0.02
  },
  lineChartContainer: {
    flex: 3,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  lineChartOwlContainer:{
    backgroundColor:"white",
    flex:1,
    flexDirection:"column",
  },
  chartTextWrapper:{
    flex:2,
    justifyContent:"flex-end"
  },
  owlImgWrapper:{
    flex:7,
  },
  owlText:{
    width:"95%",
    fontSize:15,
    textAlign:"center"
  },
  owlImg: {
    flex:1,
    maxWidth: '100%',
    height: "auto",
  },
  wordStatusTitle:{
    fontWeight: 900,
    fontSize: 18
  },
  noAnswersForSection:{
    marginTop:"5%",
    color: "#525151",
    fontWeight:500
  },
  wordDefSwitchWrapper:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    marginTop: "6%"
  },
  studiedWord: {
    fontSize: 16,
    fontWeight: 800,
    color: "#525151",
    marginRight: "5%",
    alignSelf:"center"
  },
  soundSymbol: {
    width: screenWidth * 0.05,
    height:screenWidth * 0.05,
  },
  soundIcon: {
    maxWidth:"100%",
    maxHeight: "100%"
  },
  wordDefinition: {
    color: "#5c5c5c",
    fontWeight: 500
  },
  switchWrapper: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center",
    marginLeft:"2%"
  },
  wordDefWrapper: {
    flexDirection:"row",
    marginBottom:"2%"
  },
  wordDefIconWrapper: {
    flex: 6,
    flexDirection:"column"
  },
  questionMark: {
    color:"#757AAA",
    fontWeight: 900,
    fontSize: 20,
    textAlign:"center"
  },
  questionMarkButton: {
    backgroundColor:"white",
    position:"absolute",
    top:"20%",
    right:15,
    height: "60%",
    aspectRatio:1,
    borderRadius:50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionTitleAndQuestionMark: {
    flex:1,
    textAlign:"center"
  },
  sectionTitlePlusQuestionMarkWrapper: {
    flex: 1,
    flexDirection:"row",
    alignItems: 'center'
  },
  bottomButtonsContainer:{
    position: 'absolute',
    bottom:"1%",
    justifyContent:"center",
    alignItems:"center",
    flexDirection:"row",
    width:"95%",
    height:"7%"
  },
  bottomButton:{
    flex:1,
    height:"100%",
    justifyContent:"center",
    borderRadius:10
  },
  homeButton:{
    backgroundColor:"#757aaa",
    marginRight:"2%"
  },
  bottonButtonText:{
    color:'white',
    fontSize:20,
    fontWeight:900,
    textAlign:"center",
  },
  playAgainButton:{
    backgroundColor:"#51b2b6"
  },
  pieChartSectionWrapper:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center"
  },
  pieChartWrapper:{
    flex:3,
    alignItems:"center",
    justifyContent:"center"
  },
  pieChartLegendWrapper:{
    justifyContent:"center",
    alignItems:"flex-start",
    backgroundColor:"rgba(255,255,255,0.5)",
    maxWidth:"80%",
    paddingLeft:"10%",
    paddingTop:"10%",
    paddingBottom:"10%"
  },
  pieChartLegendItem:{
    flexDirection:"row",
    marginBottom:"10%"
  },
  legendColorSymbol:{
    width: "15%",
    height: "100%",
    borderRadius:5
  },
  legendText:{
    fontSize:15,
    fontWeight:600,
    color:"#5e6574"
  },
  legendTextWrapper:{
    marginLeft: "5%"
  },
  accuracyScoreWrapper:{
    alignSelf:"center",
    backgroundColor:"rgba(161,236,255,0.4)",
    padding:"3%",
    borderRadius:10,
    marginBottom:"3%"
  },
  accuracyScoreText:{
    color:"#5e6574",
    fontWeight:600,
  },
  switch:{
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});
