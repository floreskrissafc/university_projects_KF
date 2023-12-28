import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView,
         ActivityIndicator, ImageBackground,
         Image, TouchableOpacity, Dimensions} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { calculateLongestStreak, getSortedUniqueDates,
         calculateCurrentStreak, getPracticedTime} from '../database.js';
import {Calendar} from 'react-native-calendars';


const backgroundImg = '../assets/images/backgrounds/9.png';

const homeLogo = '../assets/images/square_imgs/home.png';

const screenWidth = Dimensions.get("window").width;

const getTimePracticedString =(time)=>{
  let hours = 0;
  let minutes = 0;
  let hourStr = "hour";
  let minuteStr = "minute";
  if ( time >= 60 ){
    hours = Math.trunc(time / 60);
    minutes = time - hours * 60;
  } else {
    minutes = time;
  }
  if ( hours > 1){ hourStr = "hours"}
  if ( minutes > 1) { minuteStr = "minutes"}
  let str = "";
  if ( hours > 0 ){
    return str.concat("",hours).concat(" ",hourStr).concat(" ",minutes).concat(" ",minuteStr);
  } else {
    return str.concat("",minutes).concat(" ",minuteStr);
  }
};

const createPracticedDatesObj = (datesArray)=>{
  const customStylesObject = datesArray.reduce((result, date) => {
    const dateString = date.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    result[dateString] = {
      customStyles: {
        container: {
          backgroundColor: "green",
          elevation: 2
        },
        text: {
          color: "white",
          fontWeight:800
        },
        selected: true
      }
    };
    return result;
  }, {});
  return customStylesObject;
};

export function StreaksComponent() {

  const route = useRoute();

  const navigation = useNavigation();

  const {language} = route.params;

  const [isLoading, setIsLoading] = useState(false);

  const [longestStreak, setLongestStreak] = useState(0);

  const [currentStreak, setCurrentStreak] = useState(0);

  const [practicedTime, setPracticedTime] = useState("");

  const [practicedDatesObj, setPracticedDatesObj] = useState({});

  const [practicedDaysNumber, setPracticedDaysNumber] = useState(0);

  const pressHomeLogo =() =>{
    navigation.replace('Home', {});
  };

  useEffect(() => {

    const  initialize = async()=>{

      let dates = await getSortedUniqueDates();

      setLongestStreak(calculateLongestStreak(dates));

      setCurrentStreak(calculateCurrentStreak(dates));

      let practicedTime = await getPracticedTime();

      setPracticedTime(getTimePracticedString(practicedTime));

      setPracticedDatesObj(createPracticedDatesObj(dates));

      setPracticedDaysNumber(dates.length);
    }

    initialize();

  }, []);

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
                  <Text style={styles.headerTitle}>Your Streaks</Text>
                </View>
                <TouchableOpacity style={styles.userButton} onPress={ pressHomeLogo }>
                  <Image source={require(homeLogo)} style={styles.topLogos} resizeMode="contain"/>
                </TouchableOpacity>
              </View>
              <View style={styles.content}>
                <View style={styles.contentItem}>
                  <View style={styles.contentItemTitleWrapper}>
                    <Text style={styles.contentItemTitle}>Longest Streak</Text>
                  </View>
                  <View style={styles.contentItemInfoWrapper}>
                    <Text style={styles.contentItemInfo}>{longestStreak}{longestStreak > 1 ? " days" : " day"}</Text>
                  </View>
                </View>

                <View style={styles.contentItem}>
                  <View style={styles.contentItemTitleWrapper}>
                    <Text style={styles.contentItemTitle}>Current Streak</Text>
                  </View>
                  <View style={styles.contentItemInfoWrapper}>
                    <Text style={styles.contentItemInfo}>{currentStreak}{currentStreak == 1 ? " day" : " days"}</Text>
                  </View>
                </View>

                <View style={styles.contentItem}>
                  <View style={styles.contentItemTitleWrapper}>
                    <Text style={styles.contentItemTitle}>Practiced Time</Text>
                  </View>
                  <View style={styles.contentItemInfoWrapper}>
                    <Text style={styles.contentItemInfo}>{practicedTime}</Text>
                  </View>
                </View>
                <View style={{width:"100%"}}>
                  <View style={[styles.contentItem, {borderBottomWidth:0, marginBottom:15}]}>
                    <View style={styles.contentItemTitleWrapper}>
                      <Text style={styles.contentItemTitle}>Practiced days</Text>
                    </View>
                    <View style={styles.contentItemInfoWrapper}>
                      <Text style={styles.contentItemInfo}>{practicedDaysNumber}{practicedDaysNumber == 1 ? " day" : " days"}</Text>
                    </View>
                  </View>
                  <View >
                    <Calendar
                      markedDates={practicedDatesObj}
                      markingType={'custom'}
                      style={styles.calendar}
                    />
                  </View>
                </View>


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
    width:"85%",
    alignItems: 'flex-start',
    marginTop:screenWidth*0.06,
  },
  mainContent:{
    width:"100%",
    height:"100%",
    alignItems:"center"
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
  userButton:{
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  },
  topLogos:{
    maxWidth:"60%",
    maxHeight:"60%",
  },
  contentItem:{
    flexDirection:"row",
    width:"100%",
    borderBottomWidth:1,
    borderBottomColor:"gray",
    paddingTop:screenWidth*0.05,
    paddingBottom:screenWidth*0.05,
    paddingRight: screenWidth*0.05,
    paddingLeft: screenWidth*0.05,
  },
  contentItemTitleWrapper:{
    marginRight:screenWidth*0.09
  },
  contentItemTitle:{
    fontSize: screenWidth*0.04,
    fontWeight: 800,
    color:"#757AAA"
  },
  contentItemInfoWrapper:{
  },
  contentItemInfo:{
    fontSize: screenWidth*0.04,
    fontWeight: 700,
    color:"#B22222"
  },
  calendar:{
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#757AAA',
    paddingBottom:10,
    paddingLeft:10,
    paddingRight:10,
    width:"90%",
    alignSelf:"center"
  }
});
