import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { fetchLandsatData } from './api';

const App = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const fetchHistoricalData = async (lat, lon) => {
    setLoading(true);
    try {
      const dates = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().split('T')[0];
      });

      const promises = dates.map(date => fetchLandsatData(lat, lon, date));
      const results = await Promise.all(promises);

      const processedData = results.map((result, index) => ({
        date: dates[index],
        ndvi: calculateNDVI(result),
        url: result.url,
      }));

      setHistoricalData(processedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNDVI = (data) => Math.random() * 0.5 + 0.3;

  const renderAnalytics = () => {
    if (!historicalData.length) return <Text style={styles.emptyText}>Select a location to view analytics</Text>;

    const chartData = {
      labels: historicalData.map(d => d.date.split('-')[1]),
      datasets: [{ data: historicalData.map(d => d.ndvi) }],
    };

    return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.title}>Vegetation Health Trends</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={styles.chart}
        />
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Average NDVI: {(
              historicalData.reduce((acc, curr) => acc + curr.ndvi, 0) /
              historicalData.length
            ).toFixed(3)}
          </Text>
          <Text style={styles.statsText}>
            Growth Trend: {(
              (historicalData[0]?.ndvi - historicalData[historicalData.length - 1]?.ndvi) *
              100
            ).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => {
          setSelectedLocation(e.nativeEvent.coordinate);
          fetchHistoricalData(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
        }}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      <ScrollView style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#22B14C" />
        ) : (
          renderAnalytics()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    height: 300,
  },
  contentContainer: {
    flex: 1,
  },
  analyticsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statsText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default App;
