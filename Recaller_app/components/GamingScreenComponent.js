import { StyleSheet, Text, View, SafeAreaView, ImageBackground, Image, Animated, TouchableOpacity, StatusBar, Platform } from 'react-native';
import React, { useEffect,useRef, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import word_list from '../assets/words_and_definitions/word_list.js';
import * as SecureStore from 'expo-secure-store';

/* --------------- START OF HELPER FUNCTIONS FOR THIS SCREEN ---------------*/

function getStartOfWord(word){
  // This function returns the first letters of a word, depending on its length
  // it is used to give a hint of the word to the user
  let end = 0;
  if ( word.length <= 4){ end = 1; }
  else if ( word.length <= 6 ){ end = 2; }
  else { end = 3;}
  return word.slice(0,end);
}

function shuffleArray(array) {
  //Function used to shuffle the list of words to be used in the game
  //to prevent showing the same ones all the time
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getMissingLetters(word, slice){
  // This function creates the array of letters that will
  // be provided to the user to guess the right word.
  // slice represents the first part of the word that was given
  // to the user as a hint.
  let listOfLetters = [];
  for (let i = slice.length; i < word.length; i++){
    listOfLetters.push(word.charAt(i))
  }
  // since the game uses 10 letters total, if the length of listOfLetters
  // is less than 10 then we must add some random letters to it.
  letters = ['a', 'b', 'c', 'd', 'e', 'f',
             'g', 'h', 'i', 'j', 'k', 'l',
             'm', 'n', 'o', 'p', 'q', 'r',
             's', 't', 'u', 'v', 'w', 'x', 'y','z'];

  while ( listOfLetters.length < 10 ){
    listOfLetters.push(letters[Math.floor(Math.random() * letters.length)])
  }
  return shuffleArray(listOfLetters);
}

//Each word will be given a score based on how difficult it is
const gamePoints = { "easy": 500, "standard": 1000, "intermediate":1500,
                     "difficult" : 2000, "hard":2500, "expert":3000};


async function getValueFor(key) {
  // Function to access score data for the game,
  // the scores are saved with Secure Store and must be accessed
  // to show a graph in the Stats Screen
 let result = await SecureStore.getItemAsync(key);
 if (result) {
   return result;
 }
 return null;
}


async function saveScoreData(key, value) {
  // Function to save score data for the game,
  // this data will be used later in the Stats Screen
  // to show a graph to the user
  await SecureStore.setItemAsync(key, value);
}

function formatTime(remainingTime) {
    // Function used in the timer to customize how the timer looks
    // here it will show minutes:seconds remaining in timer
    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;
    if ( seconds < 10 ){
      seconds = "0" + seconds;
    }
    if ( minutes == 0 ){
      return `:${seconds}`;
    }
    return `${minutes}:${seconds}`;
}

/* --------------- END OF HELPER FUNCTIONS FOR THIS SCREEN ---------------*/

/* --------------- START OF GAMING SCREEN COMPONENT CODE ---------------*/

const GamingScreenComponent = () => {

  /* --------------- START OF DEFINITION OF STATE VARIABLES FOR COMPONENT ---------------*/

  // Choose a random integer to select a word from the list of words
  const [wordIndex, setWordIndex] = useState(Math.floor(Math.random() * word_list.length));

  // Define a SET that will store the index of the words that have been shown in this session of the game
  // It is used to not ask for a word more than once in a game
  const [seenWords, setSeenWords] = useState(new Set([wordIndex]));

  // The definition of the word the user is supposed to spell
  const [givenDefinition, setgivenDefinition] = useState(word_list[wordIndex]["Definition"]);

  // The right word that the user should write
  const [rightMatch, setRightMatch] = useState(word_list[wordIndex]["Word"]);

  // This variable is a list that will store objects {"word":__, "def": ____, "match":____}
  // for every word that is shown during the game, to send later to the Stats Screen
  const [gameData, setGameData] = useState([{"word":rightMatch, "def":givenDefinition, "match":undefined}]);

  // The word the user has created with the given letters
  // At the start it gives the first letters as a hint
  const [inputWord, setinputWord] = useState(getStartOfWord(rightMatch));

  // An array of letters given to the user to form a word
  const [lettersToChoose, setlettersToChoose] = useState( getMissingLetters(rightMatch, inputWord));

  // An array of boolean values, their position indicates if a given letter has been used or not
  const [isDisabled, setIsDisabled] = useState([false, false, false, false,false, false,false, false,false, false]);

  // An array to store the index of the letters that have been chosen (in the order they were chosen)
  // it will be used to activate or deactivate a given letter
  const [indexDisabled, setIndexDisabled] = useState([]);

  // State variable to disable the backspace button if no letter has been chosen
  const [backspaceDisabled, setbackspaceDisabled] = useState(true);

  // A boolean to pause or activate the timer shown in the top right corner of the Game Screen Component
  const [counterIsPlaying, setcounterIsPlaying] = useState(true);

  // A boolean to show or hide an overlaid view that is only shown when the user pauses the game
  const [overlayIsShown, setOverlayIsShown] = useState(false);

  // A boolean to show or hide an overlaid view that is only shown when the games finishes
  const [gameOver, setGameOver] = useState(false);

  // A number that stores a counter of how many words the user has matched to its respective definition
  const [matchedWordCounter, setMatchedWordCounter] = useState(0);

  // A state variable that can have 4 values [0, 1, 2, 3], each one
  // correspond to a background color depending if the word was matched, unmatched, skipped or being written.
  const [inputState, setInputState] = useState(0);

  const navigation = useNavigation();  // To be able to access the navigation from this component

  // Variable used to set a timeOut in order to get the next word to be shown in the game
  const intervalRef = useRef(undefined);

  // Variable used to change the opacity of the image shown when the game is over
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // A state variable to show an animation when a word is matched or skipped
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // A state variable to show an animation when a new definition is shown
  const fadeDefinitionAnim = useRef(new Animated.Value(0)).current;

  // A boolean used to load the background image before showing the content of the component
  const [isLoading, setIsLoading] = useState(false);

  // A variable to hold the state of a sound that should play when there are 5 seconds left in the game
  const [sound, setSound] = useState();

  // A state variable that changes the opacity of the skip button when is pressed, for some
  // reason the Touchable Opacity wasn't working as expected and I had to use this
  const [skipOpacity, setSkipOpacity] = useState(0);

  // A state variable that changes the opacity of the Submit button when is pressed, similar to
  // skipOpacity
  const [submitOpacity, setSubmitOpacity] = useState(0);

  // The difficulty of the word being shown, used to add to the game score if the user matches the word
  const [wordDifficulty, setWordDifficulty] = useState(word_list[wordIndex]["Difficulty"]);

  // Variable to be updated every time the user matches a given word
  const [currentScore, setCurrentScore] = useState(0);

  // Variable used to hold a list of the last 10 scores achieved in the game
  // this is one of the variables that must be updated and saved with Secure Store
  const scoreList = useRef([]);

  // Variable used to hold the highest score ever achieved by the user
  // it must be updated and saved with Secure Store
  const highestScoreAchieved= useRef('0');

  /* --------------- END OF DEFINITION OF STATE VARIABLES FOR COMPONENT ---------------*/

  /* --------------- START OF HELPER FUNCTIONS THAT USE STATE VARIABLES ---------------*/

  async function playSound() {
    // Function to load a sound when there are 5 seconds left for the game to finish
    const { sound } = await Audio.Sound.createAsync( require('../assets/sound_effect.mp3'));
    setSound(sound);
    await sound.playAsync();
  }

  async function keepPlayingSound() {
    // When the user pauses the game, the sound is paused if
    // it was being played. This function makes the sound play
    // again if it was paused.
    if (sound){
      await sound.playAsync();
    }
  }

  useEffect(() => {
    // Unload the sound variable, if it exists
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function pauseSound() {
    // Functon to pause the sound, if it exists. This function is
    // called when the user presses the Pause button.
    if (sound != undefined){
      await sound.pauseAsync();
    }
  }

  // Animation to change the opacity of an image
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
      delay: 1500,
    }).start();
  }, [fadeAnim]);

  // Animation used to change the opacity of the definition if one is being loaded
  useEffect(() => {
    Animated.timing(fadeDefinitionAnim, {
      toValue: 0.65,
      duration: 900,
      useNativeDriver: true
    }).start();
  }, [fadeDefinitionAnim]);

  function letterPressed(i, letter){
    // Function that updates the inputWord state variable when the user presses a letter
    // the letter is then deactivated, its index is added to indexDisabled array
    let tempWord = inputWord + letter;
    let newDisableStates = isDisabled;
    newDisableStates[i] = !newDisableStates[i];
    setIsDisabled(newDisableStates);
    setinputWord(tempWord);
    let tempIndexDisabled = indexDisabled;
    tempIndexDisabled.push(i);
    setIndexDisabled(tempIndexDisabled);
    if ( indexDisabled.length != 0 ){
      setbackspaceDisabled(false);
    }
  }

  function backspaceClicked(){
    // Function that deletes the last letter that was chosen by the useRef
    // then it updates the inputWord state variable and sets the backspace
    // button to disabled if there are no letters to delete
    let tempWord = inputWord;
    tempWord = tempWord.slice(0,-1);
    setinputWord(tempWord);
    let tempIndexDisabled = indexDisabled;
    let lastIndexDisabled = tempIndexDisabled.pop();
    setIndexDisabled(tempIndexDisabled);
    let newDisableStates = isDisabled;
    newDisableStates[lastIndexDisabled] = !newDisableStates[lastIndexDisabled]
    setIsDisabled(newDisableStates);
    if ( indexDisabled.length == 0 ){
      setbackspaceDisabled(true);
    }
  }

  function checkMatch(skipped){
    /* When the user clicks the Submit button this function is called.
    It checks whether the word that was written by the user in the game
    matches the word that goes with the given definition. It if matches
    then the state of the container changes (to change its background color).
    This Function will be called onPressIn for the Submit and Skip buttons.*/

    // Animation to. increase the size of the input word while its being matched
    Animated.timing( scaleAnim, { toValue: 1.09,
                                  duration: 90,
                                  useNativeDriver: true}).start();
    let currObj = gameData[gameData.length - 1];
    if ( skipped ){
      setInputState(3); // adds gray background color
      setinputWord(rightMatch); // show the user the word they should have written
      setSkipOpacity(1);
      currObj["match"] = "skipped";  // store the fact that the word was skipped
    }
    else {
      if ( inputWord == rightMatch ){
        // Increase the matchWordCounter
        setMatchedWordCounter(matchedWordCounter+1);
        // Increase the score of the game
        let newScore = currentScore +  gamePoints[wordDifficulty];
        setCurrentScore(newScore);
        setInputState(1); // adds green background color
        currObj["match"] = "matched"; // store the fact that the word was matched

      } else {
        setInputState(2); //adds red background color
        setinputWord(rightMatch); // show the user the word they should have written
        currObj["match"] = "unmatched"; // store the fact that the word was unmatched
      }
      // Update the gameData variable
      gameData[gameData.length - 1] = currObj;
      setGameData(gameData);
      setSubmitOpacity(1);
    }
    // Animation to fade out the current definition
    Animated.timing(fadeDefinitionAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }

  function getNewQuestion(){
    // Must show another definition
    let next_index = Math.floor(Math.random() * word_list.length);
    // Check if that index was used before in this game, use seenWords set
    while (seenWords.has(next_index)){
      // Get another random index until that index hasn't been seen before
      next_index = Math.floor(Math.random() * word_list.length);
    }
    // add this new index to SeenWords
    setSeenWords(seenWords.add(next_index));
    // update the wordIndex
    setWordIndex(next_index);
    // get a new word + definition from the list
    let def = word_list[next_index]["Definition"]
    setgivenDefinition( def );
    let word = word_list[next_index]["Word"]
    setRightMatch(word);
    // get the new difficulty for the word
    setWordDifficulty(word_list[next_index]["Difficulty"]);
    // set the right hint for the new word
    let startOfNewWord = getStartOfWord(word_list[next_index]["Word"]);
    setinputWord(startOfNewWord);
    // all letters should start available to be used
    setIndexDisabled([]);
    setIsDisabled([false, false, false, false,false, false,false, false,false, false]);
    // Must show a different set of keys for the new word
    setlettersToChoose( getMissingLetters(word, startOfNewWord));
    // the backspace button should be dissabled when a new word appears
    setbackspaceDisabled(true);
    //update the gameData variable to include this new chosen word
    let newObj = {"word":word, "def": def, "match":undefined};
    gameData.push(newObj);
    setGameData(gameData)
  }

  function changeStateBack(){
    /* This function will be called onPressOut for the Submit and Skip buttons.
    It sets a timeout of one second to change the state of the input text
    back to its original state (no background color added)*/
    setSubmitOpacity(0);
    setSkipOpacity(0);
    setcounterIsPlaying(true);
    intervalRef.current = setTimeout( function(){
      setInputState(0);
      getNewQuestion();
      // Change back the size of the text input, since it was increased during the matching
      Animated.timing( scaleAnim, { toValue: 1,
                                    duration: 50,
                                    useNativeDriver: true}).start();
      Animated.timing(fadeDefinitionAnim, {
        toValue: 0.65,
        duration: 400,
        useNativeDriver: true
      }).start();
    }, 1000);
  }

  function saveCurrentScore(){
    getValueFor("scores").then( scoresString => {
      let scores = [];
      if (scoresString != null){
        scores = JSON.parse(scoresString);
      }
      // Add the new score to the saved data
      scores.push(currentScore);
      // If the list of scores is longer than 10, remove the first
      // element to save the latest 10 scores
      if ( scores.length > 10) {
        scores.shift();
      }
      // Update the reference scoreList
      scoreList.current = scores;
      // Save the new score list
      saveScoreData("scores", JSON.stringify(scores));
    });
    getValueFor("highestScore").then( highestScore =>{
      let savedScore = '0';
      if (highestScore != null){
        savedScore = highestScore;
      }
      // Update the highest score if necessary
      if (Number(currentScore) > Number(savedScore)){
        savedScore = currentScore;
        saveScoreData("highestScore", JSON.stringify(savedScore));
      }
      highestScoreAchieved.current = savedScore;
    });
  }

  // Clear the interval that was used to show a new word
  useEffect(() => {
    if (intervalRef.current != undefined) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, [inputState]);

  /* --------------- END OF HELPER FUNCTIONS THAT USE STATE VARIABLES ---------------*/

  return (
    <View style={ styles.container}>
      <ImageBackground  source={require('../assets/images/background_img.jpeg')} resizeMode="cover"
                        style={[styles.backgroundImg, !overlayIsShown ? {zIndex:3} : {zIndex:1, opacity: 0.3}]}
                        onLoadStart={() => {setIsLoading(true)}}
                        onLoad={() => {setIsLoading(false)}}
                        onLoadEnd={() => {setIsLoading(false)}} >
        <SafeAreaView style={styles.gameSafeView}>
          {/* - START OF TOP SECTION OF THE GAME THAT SHOWS PAUSE BUTTON, TIMER AND COUNTER -*/}
          <View style = {[isLoading ? {opacity:0}: {opacity: 1}, styles.topContainer]}>
            {/* START OF CODE FOR PAUSE BUTTON*/}
            <TouchableOpacity style={styles.topButtons}
                              onPress={()=>{ setcounterIsPlaying(false);
                                             setOverlayIsShown(true);
                                             pauseSound();
                                              }}>
              <View style={styles.pauseButton}>

                <Image source={ require('../assets/images/pause.png')} resizeMode="contain"
                       style={{height:"100%", maxWidth:"100%"}}/>
              </View>
            </TouchableOpacity>
            {/* END OF CODE FOR PAUSE BUTTON*/}

            {/* START OF CODE FOR WORD COUNTER*/}
            <View style={ [styles.topButtons, styles.topCounter]}>
              <Image source={ require('../assets/images/trophy.png')}
                     resizeMode="contain"
                     style={styles.matchedWordImg} />
              <Text style={styles.matchWordCounter} adjustsFontSizeToFit >{matchedWordCounter}</Text>
            </View>
            {/* END OF CODE FOR WORD COUNTER*/}

            {/* START OF CODE FOR TIMER*/}
            <View style={[styles.topButtons, styles.countdownContainer]}>
              <CountdownCircleTimer
                    isPlaying={counterIsPlaying}
                    duration={60}
                    initialRemainingTime = {60}
                    colors={["#4CBB17", "#F7B801", "#A30000"]}
                    colorsTime = {[40,20,0]}
                    onComplete={() => ({ shouldRepeat: false })}
                    onUpdate = { ( remainingTime ) => {
                                  if ( remainingTime == 5 ) { playSound();}
                                  if (remainingTime == 0){
                                    setGameOver(true);
                                    saveCurrentScore();
                                  }
                               }}
                    updateInterval={1}
                    size={53}
                    strokeWidth = {4}
                    style={styles.countdown} >
                {({ remainingTime, color }) => (
                  <Text style={{ color, fontSize: 20 , fontWeight: "bold", opacity:0.8}}>
                    {formatTime(remainingTime)}
                  </Text>
                )}
              </CountdownCircleTimer>
            </View>
            {/* END OF CODE FOR TIMER*/}
          </View>
          {/* --------------- END OF TOP SECTION OF THE GAME THAT SHOWS PAUSE BUTTON, TIMER AND COUNTER ---------------*/}

          {/* --------------- START OF SECTION TO SHOW THE WORD DEFINITION ---------------*/}
          <View style = {[styles.wordDefinition, styles.gameList]}>
            <Animated.View style= {[styles.definitionContainer, { opacity : fadeDefinitionAnim }]}>
              <Text style= { styles.definitionText }>{givenDefinition}</Text>
            </Animated.View>
          </View>
          {/* --------------- END OF SECTION TO SHOW THE WORD DEFINITION ---------------*/}

          {/* --------------- START OF SECTION TO SHOW THE WORD THE USER HAS WRITTEN ---------------*/}
          <View style = {styles.wordInput}>
            <Animated.View style={[styles.inputTextContainer, { transform:[{scale:scaleAnim}]},
                          (inputState == 0 ? {backgroundColor: "transparent"} :
                          (inputState == 1 ? {backgroundColor: "green"} :
                          (inputState == 2 ? {backgroundColor: "red"} : {backgroundColor: "gray"} )
                          ))]}>
              <Text style= { styles.inputText }>{inputWord}</Text>
            </Animated.View>
          </View>
          {/* --------------- END OF SECTION TO SHOW THE WORD THE USER HAS WRITTEN ---------------*/}

          {/* --------------- START OF SECTION TO SHOW THE ROWS OF LETTERS ---------------*/}
          <View style = {[styles.givenLetters, styles.gameList]}>
            {/* This is where the letters to form the definition are given
              I have to loop through an array to show the letters,
              5 letters in each of the rows */}
            <View style = {styles.rowOfLetters}>
              {/*Show the first 5 letters in the array*/}
              { lettersToChoose.map((letter,i)=> ( i < 5 ?
                ( <TouchableOpacity
                    key={i}
                    style={ [styles.letterButton, i == 4 ? { marginRight: "0%"} : { marginRight: "2%"} ,
                            isDisabled[i] == false ? styles.letterButtonActive : styles.letterButtonDisabled]}
                    onPress={() => letterPressed(i,letter)}
                    disabled={isDisabled[i]} >
                      <Text style={[ styles.letterText,
                                    isDisabled[i] == false ? {opacity: 1}:{opacity:0.1}]} >
                        {letter}
                      </Text>
                </TouchableOpacity> ) : null
              ))}
            </View>
            <View style = {styles.rowOfLetters}>
              {/*Show the last 5 letters in the array*/}
              { lettersToChoose.map((letter,i)=> ( i >= 5 ?
                ( <TouchableOpacity
                    key={i}
                    style={ [styles.letterButton, i == 9 ? { marginRight: "0%"} : { marginRight: "2%"} ,
                            isDisabled[i] == false ? styles.letterButtonActive : styles.letterButtonDisabled]}
                    onPress={() => letterPressed(i,letter)}
                    disabled={isDisabled[i]} >
                      <Text style={[styles.letterText,
                                    isDisabled[i] == false ? {opacity: 1}:{opacity:0.1}]}>
                        {letter}
                      </Text>
                  </TouchableOpacity>) : null
              ))}
            </View>
          </View>
          {/* --------------- END OF SECTION TO SHOW THE ROWS OF LETTERS ---------------*/}

          {/* --------------- START OF SECTION TO SHOW THE BOTTOM BUTTONS ---------------*/}
          <View style = {[styles.optionButtonsContainer, styles.gameList]}>
            {/* START SKIP BUTTON */}
            <TouchableOpacity style = { [styles.skipButton,
                                         styles.optionButton,
                                         skipOpacity == 0 ? {opacity: 0.65} : { opacity:0.2}] }
                              onPressIn={() => { checkMatch(true);}}
                              onPressOut={() =>{ changeStateBack();}}>
              <Text style = {[styles.optionButtonText, { fontSize: 20}]}>Skip</Text>
            </TouchableOpacity>
            {/* END SKIP BUTTON */}

            {/* START SUBMIT BUTTON */}
            <TouchableOpacity style = { [styles.submitButton,
                                         styles.optionButton,
                                         submitOpacity == 0 ? {opacity: 0.65} : { opacity:0.2}] }
                              onPressIn={() => {
                                checkMatch(false);
                              }}
                              onPressOut={() => {
                                changeStateBack();
                            }}>
              <Text style = {styles.optionButtonText} >Submit</Text>
            </TouchableOpacity>
            {/* END SUBMIT BUTTON */}

            {/* START BACKSPACE BUTTON */}
            <TouchableOpacity style={[styles.optionButton,
                                      styles.deleteButton,
                                      backspaceDisabled ? {opacity: 0.2} : {opacity: 0.65}]}
                              onPress={() => backspaceClicked()}
                              disabled={backspaceDisabled}>
              <Image source={ require('../assets/images/backspace.png')}
                     resizeMode="contain"
                     style={{ width:"60%"}} />
            </TouchableOpacity>
            {/* END BACKSPACE BUTTON */}
          </View>
          {/* --------------- END OF SECTION TO SHOW THE BOTTOM BUTTONS ---------------*/}
        </SafeAreaView>
      </ImageBackground>

      {/* --------------- START OF OVERLAID TO SHOW WHEN GAME IS PAUSED ---------------*/}
      <View style={[styles.overlayContainer,
                    overlayIsShown ?
                      {zIndex:3, backgroundColor: 'rgba(0,0,0,0.4)'} :
                      {zIndex:1, opacity:0}]} >
        <View style={styles.overlayContent}>
          <Text style={styles.overlayText}> Paused </Text>
          {/* START OF RESUME BUTTON */}
          <TouchableOpacity style={styles.overlayButton}
                            onPress={()=>{setcounterIsPlaying(true);
                                          setOverlayIsShown(false);
                                          keepPlayingSound();
                                        }}>
            <Text style={styles.overlayButtonText}>Resume</Text>
          </TouchableOpacity>
           {/* END OF RESUME BUTTON */}

           {/* START OF RESTART BUTTON */}
          <TouchableOpacity style={styles.overlayButton}
                            onPress={() =>
                              navigation.dispatch( StackActions.replace('Game', {}))
                            }>
            <Text style={styles.overlayButtonText}>Restart</Text>
          </TouchableOpacity>
          {/* END OF RESTART BUTTON */}

          {/* START OF INSTRUCTIONS BUTTON */}
          <TouchableOpacity style={styles.overlayButton}
                            onPress={() => {
                              navigation.push('Instructions',{});
                            }}>
            <Text style={styles.overlayButtonText}>Game Instructions</Text>
          </TouchableOpacity>
          {/* END OF INSTRUCTIONS BUTTON */}
        </View>
      </View>
      {/* --------------- END OF OVERLAID TO SHOW WHEN GAME IS PAUSED ---------------*/}

      {/* --------------- START OF OVERLAID TO SHOW WHEN GAME IS OVER ---------------*/}
      <View style={[styles.overlayContainer,
                    gameOver ? { zIndex:3, backgroundColor: 'rgba(239,239,240,0.85)'} :
                               {zIndex:1, opacity:0}]}>

        <Animated.View style={[styles.overlayContent,
                               styles.gameOverContainer,
                               { opacity: fadeAnim}]} >
          <Image source={ require('../assets/images/cartoon_girl_with_sign3.png')}
                 resizeMode="contain"
                 style={styles.imgGameOver} />

          {/* START OF CONTINUE TO STATS BUTTON */}
          <TouchableOpacity style={[styles.buttonGameOver, styles.buttonStats]}
                            onPress={() => { navigation.navigate('Stats',
                                              { gameData:{gameData},
                                                scoreList: {scoreList},
                                                highestScore:{ highestScoreAchieved },
                                                currentScore:{ currentScore }
                                              });}}>
            <Text style={ [styles.textGameOver,
                          {color: "white"}]} adjustsFontSizeToFit> Continue to stats </Text>
          </TouchableOpacity>
          {/* END OF CONTINUE TO STATS BUTTON */}

          {/* START OF PLAY AGAIN BUTTON */}
          <TouchableOpacity style={[styles.buttonGameOver,
                                    styles.buttonPlayAgain]}
                            onPress={() =>
                              navigation.dispatch( StackActions.replace('Game', {}))
                            }>
            <Text style={ [styles.textGameOver,
                          {color:"#5568B9"}]}> Play again </Text>
          </TouchableOpacity>
          {/* END OF PLAY AGAIN BUTTON */}
        </Animated.View>
      </View>
      {/* --------------- END OF OVERLAID TO SHOW WHEN GAME IS OVER ---------------*/}
    </View>
  );
}
/* --------------- END OF GAMING SCREEN COMPONENT CODE ---------------*/


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height:"100%"
  },
  backgroundImg: {
    flex: 1,
    justifyContent: "center",
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  gameSafeView:{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android"? StatusBar.currentHeight : Platform.OS === "web" ? 20 : 0,
    width:"100%",
    maxWidth: 800,
    height:"100%"

  },
  topContainer:{
    flex: 1,
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topButtons:{
    flex: 1,
    maxHeight: "100%",
    marginRight: "2%",
    justifyContent: "center",
  },
  pauseButton: {
    heigth:"100%",
    width:"50%",
    height: "100%",
    maxWidth: 100
  },
  topCounter:{
    flexDirection:"row",
    justifyContent: "center",
    alignItems:"center",
    width:"100%",

  },
  countdownContainer:{
    flex:1,
    justifyContent:"center",
    alignItems:"flex-end",
    paddingRight:"2%",

  },
  matchedWordImg: {
    width:"35%",
    maxWidth: 53
  },
  matchWordCounter:{
    color: "white",
    opacity: 0.8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  wordDefinition: {
    flex: 3,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  definitionContainer: {
    backgroundColor: "white",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    minHeight:80

  },
  definitionText:{
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'darkblue',
    paddingLeft: "2%",
    paddingRight: "2%",
    paddingTop: "3%",
    paddingBottom: "3%",
  },
  wordInput: {
    flex: 2,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  inputTextContainer: {
    width: "100%",
    paddingTop: 3,
    paddingBottom: 6,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  inputText:{
    width: "100%",
    minHeight: 8,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    color: 'white',
    letterSpacing: 5,
    paddingLeft:2,
    paddingRight:2
  },
  givenLetters: {
    flex: 3,
    width: "90%",
    justifyContent: "space-between",
  },
  rowOfLetters:{
    flexDirection:"row",
    width: "100%",
    height: "45%",
    justifyContent: "space-between",
  },
  letterButton:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  letterButtonDisabled:{
    backgroundColor: 'rgba(52, 52, 52, 0.1)'
  },
  letterButtonActive:{
    backgroundColor: "darkblue",
  },
  letterText: {
    fontSize: 35,
    fontWeight: "bold",
    color: 'white',
    alignSelf:"center"
  },
  optionButtonsContainer:{
    flex: 4,
    width: "90%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  optionButton:{
    marginRight: 7,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
    height: "35%",
    borderRadius: 10,
    backgroundColor: "white",
    opacity: 0.65,

  },
  optionButtonText:{
    fontSize: 30,
    fontWeight: "bold",
    color: 'darkblue',
  },
  skipButton:{
    flex: 1,
  },
  submitButton: {
    flex: 3,

  },
  deleteButton: {
    flex: 1,
    marginRight: 0,
  },

  gameList :{
    marginTop: "10%",
  },
  overlayContainer:{
    position: 'absolute',
    left: 0,
    top:0,
    width:"100%",
    height:"100%",
    flex: 1,
    alignItems:"center",
    justifyContent: "center"
  },
  overlayContent:{
    width:"70%",
    maxHeight:"50%",
    flex: 1,
    alignItems:"center",
    justifyContent: "center",
  },
  overlayButton:{
    backgroundColor:"#56CBF6",
    opacity: 1,
    marginBottom: 9,
    paddingTop: 20,
    paddingBottom: 20,
    width: '90%',
    alignItems:"center",
    justifyContent: "center",
    borderRadius: 5
  },
  overlayText:{
    color:"white",
    fontSize:40,
    fontWeight:"800",
    marginBottom: 12

  },
  overlayButtonText:{
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },
  gameOverContainer:{
    width:"90%",
    maxWidth: 800,
  },
  imgGameOver:{
    flex:11,
    width: "100%"
  },
  buttonGameOver:{
    flex:2,
    width:"70%",
    alignItems:"center",
    justifyContent: "center",
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight:20,
    borderRadius: 8,
    marginTop:12,
    borderWidth:2,
    borderColor:"white"
  },
  buttonStats:{
    backgroundColor:"#56CBF6",
  },
  buttonPlayAgain:{
    backgroundColor:"#E4E9FE",
  },
  textGameOver:{
    fontSize:22,
    fontWeight:"bold",
    textAlign:"center"
  }
})

export default GamingScreenComponent;
