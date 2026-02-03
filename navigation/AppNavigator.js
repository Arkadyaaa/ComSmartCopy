import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          
          gestureEnabled: false
        }}
      />
      <Stack.Screen name="Assessment" component={AssessmentScreen} />
      <Stack.Screen name="QuizAnswering" component={QuizAnswering} />
   
    </Stack.Navigator>
  );
}
