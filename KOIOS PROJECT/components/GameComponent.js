import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Dimensions, Text, View, SafeAreaView,
         Platform, ActivityIndicator, TouchableOpacity,
         Animated, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import { queryWords, queryWordsToReview } from '../database';
import AnimatedNumbers from 'react-native-animated-numbers';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { FinishedGameLayoverView } from './FinishedGameLayoverView.js';
import { LoadingGameView } from './LoadingGameView.js';
import { Audio } from 'expo-av';
import { useNavigation, useRoute } from '@react-navigation/native';


//-- Images and constants to be used in this component
const screenWidth = Dimensions.get("window").width;

const screenHeight = Dimensions.get("window").height;

const gameBackgroundImg = '../assets/images/backgrounds/game.png';

const definitionBackgroundImg = '../assets/images/backgrounds/definition.png';

const answerBackgroundImg = '../assets/images/backgrounds/answer.png';

const pointCounterImg = '../assets/images/square_imgs/pointOwl.png';

const backButtonImg = '../assets/images/square_imgs/back.png';

const skipButtonImg = '../assets/images/square_imgs/skip.png';

const pauseButtonImg = '../assets/images/square_imgs/pause.png';

const letterBackground = '../assets/images/square_imgs/rock_for_letter.png';

const letterBackgroundDeactivated = '../assets/images/square_imgs/rocks.png';


const divideScore = (score) =>{
  /** Function to divide the score into individual digits
  this function takes a score as input and divides it into
  individual digits. It converts the score to a string,
  pads it with leading zeros to ensure it has a length of 5,
  and then splits the padded score string into an array of
  individual digits. The resulting array is returned as the output
  **/
  const result = score.toString().padStart(5, '0').split("");

  return result;
}

// Code for the components that are shown when the user clicks the Pause Button
const PausedStateLayoverView = (props) => {

  return (

    <View style={ [styles.pausedViewContainer, {zIndex: 6, opacity: 1}] }>

      <View style={styles.pausedTextContainer}>

        <Text style={styles.pausedText}>Paused</Text>

      </View>

      <View style={styles.pausedStateButtonsContainer}>

        <TouchableOpacity
            style={[styles.pausedButton,{backgroundColor:"#ebcd5f", opacity:1}]}
            onPress = {() => { props.onInstructions()}}>

          <Text style={styles.pausedButtonText}>Instructions</Text>

        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.pausedButton,{backgroundColor:"#b1ddf8", opacity:1}]}
            onPress = {() => { props.onRestart()}}>

          <Text style={styles.pausedButtonText}>Restart</Text>

        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.pausedButton,{backgroundColor:"#51b2b6", opacity:1}]}
            onPress = {() => { props.onBackToGame()}}>

          <Text style={styles.pausedButtonText}>Back to Game</Text>

        </TouchableOpacity>

      </View>

    </View>
  )
};

