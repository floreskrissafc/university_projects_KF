import React, {useRef} from 'react';
import {StatusBar, ScrollView, Text, StyleSheet,
View, SafeAreaView, TouchableOpacity, Dimensions, Platform} from 'react-native';
import {LineChart,PieChart} from "react-native-chart-kit";
import { StackActions } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
/* --------------- START OF HELPER FUNCTIONS FOR THIS SCREEN ---------------*/
function separateResults(gameData){
  // gameData is a list that contains objects, each object has a property
  // 'match'. This function returns 3 lists, one for every posible match
  // state (matched, unmatched and skipped). This data is passed from the
  // gameScreen
  let matched = [];
  let unmatched = [];
  let skipped = [];
  for (let i = 0; i < gameData.length; i++) {
    if ( gameData[i]["match"] == "matched"){
      matched.push(gameData[i]);
    } else if ( gameData[i]["match"] == "skipped" ){
      skipped.push(gameData[i]);
    } else {
      unmatched.push(gameData[i]);
    }
  }
  return [matched, unmatched, skipped];
}

function getAllDataSize(allData){
  // Function to return the total number of words that
  // were shown in the game (matched + unmatched + skipped)
  let totalQuestions = 0;
  for (let i = 0; i < allData.length; i++) {
    totalQuestions += allData[i].length
  }
  return totalQuestions;
}
/* --------------- END OF HELPER FUNCTIONS FOR THIS SCREEN ---------------*/

