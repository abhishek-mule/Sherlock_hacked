import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// The URL where your Next.js app is hosted (for production)
// For development, you'll use your local development server
const NEXTJS_APP_URL = __DEV__ 
  ? 'http://10.0.2.2:3000' // This points to localhost on the Android emulator
  : 'https://sherlock-student-db-demo.vercel.app'; // Replace with your actual production URL when deployed

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  useEffect(() => {
    // Hide splash screen after resources are loaded and WebView is ready
    if (isAppReady && isWebViewLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady, isWebViewLoaded]);

  // Simulate some loading time to show the splash screen
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    // You could show a custom error screen here
  };

  return (
    <View style={styles.container}>
      {isAppReady ? (
        <WebView
          source={{ uri: NEXTJS_APP_URL }}
          style={styles.webview}
          onLoad={() => setIsWebViewLoaded(true)}
          onError={handleWebViewError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0284c7" />
              <Text style={styles.loadingText}>Loading your experience...</Text>
            </View>
          )}
          allowsBackForwardNavigationGestures
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          cacheEnabled={true}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4b5563',
  },
}); 