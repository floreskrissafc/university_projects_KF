import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ImageBackground, Image, TouchableOpacity} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeComponent} from './components/HomeComponent.js';
import { GameComponent} from './components/GameComponent.js';
import { StatsComponent} from './components/StatsComponent.js';
import { YourGamesComponent} from './components/YourGamesComponent.js';
import { GameLevelsComponent} from './components/GameLevelsComponent.js';
import { StreaksComponent } from './components/StreaksComponent.js';
import Instructions from './components/Instructions';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <HomeComponent navigation={navigation}/>
  );
};

function GamingScreen({ navigation, route }) {
  return (
    <GameComponent navigation={navigation}/>
  );
};

function StatsScreen({ navigation, route }) {
  return (
    <StatsComponent navigation={navigation}/>
  );
};

function YourGamesScreen({ navigation, route }){
  return (
    <YourGamesComponent navigation={navigation}/>
  );
}

function GameLevelsScreen({navigation, route}){
  return (
    <GameLevelsComponent navigation={navigation}/>
  );
}

function StreaksScreen({navigation, route}){
  return (
    <StreaksComponent navigation={navigation}/>
  );
}

function InstructionsScreen({navigation, route}){
  return (
    <Instructions navigation={navigation}/>
  );
}

export default function App() {
  return (
    <NavigationContainer>

      <Stack.Navigator initialRouteName="Home">

        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="Game" component={GamingScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="Stats" component={StatsScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="YourGames" component={YourGamesScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="GameLevels" component={GameLevelsScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="Streaks" component={StreaksScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="Instructions" component={InstructionsScreen} options={{ headerShown: false }}/>

      </Stack.Navigator>

    </NavigationContainer>
  );
}