const StatsScreenComponent = (props) => {
  /* --------------- START OF DEFINITION OF STATE VARIABLES FOR COMPONENT ---------------*/
  let parameters = props.route.params;
  let navigation = props.navigation;
  // get data passed from the GameScreen component
  let data = parameters["gameData"];
  // get the list of the last ten scores of the game
  let scoresList = parameters["scoreList"]["scoreList"]["current"];
  // get the highest score achieved in the game
  let highestScore = parameters["highestScore"]["highestScoreAchieved"]["current"];
  // get the score the user achieved during the game
  let currentScore = parameters["currentScore"]["currentScore"];

  const gameData = useRef(data);
  let results = useRef(separateResults(gameData.current.gameData));
  let allDataSize = getAllDataSize(results.current);

  // calculate the accuracy achieved during the game
  const accuracy = useRef((results.current[0].length * 100 / allDataSize).toFixed(2) );

  // define the chartConf object that is needed to show the graphs in this component
  const chartConfig = {
    backgroundGradientFrom: "#002D62",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#002D62",
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0
  };

  // Data to be used to draw a Pie chart showing the percentage of matched,
  // unmatched and skipped questions
  let pieChartData = [
    {name:"Matched",
     percentage: results.current[0].length,
     color:"#00F516",
     legendFontColor:"white",
     legendFontSize:15
    },
    {name:"Unmatched",
     percentage: results.current[1].length,
     color:"#F5B273",
     legendFontColor:"white",
     legendFontSize:15
    },
    {name:"Skipped",
     percentage: results.current[2].length,
     color:"#B69FF5",
     legendFontColor:"white",
     legendFontSize:15
     }
  ]

  // Data to be shown in the Scores graph shown in the first section of the component
  const scoresData = {  labels: [],
                        datasets: [
                          {
                            data: scoresList,
                            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
                            strokeWidth: 7 // optional
                          }
                        ]
  };
  /* --------------- END OF DEFINITION OF STATE VARIABLES FOR COMPONENT ---------------*/

  return (
  <View style={ styles.container}>
    <SafeAreaView style={styles.safeView}>
      <ScrollView style={styles.reportContainer}>

        <View style={styles.matchedWords, styles.reportContent}>
          <Text style={styles.reportTitle} >Game Scores</Text>
          <Text style={styles.score}>Highest Score: <Text style={{color:"yellow"}}>{highestScore}</Text></Text>
          <Text style={styles.score}>Current Score: <Text style={{color:"yellow"}}>{currentScore}</Text></Text>
          <View style={[styles.chartContainer, {paddingRight:10}]}>
            <LineChart
              data={scoresData}
              width={windowWidth*0.95}
              height={220}
              chartConfig={chartConfig}
              style={{flex:1}}
            />
          </View>
        </View>

        <View style={styles.matchedWords, styles.reportContent}>
          <Text style={styles.reportTitle} >Game Accuracy</Text>
          <View style={[styles.chartContainer, {paddingRight:10}]}>
            <PieChart data={pieChartData} width={windowWidth*0.95} height={200}
                    chartConfig={chartConfig} accessor={"percentage"}
                    paddingLeft={"15"} avoidFalseZero={true} paddingRight={"0"}
                    center={[10, 0]} style={styles.pieChart}  />
          </View>
          <Text style={styles.accuracy}>You got {accuracy.current}% of answers correct</Text>
        </View>

        <View style={[styles.matchedWords,styles.reportContent]}>
          <Text style={styles.reportTitle}>Game Report</Text>
          <View style={ styles.reportSection}>
            <Text style={[styles.reportSectionTitle, {color:"lightgreen"}]}>Correct</Text>

            { results.current[0].map((obj,i)=> (
              <View key={i} style={styles.wordDefContainer}>
                <Text style={styles.word}>{obj.word}</Text>
                <Text style={styles.definition}>{obj.def}</Text>
              </View>
            ))}

          </View>
          <View style={ styles.reportSection}>
            <Text style={[styles.reportSectionTitle, {color:"red"}]}>Incorrect</Text>
            { results.current[1].map((obj,i)=> (
              <View key={i} style={styles.wordDefContainer}>
                <Text style={styles.word}>{obj.word}</Text>
                <Text style={styles.definition}>{obj.def}</Text>
              </View>
            ))}

          </View>
          <View style={ styles.reportSection}>
            <Text style={[styles.reportSectionTitle, {color:"lightblue"}]}>Skipped</Text>

            { results.current[2].map((obj,i)=> (
              <View key={i} style={styles.wordDefContainer}>
                <Text style={styles.word}>{obj.word}</Text>
                <Text style={styles.definition}>{obj.def}</Text>
              </View>
            ))}

          </View>

        </View>

      </ScrollView>
      <View style={ styles.buttonRow }>
        <TouchableOpacity style={[styles.button, {marginLeft:10, marginRight:10}]}
                          onPress={()=>{
                            navigation.push('Instructions',{});
                          }}>
          <Text style={styles.buttonText}>Instructions</Text>
        </TouchableOpacity >
        <TouchableOpacity style={[styles.button, {marginRight:10}]}
                          onPress={() => navigation.dispatch( StackActions.replace('Game', {}))}>
          <Text style={styles.buttonText}>Play again</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>


  </View>
)};
const styles = StyleSheet.create({
  pieChart:{
    flex:1
  },
  chartContainer:{
    flex:1,
    alignItems:"center",
  },
  accuracy:{
    color:"white",
    fontSize: 16,
    textAlign:"center",
    paddingTop:"5%",
    paddingBottom:"5%"
  },
  score:{
    color:"white",
    alignSelf:"flex-start",
    paddingLeft:"5%",
    fontSize:15,
    marginBottom:"5%",
    fontWeight:'800'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1
  },
  safeView: {
    width:"100%",
    height:"100%",
    backgroundColor:"#5072A7",
    paddingTop: Platform.OS === "android"? StatusBar.currentHeight : 0,
    alignItems: 'center',
  },
  reportContainer:{
    width:"95%"
  },
  reportContent:{
    marginBottom:"5%",
    backgroundColor:"#002D62",
    alignItems:"center",
    borderRadius:5,
    justifyContent:"center"
  },
  matchedWords:{
    alignItems: 'center',
  },
  reportTitle:{
    fontSize: 25,
    fontWeight: "bold",
    alignSelf:"center",
    marginBottom:12,
    marginTop:12,
    color:"white"
  },
  reportSection:{
    marginBottom:"5%",
    width:"85%"
  },
  reportSectionTitle:{
    fontSize: 18,
    fontWeight: "800",
    marginBottom:"3%",
    textDecorationLine: 'underline',
  },
  wordDefContainer:{
    marginBottom:"3%"
  },
  word:{
    fontSize: 17,
    fontWeight:"700",
    color:"white",
    marginBottom:"2%"
  },
  definition:{
    fontSize: 15,
    color:"lightgray"
  },
  buttonRow:{
    flexDirection:"row",
    justifyContent:"center",
    marginBottom:"2%"
  },
  button:{
    flex:1,
    backgroundColor:"#6AC5F7",
    borderRadius: 10
  },
  buttonText:{
    textAlign:"center",
    fontSize: 20,
    paddingTop:14,
    paddingBottom:14,
    color:"white",
    fontWeight:"800"
  }
});

export default StatsScreenComponent;
