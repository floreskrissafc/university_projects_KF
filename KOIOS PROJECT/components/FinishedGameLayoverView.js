import { StyleSheet, Text, View, TouchableOpacity,Image } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { ScoreView } from './ScoreView.js';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertScore } from '../database.js';
import { updateRevisionsForWordsInTable,
         getRevisionsForWordsInTable } from '../database.js';

const gameFinishedImg = '../assets/images/square_imgs/game_finished.png';

const  generateRandomArray = (len)=> {
  const randomArray = [];
  for (let i = 0; i < len; i++) {
    const randomValue = Math.floor(Math.random() * 10);
    randomArray.push(randomValue);
  }
  return randomArray;
};

export const FinishedGameLayoverView = (props) => {

  const navigation = useNavigation();

  const { dispatch } = navigation;

  const scoreArray = props.score;

  const data = props.wordData;

  const points = props.points;

  const tableName = props.tableName;

  const level = props.level;

  const courseName = tableName == "English_Words"? "English" : "Spanish";

  const [maxScore,setMaxScore] = useState(props.maxScore);

  const language = props.lang;

  const [changingScore, setChangingScore] = useState([0, 0, 0, 0, 0]);

  const [changingTimes, setChangingTimes] = useState(0);

  const handleGameOver = () => {
    navigation.replace('Stats', {score: points, wordData:data, maxScore: maxScore, tableName: tableName, language: language, level: level });
  };

  const updateRevisions = (wordData) =>{
    // Get the words that were correctly matched during the game
    // and update their revision number in the corresponding tableName
    // so that we can keep track if a word is already known or not, depending
    // on the amount of revisions it has

    // if the word has a status of 0 then it is considered correct
    const correctWords = Object.entries(wordData).filter(([, data]) => data.status === 0);
    const correctWordsArray = [];
    correctWords.forEach((wordInfo)=>correctWordsArray.push(wordInfo[0]));
    updateRevisionsForWordsInTable(tableName, correctWordsArray);
  };

  useEffect(()=>{
    updateRevisions(data);
    // check if the score for the game is greater than the highest in record
    // update the variable in AsyncStorage in case this is true
    if ( points > maxScore){
      let maxScoreName = courseName == 'English' ? 'maxScoreEnglish':'maxScoreSpanish';
      // Update the value in AsyncStorage
      let newValue = points.toString();

      AsyncStorage.setItem(maxScoreName, points.toString())
        .then(() => {
          setMaxScore(points);
          AsyncStorage.getItem(maxScoreName)
          .then((updatedValue) => {
            //
          })
          .catch((error) => {
            console.error('Error retrieving Max Score from AsyncStorage:', error);
          });
        })
        .catch((error) => {
          console.error('Error updating Max Score:', error);
        });
    }
    insertScore(courseName, points);

  },[]);

  useEffect(()=>{
    const intervalID = setInterval(()=>{
      let newScores = generateRandomArray(scoreArray.length);
      if ( changingTimes <  20 ){
        setChangingTimes(times => times + 1);
        setChangingScore(newScores);
      } else {
        setChangingScore(scoreArray);
        clearInterval(intervalID);
      }
    }, 10);
    return () => {
      clearInterval(intervalID);
    };
  },[changingScore]);



  return (
    <View style={ styles.gameOverViewContainer }>
      <View style={styles.imgContainer}>
        <Image style={styles.gameFinishedImg} source={require(gameFinishedImg)} resizeMode="contain" resizeMethod="scale"/>
      </View>
      <View style={styles.scoreViewContainer}>
        <ScoreView values={changingScore} />
      </View>
      <TouchableOpacity style={styles.statsButton} onPress={handleGameOver}>
        <Text style={styles.statsButtonText}>
          See your stats
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gameOverViewContainer:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: "30%",
    marginBottom: "20%",
    width:"90%",
    borderRadius:5,
    paddingTop:"5%",
    paddingBottom:"5%"
  },
  imgContainer:{
    flex:6,
    justifyContent:"center",
    alignItems:"center",
    width:"100%"
  },
  gameFinishedImg:{
    flex:1,
    width:"100%"
  },
  scoreViewContainer:{
    flex:2,
    justifyContent:"center",
    alignItems:"center",
    width:"90%"
  },
  statsButton:{
    flex:1,
    backgroundColor: '#00798c',
    alignItems: 'center',
    justifyContent: 'center',
    width:"60%",
    marginTop:"5%",
    opacity:1,
    borderRadius:10,
    elevation:10
  },
  statsButtonText:{
    color:"white",
    fontSize:25,
    fontWeight:900,
    paddingLeft:"5%",
    paddingRight:"5%"
  }

})
