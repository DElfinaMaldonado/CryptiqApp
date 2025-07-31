/* eslint-disable react-native/no-inline-styles */
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
  ActivityIndicator
} from 'react-native';

import FaceTecConfig from './FaceTecConfig';
import {FaceTecSDK} from './FaceTecSDKModule';
import LivenessCheckProcessor from './processors/LivenessCheckProcessor';

const Colors = {
  darker: '#121212',
  lighter: '#F3F3F3',
  primary: '#417FB2',
  error: '#FF3B30',
  success: '#34C759'
};

const isDarkMode = false;
const backgroundStyle = {
  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
};

class App extends Component {
  state = {
    initializationStatus: 'loading',
    initializationError: null,
    isProcessing: false,
    lastOperationResult: null
  };

  componentDidMount() {
    this.initializeFaceTecSDK();
  }

  initializeFaceTecSDK = async () => {
    if (!FaceTecConfig.deviceKeyIdentifier || !FaceTecConfig.publicFaceScanEncryptionKey) {
      const errorMsg = 'Configuración faltante: Verifica deviceKeyIdentifier y encryptionKey';
      console.error(errorMsg);
      this.setState({
        initializationStatus: 'error',
        initializationError: errorMsg
      });
      Alert.alert('Error de Configuración', errorMsg);
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        FaceTecSDK.initialize(
          FaceTecConfig.deviceKeyIdentifier,
          FaceTecConfig.publicFaceScanEncryptionKey,
          (success, errorStr) => {
            if (success) {
              console.log('FaceTec SDK inicializado correctamente');
              resolve();
            } else {
              console.error('Error inicializando FaceTec SDK:', errorStr);
              reject(new Error(errorStr || 'Error desconocido al inicializar SDK'));
            }
          }
        );
      });

      this.setState({initializationStatus: 'success'});
    } catch (error) {
      this.setState({
        initializationStatus: 'error',
        initializationError: error.message
      });
      Alert.alert('Error de Inicialización', `No se pudo inicializar el SDK: ${error.message}`);
    }
  };

  getSessionToken = async () => {
    try {
      const userAgent = await FaceTecSDK.getAPIUserAgentString();
      const endpoint = `${FaceTecConfig.baseURL}/session-token`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'X-Device-Key': FaceTecConfig.deviceKeyIdentifier,
          'User-Agent': userAgent,
          'X-User-Agent': userAgent,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.sessionToken) {
        throw new Error('El servidor no devolvió un sessionToken válido');
      }

      return data.sessionToken;
    } catch (error) {
      console.error('Error en getSessionToken:', error);
      throw new Error(`No se pudo obtener el token: ${error.message}`);
    }
  };

  startLivenessDetection = async () => {
    if (this.state.isProcessing) return;

    this.setState({isProcessing: true, lastOperationResult: null});

    try {
      const sessionToken = await this.getSessionToken();
      const processor = new LivenessCheckProcessor(sessionToken, (result) => {
        this.setState({
          lastOperationResult: result,
          isProcessing: false
        });

        Alert.alert(
          result.success ? 'Éxito' : 'Error en Verificación',
          result.message
        );
      });

      FaceTecSDK.startLiveness(sessionToken, processor);
    } catch (error) {
      this.setState({
        lastOperationResult: {
          success: false,
          message: error.message
        },
        isProcessing: false
      });

      Alert.alert('Error en Verificación', error.message);
    }
  };

  renderInitializationStatus() {
    const {initializationStatus, initializationError} = this.state;

    switch (initializationStatus) {
      case 'loading':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.statusText}>Inicializando FaceTec SDK...</Text>
          </View>
        );
      case 'error':
        return (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, {color: Colors.error}]}>
              Error: {initializationError}
            </Text>
            <Button
              title="Reintentar"
              onPress={this.initializeFaceTecSDK}
              color={Colors.primary}
            />
          </View>
        );
      default:
        return null;
    }
  }

  renderOperationResult() {
    const {lastOperationResult} = this.state;
    if (!lastOperationResult) return null;

    return (
      <View style={[
        styles.resultContainer,
        {backgroundColor: lastOperationResult.success ? Colors.success : Colors.error}
      ]}>
        <Text style={styles.resultText}>{lastOperationResult.message}</Text>
      </View>
    );
  }

  render() {
    const {initializationStatus, isProcessing} = this.state;
    const isButtonDisabled = initializationStatus !== 'success' || isProcessing;

    return (
      <SafeAreaView style={[backgroundStyle, styles.container]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <Text style={styles.header}>Verificación de Identidad</Text>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}
          contentContainerStyle={styles.scrollContent}>
          {this.renderInitializationStatus()}
          <View style={styles.buttonContainer}>
            <Button
              title={isProcessing ? 'Procesando...' : 'Iniciar Verificación'}
              onPress={this.startLivenessDetection}
              disabled={isButtonDisabled}
              color={Colors.primary}
            />
          </View>
          {this.renderOperationResult()}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Esta aplicación utiliza FaceTec SDK para la verificación de identidad
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  header: {
    backgroundColor: Colors.primary,
    fontSize: 22,
    padding: 16,
    marginTop: 16,
    color: 'white',
    textAlign: 'center',
    borderRadius: 8,
    overflow: 'hidden'
  },
  buttonContainer: {
    padding: 16,
    marginVertical: 8
  },
  statusContainer: {
    alignItems: 'center',
    padding: 16,
    marginVertical: 16
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center'
  },
  resultContainer: {
    padding: 16,
    marginVertical: 16,
    borderRadius: 8
  },
  resultText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  },
  infoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center'
  }
});

export default App;
