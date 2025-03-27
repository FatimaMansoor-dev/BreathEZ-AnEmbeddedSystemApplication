import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;

//
// Home Screen Component
//
function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={homeStyles.container}>
      <Image
        source={require('./assets/background.png')}
        style={homeStyles.backgroundImage}
      />
      <View style={homeStyles.overlay}>
        <Text style={homeStyles.title}>BreatheEZ ⛅</Text>
        <Text style={homeStyles.subtitle}>Breathe healthy and be healthy</Text>
        <TouchableOpacity
          style={homeStyles.button}
          onPress={() => navigation.navigate('Weather')}
        >
          <Text style={homeStyles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//
// Weather Screen Component
//
function WeatherScreen() {
  // State for sensor data and current temperature
  const [sensorData, setSensorData] = useState([]);
  const [currentTemp, setCurrentTemp] = useState('--');
  // State for current page index (outer scroll view)
  const [activePage, setActivePage] = useState(0);
  // State for active forecast card index (center card in inner scroll view)
  const [activeForecastIndex, setActiveForecastIndex] = useState(0);

  // Animated values for cloud effects:
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  // Continuous floating animation for the cloud image
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateAnim]);

  // Fetch sensor data from your backend
  useEffect(() => {
    fetch('http://192.168.0.102:3001/api/sensor-data')
      .then((response) => response.json())
      .then((data) => {
        setSensorData(data);
        if (data.length > 0) {
          const lastEntry = data[data.length - 1];
          setCurrentTemp(lastEntry.temperature);
        }
      })
      .catch((error) => {
        console.error('Error fetching sensor data:', error);
      });
  }, []);

  // Helper to format date/time with date on one line and time on the next
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dateOptions = { month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const datePart = date.toLocaleDateString('en-US', dateOptions);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);
    return `${datePart}\n${timePart}`;
  };

  // Prepare forecast cards data for 24 hours.
  const forecastData = (() => {
    if (sensorData.length === 0) return [];
    // Get the date (YYYY-MM-DD) of the most recent sensor entry.
    const lastEntryDate = new Date(sensorData[sensorData.length - 1].datetime)
      .toISOString()
      .split('T')[0];
    // Filter sensorData to include only entries from the most recent day.
    let dataForDay = sensorData.filter((entry) =>
      entry.datetime.startsWith(lastEntryDate)
    );
    // If there are not enough entries for the most recent day, use the last 24 entries.
    if (dataForDay.length < 24) {
      dataForDay = sensorData.slice(-24);
    }
    return dataForDay.map((entry, index) => ({
      key: `${formatDateTime(entry.datetime)}-${index}`,
      icon: '⛅',
      temp: `${entry.temperature}°`,
    }));
  })();

  // Prepare data for charts (using all sensorData)
  const temperatureData = sensorData.map((entry) => entry.temperature);
  const humidityData = sensorData.map((entry) => entry.humidity);
  const chartLabels = sensorData.map((entry) =>
    entry.datetime ? entry.datetime.slice(11, 16) : ''
  );

  // Chart configuration with transparent background
  const chartConfig = {
    backgroundGradientFrom: '#654ea3',
    backgroundGradientTo: '#eaafc8',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#fff',
    },
    propsForBackgroundLines: {
      stroke: 'transparent',
    },
  };

  // Handlers for cloud press effect (scale)
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Handler for outer scroll events to update activePage state
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    setActivePage(pageIndex);
  };

  // Handler for inner forecast cards scroll events to update activeForecastIndex.
  // It calculates which card is centered in the viewport.
  const handleForecastScroll = (event) => {
    const containerWidth = SCREEN_WIDTH - 20;
    const effectiveCardWidth = 106; // Card width (90) plus marginRight (16)
    const offsetX = event.nativeEvent.contentOffset.x;
    const centerPosition = offsetX + containerWidth / 2;
    const index = Math.floor(centerPosition / effectiveCardWidth);
    setActiveForecastIndex(index);
  };

  return (
    <SafeAreaView style={weatherStyles.container}>
      {/* Outer Horizontal ScrollView for pages */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {/* Page 1: Weather Info & Forecast Cards */}
        <View style={{ width: SCREEN_WIDTH }}>
          <LinearGradient
            colors={['#654ea3', '#eaafc8']}
            style={weatherStyles.gradientBackground}
          >
            {/* Top Section */}
            <View style={weatherStyles.topSection}>
              <Text style={weatherStyles.cityText}>Karachi, PK</Text>
              <Text style={weatherStyles.currentTempText}>
                {currentTemp !== null ? `${currentTemp}°` : '--°'}
              </Text>
              <Text style={weatherStyles.conditionText}>Mostly Clear</Text>
              <Text style={weatherStyles.highLowText}>H: 35°  L: 25°</Text>
              <View style={weatherStyles.cloudContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  <Animated.Image
                    source={require('./assets/cutecloud.png')}
                    style={[
                      weatherStyles.cuteCloudImage,
                      {
                        transform: [
                          { scale: scaleAnim },
                          { translateY: translateAnim },
                        ],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={weatherStyles.lightningEmoji}>⚡</Text>
              </View>
            </View>
            {/* Forecast Cards Row */}
            <View style={{ height: 160, marginTop: 20, paddingHorizontal: 10 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                onScroll={handleForecastScroll}
                scrollEventThrottle={16}
              >
                {forecastData.length > 0 ? (
                  forecastData.map((item, index) => (
                    <View
                      key={item.key}
                      style={[
                        weatherStyles.forecastItem,
                        activeForecastIndex === index &&
                          weatherStyles.forecastItemActive,
                      ]}
                    >
                      <Text style={weatherStyles.forecastTime}>
                        {item.key.split('-')[0]}
                      </Text>
                      <Text style={weatherStyles.forecastIcon}>{item.icon}</Text>
                      <Text style={weatherStyles.forecastTemp}>{item.temp}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#fff', padding: 20 }}>
                    No forecast data available.
                  </Text>
                )}
              </ScrollView>
            </View>
          </LinearGradient>
        </View>

        {/* Page 2: Temperature Chart */}
        <View style={{ width: SCREEN_WIDTH }}>
          <LinearGradient
            colors={['#654ea3', '#eaafc8']}
            style={weatherStyles.gradientBackground}
          >
            <View style={weatherStyles.chartContainer}>
              <Text style={weatherStyles.chartLabel}>Temperature</Text>
              {temperatureData.length > 0 ? (
                <LineChart
                  data={{
                    labels: chartLabels,
                    datasets: [{ data: temperatureData }],
                  }}
                  width={SCREEN_WIDTH * 0.9}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={[weatherStyles.chartStyle, { alignSelf: 'center' }]}
                />
              ) : (
                <Text style={{ color: '#fff', marginBottom: 10 }}>
                  No temperature data available.
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Page 3: Humidity Chart */}
        <View style={{ width: SCREEN_WIDTH }}>
          <LinearGradient
            colors={['#654ea3', '#eaafc8']}
            style={weatherStyles.gradientBackground}
          >
            <View style={weatherStyles.chartContainer}>
              <Text style={weatherStyles.chartLabel}>Humidity</Text>
              {humidityData.length > 0 ? (
                <LineChart
                  data={{
                    labels: chartLabels,
                    datasets: [{ data: humidityData }],
                  }}
                  width={SCREEN_WIDTH * 0.9}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={[weatherStyles.chartStyle, { alignSelf: 'center' }]}
                />
              ) : (
                <Text style={{ color: '#fff', marginBottom: 10 }}>
                  No humidity data available.
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={weatherStyles.paginationContainer}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              weatherStyles.dot,
              { opacity: activePage === index ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

//
// Stack Navigator
//
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Weather" component={WeatherScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//
// Home Screen Styles
//
const homeStyles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  title: { fontSize: 44, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  subtitle: { fontSize: 20, color: '#fff', marginBottom: 40 },
  button: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  buttonText: { fontSize: 18, color: '#333' },
});

//
// Weather Screen Styles
//
const weatherStyles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  gradientBackground: { flex: 1, alignItems: 'center', paddingBottom: 20 },
  topSection: { marginTop: 40, alignItems: 'center' },
  cityText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'serif',
    margin: 30,
  },
  currentTempText: { fontSize: 64, color: '#fff', fontWeight: 'bold' },
  conditionText: { fontSize: 18, color: '#fff', marginTop: 8 },
  highLowText: { fontSize: 16, color: '#fff', marginTop: 4, opacity: 0.8 },
  cloudContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  cuteCloudImage: { width: 300, height: 300 },
  lightningEmoji: { fontSize: 56, marginLeft: -45, marginTop: 10 },
  forecastItem: {
    width: 90,
    height: 150,
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 8,
  },
  forecastTime: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  forecastIcon: { fontSize: 24, marginBottom: 4 },
  forecastTemp: { color: '#fff', fontSize: 16, fontWeight: '600' },
  forecastItemActive: {
    borderColor: 'yellow',
    borderWidth: 2,
    transform: [{ scale: 1 }],
  },
  chartContainer: { marginTop: 20, alignItems: 'center', marginBottom: 30, width: 300 },
  chartLabel: { fontSize: 16, color: '#fff', marginBottom: 10 },
  chartStyle: { marginVertical: 8, borderRadius: 16 },
  paginationContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
    marginHorizontal: 5,
  },
});
