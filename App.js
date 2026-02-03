import 'react-native-gesture-handler'; // This must be the first line
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// --- Screen Imports ---
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';

// Chapter screens removed - now using LearningMaterialsScreen for all chapters

import DashboardScreen from './screens/dashboard/DashboardScreen';
import AssessmentScreen from './screens/dashboard/assessment-module/AssessmentScreen';
import PCRecommendationScreen from './screens/dashboard/PCRecommendationScreen';
import HardwareAssembly from './screens/dashboard/HardwareAssembly';
import UserAccountScreen from './screens/dashboard/UserAccountScreen';
import ContactScreen from './screens/dashboard/ContactScreen';
import HelpScreen from './screens/dashboard/HelpScreen';
import NotificationScreenWithSidebar from './screens/dashboard/NotificationScreenWithSidebar';
import LearningMaterialsScreen from './screens/dashboard/LearningMaterialsScreen';
import QuizAnswering from './screens/dashboard/assessment-module/quiz/QuizAnswering';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="LearningMaterials" component={LearningMaterialsScreen} />

        <Stack.Screen name="Assessment" component={AssessmentScreen} />
        <Stack.Screen name="PCRecommendation" component={PCRecommendationScreen} />
        <Stack.Screen name="HardwareAssembly" component={HardwareAssembly} />
        <Stack.Screen name="UserAccount" component={UserAccountScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Notification" component={NotificationScreenWithSidebar} />
        <Stack.Screen name="QuizAnswering" component={QuizAnswering} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});