// Custom component to show the game screen
const Game = (props) => {

  let timerDuration = 60;

  wordList = props.wordList;

  highestScoreEnglish = props.highestScoreEnglish;

  highestScoreSpanish = props.highestScoreSpanish;

  language = props.lang;

  tableName = props.tableName;

  level = props.levelName;

  const navigation = useNavigation();

  useEffect(() => {
    const configureAudioSession = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: true,
      });
    };

    configureAudioSession();

    // Clean up the audio session configuration
    return () => {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };
  }, []);

  const getFirstCharacters = (currentWord) => {

    let firstCharacters;

    if ( currentWord.length > 10 ){

      let truncatedLength = currentWord.length - 10;

      truncatedLength = Math.max(3, truncatedLength);

      firstCharacters = currentWord.substring(0,truncatedLength);
    }
    else if ( currentWord.length > 2 ){

      firstCharacters = currentWord.substring(0,2);

    } else {

      firstCharacters = currentWord.substring(0,1);

    }
    return firstCharacters;
  };

  const getShuffleList = (list) => {
    // Fisher-Yates algorithm
    const shuffledList = [...list];

    let currentIndex = shuffledList.length;

    while (currentIndex > 0) {

      const randomIndex = Math.floor(Math.random() * currentIndex);

      currentIndex--;
      // Swap elements
      const temporaryValue = shuffledList[currentIndex];

      shuffledList[currentIndex] = shuffledList[randomIndex];

      shuffledList[randomIndex] = temporaryValue;
    }
    return shuffledList;
  };

  const getMissingCharactersList = (wholeWord, startOfWord) =>{
    // Here do not forget to check if the length
    // of the word is greater than 10, must truncate it
    let len = startOfWord.length;

    let missingChars = wholeWord.substring(len,);

    numberOfSpacesToFill = 10 - missingChars.length;

    let alphabet = ['a','b','c','d','e','f','g','h',
                    'i','j','k','l','m','n','o','p',
                    'q','r','s','t','u','v','w','x','y','z'];

    let missingCharactersList = [...missingChars];

    while (missingCharactersList.length < 10) {

      let randomNum = Math.floor(Math.random() * 10); // Generates a random number between 0 and 9
      missingCharactersList.push(alphabet[randomNum]);
    }

    shuffledList = getShuffleList(missingCharactersList);

    return shuffledList;
  };

  const getHint = (wholeWord,startOfWord) => {
    let wordHint = startOfWord;
    let lengthDifference = wholeWord.length - startOfWord.length;
    for( let i = 0 ; i < lengthDifference ; i++){
      wordHint += "_ ";
    }
    return wordHint;
  };

  const [isPlaying, setIsPlaying] = useState(true);

  const [animateToNumber, setAnimateToNumber] = useState(0);

  const increase = () => {
    setAnimateToNumber(animateToNumber + 100);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const translateYAnim = useRef(new Animated.Value(-20)).current;

  const startAnimation = (changingNumber) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation has ended, reset the values
      if ( changingNumber != 0){
        fadeAnim.setValue(0);
        translateYAnim.setValue(-20);
      }
    });
  };

  const [position, setPosition] = useState(0);

  const [word, setWord] = useState(wordList[position].Word);

  const [firstCharacters, setFirstCharacters] = useState(getFirstCharacters(word));

  const [hint, setHint] = useState(getHint(word,firstCharacters));

  const [missingCharacters, setMissingCharacters ] = useState(getMissingCharactersList(word,firstCharacters));

  const [definition, setDefinition] = useState(wordList[position].Definition);

  const [answerBackgroundColor, setAnswerBackgroundColor] = useState('white');

  const [answerFontSize, setAnswerFontSize] = useState(25);

  const [answerLetterSpacing, setAnswerLetterSpacing] = useState(0);

  const [lettersDisabledState, setLettersDisabledState] = useState([false,false,false,false,false,false,false,false,false,false]);

  const [indexOfDisabledLetters, setIndexOfDisabledLetters] = useState([]);

  const [pauseState, setPauseState] = useState(false);

  const [layoverState, setlayoverState] = useState(false);

  const [gameFinished, setGameFinished] = useState(false);

  const [gameOverScore, setGameOverScore] = useState([0, 0, 0, 0, 0]);

  const getNextWord = () => {
    setPosition(position + 1);
    setLettersDisabledState([false,false,false,false,false,false,false,false,false,false]);
    setIndexOfDisabledLetters([]);
  };

  const pauseGame = () => {
    setlayoverState(true);
    setPauseState(true);
    if (soundIsPlaying){
      pauseSound();
    }
  };

  const onInstructionPress = () =>{
    navigation.navigate('Instructions',{language:'English'});
  };

  const onBackToGamePress = () =>{
    if (soundIsPlaying) {
      playSound();
    }
    setlayoverState(false);
    setPauseState(false);
  };

  const addLetter = (letter, index)=> {
    let indexOfChar = hint.indexOf('_');
    if (indexOfChar !== -1) {
      let newHint = hint.substring(0,indexOfChar) + letter;
      newHint = getHint(word,newHint);
      setHint(newHint);
      newDisabledStates = [...lettersDisabledState];
      newDisabledStates[index] = true;
      setLettersDisabledState(newDisabledStates);
      newIndexOfDisabledLetters = [...indexOfDisabledLetters];
      newIndexOfDisabledLetters.push(index);
      setIndexOfDisabledLetters(newIndexOfDisabledLetters);
      setBackButtonDisableState(false);
    }
  };

  const removeLetter = ()=> {
    let indexOfChar = hint.indexOf('_') == -1 ? hint.length : hint.indexOf('_');
    if ( indexOfChar > firstCharacters.length ){
      let newHint = hint.substring(0,indexOfChar - 1);
      newHint = getHint(word,newHint);
      setHint(newHint);
      newIndexOfDisabledLetters = [...indexOfDisabledLetters];
      let index = newIndexOfDisabledLetters.pop();
      setIndexOfDisabledLetters(newIndexOfDisabledLetters);
      newDisabledStates = [...lettersDisabledState];
      newDisabledStates[index] = false;
      setLettersDisabledState(newDisabledStates);
    }
    if ( indexOfChar - 1 == firstCharacters.length){
      // if no letter has been selected, the back button must deactivate
      setBackButtonDisableState(true);
    }
  };

  const wordsSeen = useRef({});

  // Function to insert a new key-value pair into wordsSeen
  const insertWord = (word, definition, status) => {
    wordsSeen.current[word] = { definition, status };
  };

  const [definitionContainerWidth, setDefinitionContainerWidth] = useState(null);

  const [answerContainerWidth, setAnswerContainerWidth] = useState(null);

  const [timeLeft, setTimeLeft] = useState(3);

  const checkAnswer = (isSkip, isOver) => {
    if ( !isOver){
      if (hint === word && !isSkip) {
        setAnswerBackgroundColor('#009E60');
        setAnswerFontSize(definitionContainerWidth*0.09);
        setAnswerLetterSpacing(1);
        increase();
        insertWord(word, definition, 0);
        if (timeLeft > 1){
          setTimeout(() => {
            setAnswerBackgroundColor('white');
            setAnswerFontSize(definitionContainerWidth*0.07);
            setAnswerLetterSpacing(0);
            getNextWord();
          }, 150); // Change back to transparent after 150 milliseconds
        }

      } else {
        setHint(word);
        setAnswerBackgroundColor('red');
        setAnswerFontSize(definitionContainerWidth*0.09);
        setAnswerLetterSpacing(1);
        if ( isSkip ){
          insertWord(word, definition, 1);
        } else {
          insertWord(word, definition, 2);
        }
        if (timeLeft > 1){
          setTimeout(() => {
            setAnswerBackgroundColor('white');
            setAnswerFontSize(definitionContainerWidth*0.07);
            setAnswerLetterSpacing(0);
            getNextWord();
          }, 150); // Change back to transparent after 150 milliseconds
        }
      }
    } else {
      setHint(word);
      setAnswerFontSize(definitionContainerWidth*0.09);
      setAnswerLetterSpacing(1);
    }
  };

  const sound = useRef(null);

  const [soundIsPlaying, setSoundIsPlaying] = useState(false);

  const [backButtonDisableState, setBackButtonDisableState] = useState(true);

  const [submitButtonDisableState, setSubmitButtonDisableState] = useState(false);

  const [skipButtonDisableState, setSkipButtonDisableState] = useState(false);


  // Load the sound when the component mounts
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound: soundObject } = await Audio.Sound.createAsync(
          require('../assets/countdown_signal.wav')
        );
        sound.current = soundObject;
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };
    loadSound();

    // Clean up the sound when the component unmounts
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  // Function to play the sound when there are 3 seconds left in the timer
  const playSound = async () => {
    try {
      if (sound.current) {
        await sound.current.playAsync();
        setSoundIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Function to pause the sound if the timer sound is currently playing
  const pauseSound = async () => {
    try {
      if (sound.current) {
        await sound.current.pauseAsync();
      }
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };

  const restartGame = () => {
    setlayoverState(false);
    props.onRestart(); // Calling the callback function from GameComponent to reload the screen
  };

  const onTimerComplete = () =>{
    setGameOverScore(divideScore(animateToNumber));
    checkAnswer(false, true);
    setBackButtonDisableState(true);
    setSubmitButtonDisableState(true);
    setSkipButtonDisableState(true);
    setGameFinished(true);
    setTimeout(() => {
      setlayoverState(true);
    }, 100);
  };

  const onTimerUpdate = ( remainingTime ) => {
    startAnimation(remainingTime);
    if (remainingTime == 3) {
      playSound();
    }
    if (remainingTime == 1){
      setTimeLeft(1);
    }
  }

  useEffect(() => {
    // Calculation for word and definition that depends on position
    setWord(wordList[position].Word);
    setDefinition(wordList[position].Definition);
  }, [position]);

  useEffect(() => {
    setFirstCharacters(getFirstCharacters(word));
  }, [word]);

  useEffect(() => {
    setMissingCharacters(getMissingCharactersList(word,firstCharacters));
    setHint(getHint(word,firstCharacters));
  }, [word, firstCharacters]);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>

      <ImageBackground source={require(gameBackgroundImg)} resizeMode="stretch" style={styles.backgroundImg}>

        <View style={[styles.layoverContainer, layoverState == true ? {zIndex: 3} : {zIndex: -2, opacity: 0} ]}>
          { gameFinished == true ? (<FinishedGameLayoverView
                                        lang={language}
                                        maxScore={tableName == 'English_Words' ? highestScoreEnglish : highestScoreSpanish}
                                        score={gameOverScore}
                                        wordData={wordsSeen.current}
                                        points={animateToNumber}
                                        tableName={tableName}
                                        level = {level}/>
                                    ) :
                                    (<PausedStateLayoverView
                                        onInstructions={onInstructionPress}
                                        onRestart={restartGame}
                                        onBackToGame ={onBackToGamePress}/>
                                    )}
        </View>

        <View style={styles.gameContainer}>

          <View style={styles.topContainer}>

            <TouchableOpacity style={[styles.topContainerElement,styles.pauseButtonContainer]} onPress={pauseGame}>

              <Image style={styles.pauseButton} source={require(pauseButtonImg)} resizeMode="contain" resizeMethod="scale"/>

            </TouchableOpacity>

            <View style={styles.pointCounterContainer}>

              <Image style={styles.counterOwl} source={require(pointCounterImg)} resizeMode="contain" resizeMethod="scale"/>

              <View style={[styles.pointCounter, animateToNumber == 0 ? {alignItems: 'flex-start'} : {alignItems: 'center'}]}>

                <AnimatedNumbers
                  animateToNumber={animateToNumber}
                  fontStyle={styles.animatedNumbers}
                  animationDuration={500}
                />

              </View>

            </View>

            <View style={styles.topContainerElement}>

              <CountdownCircleTimer
                  isPlaying={!pauseState}
                  size = {screenWidth*0.11}
                  duration={timerDuration}
                  strokeWidth = {7} trailColor = {'#f89911'}
                  colors={['#299740', '#00bf63', '#C2F653', '#F1F044','#eb8b7b','#FF0E0E']}
                  colorsTime={[60, 40, 30, 20, 5, 0]}
                  onComplete = {onTimerComplete }
                  onUpdate = { (remainingTime) => { onTimerUpdate(remainingTime); }}
              >
                {({ remainingTime }) => (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {pauseState == true ? (<Text style={{opacity: 1, fontSize:20}}>{remainingTime}</Text>) : (
                      <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: translateYAnim }],
                      }}
                    >
                      <Text style={styles.timerText}>{remainingTime}</Text>
                    </Animated.View>)}
                  </View>
                )}

              </CountdownCircleTimer>

            </View>

          </View>

          <View style={styles.definitionContainer} onLayout={ (event) => { const { width } = event.nativeEvent.layout;
                                                                           setDefinitionContainerWidth(width);
                                                                           }}>

            <ImageBackground source={require(definitionBackgroundImg)} resizeMode="stretch" style={styles.definitionBackground}>

              <View style={styles.definitionBoundary}>

                <Text style={[styles.definitionText, styles.hintText, {fontSize: 0.05*definitionContainerWidth}]}>{definition}</Text>

              </View>

            </ImageBackground>

          </View>

          <View style={[styles.answerContainer]}>

            <ImageBackground source={require(answerBackgroundImg)} resizeMode="stretch" style={styles.answerBackground}>

              <View style={[styles.definitionBoundary,{width:"95%"}]} onLayout={ (event) => { const { width } = event.nativeEvent.layout;
                                                                               setAnswerContainerWidth(width);
                                                                               setAnswerFontSize(width*0.07);
                                                                               }}>

                <Text style={[styles.definitionText, styles.hintText, {fontSize: answerFontSize, letterSpacing: answerLetterSpacing , color: answerBackgroundColor}]}>{hint}</Text>

              </View>

            </ImageBackground>

          </View>

          <View style={styles.lettersContainer}>

            <View style={styles.rowOfLetters}>

              {missingCharacters.map((item, index) => {
                if (index < 5) {
                  return (

                    <TouchableOpacity key={index}
                      style={[lettersDisabledState[index]== true ? styles.disabledLetter : styles.workingLetter,
                             styles.letterToChoose, index == 4 ? {marginRight:0} : null]}
                             onPress={() => addLetter(item,index)}
                             disabled={lettersDisabledState[index]}>

                        <ImageBackground style={styles.optionLetterBackground} source={require(letterBackground)} resizeMode="contain">

                          <Text style={styles.definitionText}>{item}</Text>

                        </ImageBackground>

                    </TouchableOpacity>
                  );
                }
                return null;
              })}
            </View>

            <View style={styles.rowOfLetters}>

              {missingCharacters.map((item, index) => {
                if (index >= 5) {
                  return (

                    <TouchableOpacity key={index}
                      style={[lettersDisabledState[index]== true ? styles.disabledLetter : styles.workingLetter,
                             styles.letterToChoose, index == 9 ? {marginRight:0} : null]}
                             onPress={() => addLetter(item,index)}
                             disabled={lettersDisabledState[index]}>

                        <ImageBackground style={styles.optionLetterBackground} source={require(letterBackground)} resizeMode="contain">

                          <Text style={styles.definitionText}>{item}</Text>

                        </ImageBackground>

                    </TouchableOpacity>

                  );
                }
                return null;
              })}
            </View>

          </View>

          <View style={styles.buttonsContainer}>

            <TouchableOpacity style={[styles.buttonSkip, {opacity: skipButtonDisableState ? 0.4 : 1}]} onPress={() => checkAnswer(true, false)} disabled={skipButtonDisableState}>

              <Image style={{flex:1, width:"100%"}} source={require(skipButtonImg)} resizeMode="contain"/>

            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttonSubmit, {opacity: submitButtonDisableState ? 0.4 : 1}]} onPress={() => checkAnswer(false, false)} disabled={submitButtonDisableState}>

              <Text style={styles.submitButtonText}>SUBMIT</Text>

            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttonDelete, {opacity: backButtonDisableState ? 0.4 : 1}] } onPress={() => removeLetter()} disabled={backButtonDisableState}>

              <Image style={styles.deleteButtonImg} source={require(backButtonImg)} resizeMode="contain"/>

            </TouchableOpacity>

          </View>

        </View>

      </ImageBackground>

    </SafeAreaView>
  )
};

