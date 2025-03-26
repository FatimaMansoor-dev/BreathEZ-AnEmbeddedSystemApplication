import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  Animated 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import 'react-native-gesture-handler';

// Home Screen Component
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('./assets/background.png')} 
        style={styles.backgroundImage}
      >
        <View style={styles.topContainer}>
          <Text style={styles.title}>BreatheEZ ⛅</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Breathe healthy and be healthy.</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://cdn.prod.website-files.com/6681cf21236d3ea9104f03a9/66a3a767262e90bcddd055a5_65f355fe26dc98f559183e4c_Air%2520Quality%2520Meter.webp' }} 
            style={styles.circularImage} 
          />
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Blank')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

// Main Screen Component
function BlankScreen() {
  const [sensorData, setSensorData] = useState([]);
  const sidebarWidth = Dimensions.get('window').width * 0.75;
  const sidebarAnim = useRef(new Animated.Value(sidebarWidth)).current;
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    fetch('http://192.168.0.103:3001/api/sensor-data')
      .then((response) => response.json())
      .then((data) => {
        setSensorData(data);
      })
      .catch((error) => {
        console.error('Error fetching sensor data:', error);
      });
  }, []);

  // Define labels and data arrays based on sensorData
  const labels = sensorData.map((entry) => entry.datetime.slice(11, 16));
  const temperatures = sensorData.map((entry) => entry.temperature);
  const humidities = sensorData.map((entry) => entry.humidity);

  // Chart configuration for the LineChart components
  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#6a3093',
    backgroundGradientTo: '#a044ff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#fff',
    },
  };

  // Get the most recent temperature
  const currentTemp =
    sensorData.length > 0 ? sensorData[sensorData.length - 1].temperature : null;

  // Sidebar toggle animation
  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(sidebarAnim, {
        toValue: sidebarWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={styles.blankScreenContainer}>
      {/* Temperature and Cloud Image Section */}
      <View style={styles.currentTempContainer}>
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Text style={styles.cityText}>Current Temperature</Text>
          {currentTemp !== null ? (
            <Text style={styles.tempText}>{currentTemp}°C</Text>
          ) : (
            <Text style={styles.tempText}>-- °C</Text>
          )}
          {/* Display cute cloud image from assets */}
          <Image 
            source={require('./assets/cutecloud.png')} 
            style={styles.cuteCloudImage} 
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.sidebarToggle} onPress={toggleSidebar}>
          <Text style={styles.sidebarToggleText}>Stats</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.blankScrollContent}>
        {/* Temperature Chart */}
        <Text style={styles.chartTitle}>Temperature Today</Text>
        {sensorData.length > 0 && (
          <LineChart
            data={{
              labels: labels,
              datasets: [{ data: temperatures }],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        )}

        {/* Humidity Chart */}
        <Text style={styles.chartTitle}>Humidity Today</Text>
        {sensorData.length > 0 && (
          <LineChart
            data={{
              labels: labels,
              datasets: [{ data: humidities }],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        )}
      </ScrollView>

      {/* Animated Sidebar Overlay */}
      {sidebarVisible && (
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
        >
          <Text style={styles.sidebarTitle}>Weekly Stats</Text>
          {/* Additional sidebar content can go here */}
          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={toggleSidebar}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

// Create a Stack Navigator
const Stack = createStackNavigator();

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Blank" 
          component={BlankScreen} 
          options={{ title: 'BreatheEZ Monitor ⛅' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  /* --------------- Home Screen Styles --------------- */
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  topContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    fontStyle: 'normal',
    fontFamily: 'sans-serif-condensed',
    letterSpacing: 2,
    color: '#333',
  },
  textContainer: {
    paddingHorizontal: 20,
  },
  text: {
    color: 'grey',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#B0B0B0',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 100,
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  button: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* --------------- Blank Screen Styles --------------- */
  blankScreenContainer: {
    flex: 1,
    backgroundColor: '#1E1B3A', // Purple/dark background
  },
  blankScrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
  },

  /* --------------- Current Temp Section --------------- */
  currentTempContainer: {
    marginTop: 50,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#2C2968',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
    opacity: 0.8,
  },
  tempText: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
  },

  /* --------------- Sidebar Styles --------------- */
  sidebarToggle: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sidebarToggleText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: Dimensions.get('window').width * 0.75,
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  sidebarText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  cuteCloudImage: {
    width: 120,
    height: 120,
    marginTop: 10,
  },
});
