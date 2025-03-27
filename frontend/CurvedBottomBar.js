// CurvedBottomBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

export default function CurvedBottomBar() {
  return (
    <View style={styles.container}>
      {/* The SVG shape in the background */}
      <View style={styles.svgContainer}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 80"
          preserveAspectRatio="xMidYMin slice"
        >
          <Path
            d="M0,0 L144,0 A56,56 0 0 1 200,56 A56,56 0 0 1 256,0 L400,0 L400,80 L0,80 Z"
            fill="#663399" // Purple color
          />
        </Svg>
      </View>

      {/* Left icon (location) */}
      <TouchableOpacity style={styles.leftIcon} onPress={() => {}}>
        <Ionicons name="location-outline" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Center floating plus button */}
      <TouchableOpacity style={styles.plusButton} onPress={() => {}}>
        <Text style={styles.plusText}>+</Text>
      </TouchableOpacity>

      {/* Right icon (menu) */}
      <TouchableOpacity style={styles.rightIcon} onPress={() => {}}>
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    // Ensures the bar sits on top of other components
    zIndex: 10,
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
  },
  leftIcon: {
    position: 'absolute',
    left: 30,
    bottom: 25,
  },
  rightIcon: {
    position: 'absolute',
    right: 30,
    bottom: 25,
  },
  plusButton: {
    position: 'absolute',
    left: '50%',
    // Increase or decrease bottom to move the + button
    // relative to the curved arc
    bottom: 45,
    transform: [{ translateX: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // Elevation and shadow for Android/iOS
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  plusText: {
    color: '#663399',
    fontSize: 28,
    lineHeight: 32,
  },
});