export function GameComponent(){

  const route = useRoute();

  const { levelName, tableName, language, isReview } = route.params;

  // const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  const [wordList, setWordList] = useState([]);

  const [remountKey, setRemountKey] = useState(0);

  const [highestScoreEnglish, setHighestScoreEnglish] = useState(0);

  const [highestScoreSpanish, setHighestScoreSpanish] = useState(0);

  const fetchWords = async () => {
    setIsLoading(true); // Set loading state to true before starting the query
    try {
      // Perform the database query
      let words = await queryWords(tableName, 60, levelName, 3);
      if ( words.length < 60 ){
        //This is in case the user already knows most words in this level
        //then some words that he/she already knows might be used during the game
        let wordsPadding = await queryWords(tableName,60 - words.length, levelName, 100);
        words = words.concat(wordsPadding);
      }
      // Create a promise that resolves after 1.5 seconds
      const delayPromise = new Promise((resolve) => {
        setTimeout(resolve, 300);
      });
      // Wait for both the query and the delay to complete before setting isLoading to false
      await Promise.all([words, delayPromise]);
      // Once the query is resolved, update the state with the results
      setWordList(words);
    } catch (error) {
      // Handle any errors that occurred during the query
      console.error(error);
    }
    finally {
      setIsLoading(false); // Set loading state to false after the query is completed
    }
  };

  const fetchWordsToReview = async () =>{
    setIsLoading(true); // Set loading state to true before starting the query
    try {
      // Perform the database query
      let words = await queryWordsToReview(tableName, 60, levelName, 1, 3 );
      if ( words.length < 60 ){
        // There are a few amount of words that the user either has seen and
        // still doesn't know, or that are already known and there is no need to review
        // either way, padding must be added because the timer stays the same
        let wordsPadding = await queryWordsToReview(tableName,60 - words.length, levelName, 4, 100);
        words = words.concat(wordsPadding);
        if ( words.length < 60 ){
          // if there are not enough words that the user has seen at least once,
          // then I must pad with new words
          let newPadding = await queryWordsToReview(tableName,60 - words.length, levelName, 0, 0);
          words = words.concat(newPadding);
        }
      }
      // Create a promise that resolves after 1.5 seconds
      const delayPromise = new Promise((resolve) => {
        setTimeout(resolve, 300);
      });
      // Wait for both the query and the delay to complete before setting isLoading to false
      await Promise.all([words, delayPromise]);
      // Once the query is resolved, update the state with the results
      setWordList(words);
    } catch (error) {
      // Handle any errors that occurred during the query
      console.error(error);
    }
    finally {
      setIsLoading(false); // Set loading state to false after the query is completed
    }
  }

  const restartGameComponent = async () => {
    setRemountKey(prevKey => prevKey + 1);
    setIsLoading(true);
    setWordList([]);
    await fetchWords();
  };

  useEffect(() => {
    if (isReview) {fetchWordsToReview();}
    else {fetchWords();}
  }, [remountKey]);

  useEffect(() =>{
    const keys = ['maxScoreEnglish', 'maxScoreSpanish'];
    // Retrieve values associated with the keys
    AsyncStorage.multiGet(keys)
      .then((result) => {
        // 'result' is an array of key-value pairs
        for (let i = 0; i < result.length; i++) {
          const [key, value] = result[i];
          // Assign the values to the variables based on the keys
          if (key === 'maxScoreEnglish') {
            setHighestScoreEnglish(parseInt(value, 10));
          } else if (key === 'maxScoreSpanish') {
            setHighestScoreSpanish(parseInt(value, 10));
          }
        }
      })
      .catch((error) => {
        console.error('Error retrieving highest scores from AsyncStorage:', error);
      });
  },[]);

  return (
    <View key={remountKey} style = {styles.container}>
      { isLoading ? (<LoadingGameView />) : (<Game wordList={wordList}
                                                onRestart={restartGameComponent}
                                                highestScoreEnglish={highestScoreEnglish}
                                                highestScoreSpanish={highestScoreSpanish}
                                                lang={language}
                                                tableName={tableName}
                                                levelName = {levelName} />) }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
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
  layoverContainer:{
    flex:1,
    height:"100%",
    width:"100%",
    backgroundColor:"rgba(202, 223, 226, 0.85)",
    position:"absolute",
    top:0,
    left:0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  layoverStateView:{
    zIndex: 3
  },
  animatedNumbers:{
    fontSize: screenWidth*0.07,
    fontWeight: 'bold',
    color:"#be621d"
  },
  pausedViewContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    width:"70%",
    backgroundColor:'white',
    borderRadius:5,
    paddingTop:"5%",
    paddingBottom:"5%",
    opacity: 1,
    zIndex: 10,
    alignSelf:"center",
    height: screenHeight*0.5,

  },
  pausedStateButtonsContainer:{
    flex:3,
    width:"60%",
    justifyContent: 'center',
    alignItems: 'center',
    opacity:1
  },
  pausedTextContainer:{
    flex:1,
    width:"60%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameContainer:{
    flex:1,
    height:"100%",
    width:"100%",
    alignItems:"center",
    justifyContent:"center"
  },
  pausedText:{
    color:"gray",
    fontSize:30,
    fontWeight:900
  },
  pausedButton:{
    flex:1,
    marginBottom:"15%",
    width:"100%",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:10
  },
  pausedButtonText:{
    fontSize: 20,
    fontWeight:900,
    color:"white"
  },
  topContainer:{
    flex:1,
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:"2%"
  },
  topContainerElement:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    height:"100%"
  },
  pointCounterContainer:{
    flex:2,
    flexDirection:"row",
    alignItems: 'center',
    justifyContent: 'center',
    height:"100%",
  },
  pauseButtonContainer:{
    flex:1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    height:"100%",
  },
  pauseButton:{
    flex:1,
    width:"45%",
    marginLeft: "10%"
  },
  counterOwl:{
    flex:1,
    height:"60%",
    marginLeft:"10%",
  },
  pointCounter:{
    flex: 1,
    marginRight:"5%",
  },
  timerText:{
    fontSize:20
  },
  definitionBackground:{
    flex:1,
    height:"100%",
    width:"100%",
    alignItems:"center",
    justifyContent:"center",
    marginTop:"2%"
  },
  answerBackground:{
    flex:1,
    width:"100%",
    alignItems:"center",
    justifyContent:"center",
  },
  definitionContainer:{
    flex:4,
    width:screenWidth*0.85,
  },
  definitionBoundary:{
    width:"65%",
    flex: 1,
    alignItems:"center",
    justifyContent:"center",
    maxHeight:"80%"
  },
  definitionText:{
    fontWeight:"900",
    fontSize:25,
    color:"white",
    textAlign:"center",
    textShadowColor:"black",
    textShadowOffset:{"width":0, "height":0.3},
    textShadowRadius: 2,
  },
  hintText:{
    maxWidth:"100%",
    maxHeight:"100%"
  },
  optionLetterBackground:{
    flex:1,
    width:"100%",
    justifyContent:"center",
    alignItems:"center"
  },
  answerContainer:{
    flex:1,
    width: '90%',
    marginTop:"10%",
    marginBottom:"5%"
  },
  lettersContainer:{
    flex:2.5,
    width: '90%',
    height:"100%",
    marginTop:"5%"
  },
  buttonsContainer:{
    flex:2,
    flexDirection: "row",
    justifyContent:"space-between",
    width: '90%',
    alignItems:"flex-start",
    marginTop:"5%"
  },
  buttonSkip:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    height:"40%",
    elevation:10
  },
  buttonSubmit:{
    flex:2,
    backgroundColor: '#51b2b6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft:"5%",
    marginRight:"5%",
    height:"40%",
    borderRadius:10,
    elevation:10
  },
  buttonDelete:{
    flex:1,
    height:"40%",
    elevation:10
  },
  rowOfLetters:{
    flex:1,
    flexDirection: 'row',
    justifyContent:"space-between",
    marginBottom:"3%"
  },
  letterToChoose:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: "1%",
    width:"100%",
  },
  disabledLetter:{
    opacity: 0.5
  },
  workingLetter:{
    opacity: 1
  },
  submitButtonText:{
    color:"white",
    fontSize:25,
    fontWeight:900
  },
  deleteButtonImg:{
    flex:1,
    width:"100%"
  }
});
