import { AppRegistry } from 'react-native';
import App from './App';  // Asegúrate que apunte a tu archivo App.js
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
