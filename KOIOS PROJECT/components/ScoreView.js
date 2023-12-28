import { StyleSheet, Text, View} from 'react-native';
/** Component that shows the score achieved during the game, when the game has finished**/
export const ScoreView = (props) => {
  const scoreArray = props.values;
  return (
    <View  style={styles.container}>
      {scoreArray.map((val, index) => (
        <View key={index} style={[styles.scoreContainer, index != 4 ? { marginRight:3} : {marginRight : 0} ]}>
          <Text style={styles.scoreNumber}>
            {val}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    flexDirection:"row"
  },
  scoreContainer:{
    backgroundColor: "white",
    flex: 1,
    justifyContent:"center",
    alignItems:"center",
    marginBottom:"10%",
    borderWidth:1,
    borderColor:"black"
  },
  scoreNumber:{
    fontSize: 50,
    color: "red",
    fontWeight: 900,
    textAlign: "center",
    textShadowColor:'#585858',
    textShadowOffset:{width: 2, height: 2},
    textShadowRadius:10
  }
});
