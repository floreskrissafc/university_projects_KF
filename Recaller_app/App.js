import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreenComponent from './components/HomeScreenComponent.js';
import GamingScreenComponent from './components/GamingScreenComponent.js';
import InstructionScreenComponent from './components/InstructionScreenComponent.js';
import StatsScreenComponent from './components/StatsScreenComponent.js';

const Stack = createNativeStackNavigator();

function HomeScreen({navigation}) {
  return (<HomeScreenComponent/>);
}

function InstructionsScreen({navigation, route}) {
  return (<InstructionScreenComponent navigation={navigation}/>);
}

function GamingScreen({navigation}){
  return (<GamingScreenComponent/>);
}

function StatsScreen({route, navigation}){
  return (<StatsScreenComponent route={route} navigation={navigation}/>);
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{headerShown: false}} component={HomeScreen} />
        <Stack.Screen name="Instructions" component={InstructionsScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Game" options={{headerShown: false}} component={GamingScreen} />
        <Stack.Screen name="Stats" options={{headerShown: false}} component={StatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
