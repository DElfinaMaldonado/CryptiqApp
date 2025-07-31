/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Component} from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Define your own color constants since Colors is not available
const Colors = {
  darker: '#121212',
  lighter: '#F3F3F3',
};
import FaceTecConfig from './FaceTecConfig.js';
import LivenessCheckProcessor from './processors/LivenessCheckProcessor'; 

import {FaceTecSDK} from './FaceTecSDKModule';

LivenessCheckProcessor;

const isDarkMode = false;

const backgroundStyle = {
  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
};

class App extends Component {
  state = {
    showFaceTecInitializing: true,
    isLivenessEnabled: false,
  };

  constructor(props: Props) {
    super(props);

    if (!FaceTecConfig.deviceKeyIdentifier) {
      throw new Error('FaceTecConfig.deviceKeyIdentifier not defined');
    }

    FaceTecSDK.initialize(
      FaceTecConfig.deviceKeyIdentifier,
      FaceTecConfig.publicFaceScanEncryptionKey,
      (success: boolean, errorStr: string) => {
        if (success) {
          this.setState({
            isLivenessEnabled: true,
            showFaceTecInitializing: false,
          });
        } else {
          Alert.alert('Initialize Error', errorStr);
        }
      },
    );
  }

  // Request a session token from the FaceTec API.
  // Session tokens are necessary to perform Liveness checks and other
  // features.
  // async getSessionToken() {
  //   const userAgent = await FaceTecSDK.getAPIUserAgentString();
  //   const xUserAgent = await FaceTecSDK.getAPIUserAgentString();

  //   const endpoint = `${FaceTecConfig.baseURL}/session-token`;

  //   return new Promise((resolve, reject) => {
  //     try {
  //       const xhr = new XMLHttpRequest();
  //       xhr.open('GET', endpoint);
  //       xhr.setRequestHeader('X-Device-Key', FaceTecConfig.deviceKeyIdentifier);
  //       xhr.setRequestHeader('User-Agent', userAgent);
  //       xhr.setRequestHeader('X-User-Agent', xUserAgent);
  //       xhr.onreadystatechange = function () {
  //         if (this.readyState === XMLHttpRequest.DONE) {
  //           try {
  //             const response = JSON.parse(xhr.responseText);
  //             Something went wrong in parsing the response. Return an error.
  //             if (
  //               response.sessionToken &&
  //               typeof response.sessionToken === 'string'
  //             ) {
  //               resolve(response.sessionToken);
  //             }
  //             else {
  //               reject(new Error('Session token is not valid.'));
  //             }
  //           }
  //           catch (error) {
  //             xhr.abort();
  //             console.error(
  //               'Error parsing response JSON. Failed with error: ',
  //               error,
  //             );
  //             reject(new Error('Error parsing response JSON'));
  //           }
  //         }
  //       };
  //       xhr.onerror = function () {
  //         xhr.abort();
  //         console.error(
  //           'Encountered an error sending the network request, aborting request...',
  //         );
  //         reject(new Error('Network error occurred.'));
  //       };

  //       xhr.send();
  //     }
  //     catch (error) {
  //       console.error('Error fetching session token: ', error);
  //       reject(
  //         new Error(
  //           'Could not fetch session token. Check to make sure your device key is correct.',
  //         ),
  //       );
  //     }
  //   });
  // };
async getSessionToken(): Promise<string> {
  const userAgent = await FaceTecSDK.getAPIUserAgentString();
  const xUserAgent = await FaceTecSDK.getAPIUserAgentString();

  const endpoint = `${FaceTecConfig.baseURL}/session-token`;

  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', endpoint);
      xhr.setRequestHeader('X-Device-Key', FaceTecConfig.deviceKeyIdentifier);
      xhr.setRequestHeader('User-Agent', userAgent);
      xhr.setRequestHeader('X-User-Agent', xUserAgent);
      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (
              response.sessionToken &&
              typeof response.sessionToken === 'string'
            ) {
              resolve(response.sessionToken); 
            } else {
              reject(new Error('Session token is not valid.'));
            }
          } catch (error) {
            xhr.abort();
            reject(new Error('Error parsing response JSON'));
          }
        }
      };
      xhr.onerror = function () {
        xhr.abort();
        reject(new Error('Network error occurred.'));
      };

      xhr.send();
    } catch (error) {
      reject(new Error('Could not fetch session token.'));
    }
  });
}

async startLivenessDetection() {
  const sessionToken = await this.getSessionToken();
  if (!sessionToken) {
    throw new Error('Session token is undefined.');
  }

  FaceTecSDK.startLiveness(sessionToken);
}


  render() {
    return (
      <SafeAreaView style={[backgroundStyle, {paddingHorizontal: 10}]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <Text style={styles.header}>FaceTecSDK Sample</Text>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}>
          <View style={{height: 40}} />
          <View style={{padding: 10}}>
            <Button
              color="#417FB2"
              title="Start Liveness"
              onPress={() => this.startLivenessDetection()}
              disabled={!this.state.isLivenessEnabled}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              opacity: this.state.showFaceTecInitializing ? 100 : 0,
            }}>
            Initializing FaceTec SDK...
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  header: {
    backgroundColor: '#417FB2',
    fontSize: 25,
    padding: 10,
    marginTop: 15,
    color: 'white',
  },
});

export default App;
