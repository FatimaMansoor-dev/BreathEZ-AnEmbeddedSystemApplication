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
  Pressable,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import LottieView from 'lottie-react-native';
import Svg, { Rect } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;

//
// GlowingBorderWrapper Component (optional)
//
function GlowingBorderWrapper({ children, style }) {
  const dashOffset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(dashOffset, {
        toValue: 100,
        duration: 3000,
        useNativeDriver: false,
      })
    ).start();
  }, [dashOffset]);
  return (
    <View style={[{ position: 'relative' }, style]}>
      {children}
      <Svg height="100%" width="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        <AnimatedRect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="#ff00ff"
          strokeWidth="3"
          strokeDasharray="10,5"
          strokeDashoffset={dashOffset}
        />
      </Svg>
    </View>
  );
}
const AnimatedRect = Animated.createAnimatedComponent(Rect);

//
// PageHeader Component (Reusable header for analysis pages)
//
function PageHeader({ title, iconUri }) {
  return (
    <LinearGradient colors={['#00008B', '#00008B']} style={headerStyles.container}>
      {iconUri && (
        <Image source={{ uri: iconUri }} style={headerStyles.icon} resizeMode="contain" />
      )}
      <Text style={headerStyles.title}>{title}</Text>
    </LinearGradient>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    backgroundColor: '#00008B',
  },
  icon: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});

