// TH1 | 23737701 | NGUYỄN THỊ LÝ | #014573
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@contexts/ThemeContext';
import { HomeScreen } from '@screens/HomeScreen';

const AppContent = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <HomeScreen />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}