//
// Home Screen Component
//
function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={homeStyles.container}>
      <Image source={require('./assets/background.png')} style={homeStyles.backgroundImage} />
      <View style={homeStyles.overlay}>
        <Text style={homeStyles.title}>BreatheEZ ⛅</Text>
        <Text style={homeStyles.subtitle}>Breathe healthy and be healthy</Text>
        <TouchableOpacity style={homeStyles.button} onPress={() => navigation.navigate('Weather')}>
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
  const [sensorData, setSensorData] = useState([]);
  const [currentTemp, setCurrentTemp] = useState('--');
  const [activePage, setActivePage] = useState(0);
  const [activeForecastIndex, setActiveForecastIndex] = useState(0);

  // Animated values for cloud and chart effects
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const tempChartScale = useRef(new Animated.Value(0.9)).current;
  const humChartScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateAnim, { toValue: -10, duration: 1000, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [translateAnim]);

  useEffect(() => {
    Animated.spring(tempChartScale, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
    Animated.spring(humChartScale, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
  }, [tempChartScale, humChartScale]);

  // Fetch sensor data from server
  useEffect(() => {
    fetch('http://192.168.241.3:4000/api/sensor')
      .then((response) => response.json())
      .then((data) => {
        setSensorData(data);
        if (data.length > 0) setCurrentTemp(data[data.length - 1].temperature);
      })
      .catch((error) => console.error('Error fetching sensor data:', error));
  }, []);

  // Helper to format the date-time string for other uses
  function formatDateTime(isoString) {
    if (!isoString) return '';
    const [datePart, timePartWithZ] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [timePart] = timePartWithZ.split('.');
    const [hourStr, minuteStr] = timePart.split(':');
    const hourNum = parseInt(hourStr, 10);
    const minuteNum = parseInt(minuteStr, 10);
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const shortMonth = shortMonths[parseInt(month, 10) - 1];
    const hour12 = hourNum % 12 || 12;
    const ampm = hourNum < 12 ? 'AM' : 'PM';
    return `${shortMonth} ${parseInt(day, 10)} ${hour12}:${String(minuteNum).padStart(2, '0')} ${ampm}`;
  }

  // New helper to format forecast time in two lines: date on one line, hour on the next.
  function formatForecastTime(isoString) {
    if (!isoString) return '';
    const [datePart, timePartWithZ] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [timePart] = timePartWithZ.split('.');
    const [hourStr, minuteStr] = timePart.split(':');
    const hourNum = parseInt(hourStr, 10);
    const minuteNum = parseInt(minuteStr, 10);
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const shortMonth = shortMonths[parseInt(month, 10) - 1];
    const hour12 = hourNum % 12 || 12;
    const ampm = hourNum < 12 ? 'AM' : 'PM';

    // First line: date, second line: time and AM/PM.
    return `${shortMonth} ${parseInt(day, 10)}\n${hour12}:${String(minuteNum).padStart(2, '0')} ${ampm}`;
  }

  // Prepare forecast data using the new formatForecastTime
  const forecastData = (() => {
    if (sensorData.length === 0) return [];
    const lastEntryLocalDate = new Date(sensorData[sensorData.length - 1].datetime).toLocaleDateString();
    let dataForDay = sensorData.filter(
      (entry) => new Date(entry.datetime).toLocaleDateString() === lastEntryLocalDate
    );
    if (dataForDay.length < 24) dataForDay = sensorData.slice(-24);
    return dataForDay.map((entry, index) => ({
      // Use a unique key based on the datetime and the index.
      key: `${entry.datetime}-${index}`,
      // Use the new multi-line display.
      displayDateTime: formatForecastTime(entry.datetime),
      icon: '⛅',
      temp: `${entry.temperature}°`,
    }));
  })();

  const getDailyAverages = (key) => {
    if (sensorData.length === 0) return [];
    const groups = sensorData.reduce((acc, entry) => {
      const date = new Date(entry.datetime).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry[key]);
      return acc;
    }, {});
    let dailyAvg = Object.entries(groups).map(([date, arr]) => ({
      date,
      avg: arr.reduce((sum, t) => sum + t, 0) / arr.length,
    }));
    dailyAvg.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (dailyAvg.length > 7) dailyAvg = dailyAvg.slice(-7);
    return dailyAvg;
  };

  const dailyAveragesTemp = getDailyAverages('temperature');
  const dailyAveragesHum = getDailyAverages('humidity');

  const formatLabel = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    const dateObj = new Date(`${year}-${month}-${day}`);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const temperatureDataForChart = dailyAveragesTemp.map((entry) => entry.avg);
  const chartLabelsForTemp = dailyAveragesTemp.map((entry) => formatLabel(entry.date));
  const humidityDataForChart = dailyAveragesHum.map((entry) => entry.avg);
  const chartLabelsForHum = dailyAveragesHum.map((entry) => formatLabel(entry.date));

  // Chart configuration for both charts.
  const chartConfig = {
    backgroundGradientFrom: '#00008B',
    backgroundGradientTo: '#00008B',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    fillShadowGradient: '#0000FF', // fill remains unchanged
    fillShadowGradientOpacity: 0.9,
    withInnerLines: false,
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#00D2FF' },
    propsForBackgroundLines: { stroke: 'transparent' },
    style: { borderRadius: 16 },
    yAxisMin: 10,
    yAxisMax: 50,
  };

  // Determine temperature extremes.
  let hottestDay = null, coldestDay = null;
  if (dailyAveragesTemp.length > 0) {
    hottestDay = dailyAveragesTemp.reduce((max, entry) => (entry.avg > max.avg ? entry : max), dailyAveragesTemp[0]);
    coldestDay = dailyAveragesTemp.reduce((min, entry) => (entry.avg < min.avg ? entry : min), dailyAveragesTemp[0]);
  }
  let maxTempEntry = null;
  if (sensorData.length > 0) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekData = sensorData.filter((entry) => new Date(entry.datetime) >= weekAgo);
    maxTempEntry = weekData.reduce((max, entry) => (!max || entry.temperature > max.temperature ? entry : max), null);
  }

  // Determine humidity extremes.
  let mostHumidDay = null, leastHumidDay = null;
  if (dailyAveragesHum.length > 0) {
    mostHumidDay = dailyAveragesHum.reduce((max, entry) => (entry.avg > max.avg ? entry : max), dailyAveragesHum[0]);
    leastHumidDay = dailyAveragesHum.reduce((min, entry) => (entry.avg < min.avg ? entry : min), dailyAveragesHum[0]);
  }
  let maxHumEntry = null;
  if (sensorData.length > 0) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekData = sensorData.filter((entry) => new Date(entry.datetime) >= weekAgo);
    maxHumEntry = weekData.reduce((max, entry) => (!max || entry.humidity > max.humidity ? entry : max), null);
  }

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 1.1, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };
  const onTempChartPressIn = () => {
    Animated.spring(tempChartScale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onTempChartPressOut = () => {
    Animated.spring(tempChartScale, { toValue: 1, useNativeDriver: true }).start();
  };
  const onHumChartPressIn = () => {
    Animated.spring(humChartScale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onHumChartPressOut = () => {
    Animated.spring(humChartScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleScroll = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActivePage(pageIndex);
  };
  const handleForecastScroll = (event) => {
    const containerWidth = SCREEN_WIDTH - 20;
    const effectiveCardWidth = 106;
    const centerPosition = event.nativeEvent.contentOffset.x + containerWidth / 2;
    const index = Math.floor(centerPosition / effectiveCardWidth);
    setActiveForecastIndex(index);
  };

  return (
    <SafeAreaView style={weatherStyles.container}>
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
          <LinearGradient colors={['#00008B', '#00008B']} style={weatherStyles.gradientBackground}>
            <View style={weatherStyles.topSection}>
              <Text style={weatherStyles.cityText}>Karachi, PK</Text>
              <Text style={weatherStyles.currentTempText}>
                {currentTemp !== null ? `${currentTemp}°` : '--°'}
              </Text>
              <Text style={weatherStyles.conditionText}>Mostly Clear</Text>
              <Text style={weatherStyles.highLowText}>H: 35°  L: 25°</Text>
              <View style={weatherStyles.cloudContainer}>
                <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                  <Animated.Image
                    source={require('./assets/cutecloud.png')}
                    style={[weatherStyles.cuteCloudImage, { transform: [{ scale: scaleAnim }, { translateY: translateAnim }] }]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={weatherStyles.lightningEmoji}>⚡</Text>
              </View>
            </View>
            <View style={{ height: 160, marginTop: 20, paddingHorizontal: 10 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                onScroll={handleForecastScroll}
                scrollEventThrottle={16}
              >
                {forecastData.length > 0 ? (
                  forecastData.map((item, index) => (
                    <View
                      key={item.key}
                      style={[
                        weatherStyles.forecastItem,
                        activeForecastIndex === index && weatherStyles.forecastItemActive
                      ]}
                    >
                      <Text style={weatherStyles.forecastTime}>{item.displayDateTime}</Text>
                      <Text style={weatherStyles.forecastIcon}>{item.icon}</Text>
                      <Text style={weatherStyles.forecastTemp}>{item.temp}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#fff', padding: 20 }}>No forecast data available.</Text>
                )}
              </ScrollView>
            </View>
          </LinearGradient>
        </View>

        {/* Page 2: Temperature Analysis */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <LinearGradient colors={['#00008B', '#00008B']} style={[weatherStyles.gradientBackground, { justifyContent: 'flex-start', paddingTop: 50 }]}>
            <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
              <PageHeader title="Temperature Analysis" iconUri="https://img.icons8.com/fluency/48/000000/sun--v1.png" />
              <View style={{ alignItems: 'center', marginVertical: 10, backgroundColor: 'lightgray' }}>
                <LottieView
                  source={{ uri: "https://lottie.host/063ecede-299d-44f1-83f5-ea20a5882062/5QC8QAUncD.lottie" }}
                  autoPlay
                  loop
                  speed={0.5}
                  style={{ width: SCREEN_WIDTH * 0.9, height: 200, backgroundColor: '#00008B' }}
                />
              </View>
            </View>
            <View style={{ width: SCREEN_WIDTH * 0.95, alignSelf: 'center' }}>
              {dailyAveragesTemp.length > 0 ? (
                <>
                  <Pressable onPressIn={onTempChartPressIn} onPressOut={onTempChartPressOut}>
                    <Animated.View style={{ transform: [{ scale: tempChartScale }] }}>
                      <LineChart
                        data={{ labels: chartLabelsForTemp, datasets: [{ data: temperatureDataForChart }] }}
                        width={SCREEN_WIDTH * 0.99}
                        height={400}
                        chartConfig={chartConfig}
                        bezier
                        withInnerLines={false}
                        style={[weatherStyles.chartStyle, { alignSelf: 'center', borderRadius: 16 }]}
                      />
                    </Animated.View>
                  </Pressable>
                  <View style={weatherStyles.extremesContainer}>
                    {hottestDay && (
                      <View style={weatherStyles.extremeItem}>
                        <Text style={weatherStyles.extremeLabel}>Hottest</Text>
                        <Text style={weatherStyles.extremeValue}>
                          {formatLabel(hottestDay.date)} ({hottestDay.avg.toFixed(1)}°)
                        </Text>
                      </View>
                    )}
                    {coldestDay && (
                      <View style={weatherStyles.extremeItem}>
                        <Text style={weatherStyles.extremeLabel}>Coldest</Text>
                        <Text style={weatherStyles.extremeValue}>
                          {formatLabel(coldestDay.date)} ({coldestDay.avg.toFixed(1)}°)
                        </Text>
                      </View>
                    )}
                  </View>
                  {maxTempEntry && (
                    <View style={weatherStyles.maxTempContainer}>
                      <Text style={weatherStyles.maxTempLabel}>Maximum Temperature This Week</Text>
                      <Text style={weatherStyles.maxTempValue}>
                        {formatDateTime(maxTempEntry.datetime)} ({maxTempEntry.temperature}°)
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={{ color: '#fff', marginBottom: 10, textAlign: 'center' }}>
                  No temperature data available.
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Page 3: Humidity Analysis */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <LinearGradient colors={['#00008B', '#00008B']} style={[weatherStyles.gradientBackground, { justifyContent: 'flex-start', paddingTop: 50 }]}>
            <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
              <PageHeader title="Humidity Analysis" iconUri="https://img.icons8.com/fluency/48/000000/wet.png" />
              <View style={{ alignItems: 'center', marginVertical: 0, backgroundColor: 'lightgray' }}>
                <LottieView
                  source={{ uri: "https://lottie.host/1e1be7bb-7868-4386-a9bb-2c7050129000/NZ3hqcg7Up.lottie" }}
                  autoPlay
                  loop
                  speed={3}
                  style={{ width: SCREEN_WIDTH * 0.9, height: 220, backgroundColor: '#00008B' }}
                />
              </View>
            </View>
            <View style={{ width: SCREEN_WIDTH * 0.99, alignSelf: 'center' }}>
              {dailyAveragesHum.length > 0 ? (
                <>
                  <Pressable onPressIn={onHumChartPressIn} onPressOut={onHumChartPressOut}>
                    <Animated.View style={{ transform: [{ scale: humChartScale }] }}>
                      <LineChart
                        data={{ labels: chartLabelsForHum, datasets: [{ data: humidityDataForChart }] }}
                        width={SCREEN_WIDTH * 0.99}
                        height={400}
                        chartConfig={chartConfig}
                        bezier
                        withInnerLines={false}
                        style={[weatherStyles.chartStyle, { alignSelf: 'center', borderRadius: 16 }]}
                      />
                    </Animated.View>
                  </Pressable>
                  <View style={weatherStyles.extremesContainer}>
                    {mostHumidDay && (
                      <View style={weatherStyles.extremeItem}>
                        <Text style={weatherStyles.extremeLabel}>Most Humid</Text>
                        <Text style={weatherStyles.extremeValue}>
                          {formatLabel(mostHumidDay.date)} ({mostHumidDay.avg.toFixed(1)}%)
                        </Text>
                      </View>
                    )}
                    {leastHumidDay && (
                      <View style={weatherStyles.extremeItem}>
                        <Text style={weatherStyles.extremeLabel}>Least Humid</Text>
                        <Text style={weatherStyles.extremeValue}>
                          {formatLabel(leastHumidDay.date)} ({leastHumidDay.avg.toFixed(1)}%)
                        </Text>
                      </View>
                    )}
                  </View>
                  {maxHumEntry && (
                    <View style={weatherStyles.maxHumContainer}>
                      <Text style={weatherStyles.maxHumLabel}>Maximum Humidity This Week</Text>
                      <Text style={weatherStyles.maxHumValue}>
                        {formatDateTime(maxHumEntry.datetime)} ({maxHumEntry.humidity}%)
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={{ color: '#fff', marginBottom: 10, textAlign: 'center' }}>
                  No humidity data available.
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      <View style={weatherStyles.paginationContainer}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={[weatherStyles.dot, { opacity: activePage === index ? 1 : 0.3 }]} />
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
// Styles
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
  button: { backgroundColor: '#f8f8f8', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 20 },
  buttonText: { fontSize: 18, color: '#333' },
});

const weatherStyles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { flex: 1, alignItems: 'center', paddingBottom: 20 },
  topSection: { marginTop: 40, alignItems: 'center' },
  cityText: { fontSize: 18, color: '#fff', fontWeight: '600', marginBottom: 5, fontFamily: 'serif', margin: 30 },
  currentTempText: { fontSize: 64, color: '#fff', fontWeight: 'bold' },
  conditionText: { fontSize: 18, color: '#fff', marginTop: 8 },
  highLowText: { fontSize: 16, color: '#fff', marginTop: 4, opacity: 0.8 },
  cloudContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  cuteCloudImage: { width: 300, height: 300 },
  lightningEmoji: { fontSize: 56, marginLeft: -45, marginTop: 10 },
  // Updated forecastItem style with a thin white border.
  forecastItem: {
    width: 90,
    height: 150,
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  // The forecastTime style remains mostly the same; the newline is added in the text content.
  forecastTime: { color: '#fff', fontSize: 13, marginBottom: 4, textAlign: 'center' },
  forecastIcon: { fontSize: 24, marginBottom: 4 },
  forecastTemp: { color: '#fff', fontSize: 16, fontWeight: '600' },
  forecastItemActive: { borderColor: 'yellow', borderWidth: 2, transform: [{ scale: 1 }] },
  chartStyle: { marginVertical: 8, borderRadius: 16 },
  paginationContainer: { flexDirection: 'row', alignSelf: 'center', marginVertical: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000', marginHorizontal: 5 },
  screenHeading: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  extremesContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  extremeItem: { alignItems: 'center' },
  extremeLabel: { fontSize: 16, color: '#fff', fontWeight: '600' },
  extremeValue: { fontSize: 16, color: '#fff', marginTop: 4 },
  maxTempContainer: { marginTop: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, alignItems: 'center' },
  maxTempLabel: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  maxTempValue: { fontSize: 16, color: '#fff', marginTop: 4 },
  maxHumContainer: { marginTop: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, alignItems: 'center' },
  maxHumLabel: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  maxHumValue: { fontSize: 16, color: '#fff', marginTop: 4 },
});
