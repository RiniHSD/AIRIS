/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './Navigation/navigator';
import {name as appName} from './app.json';
import { AuthProvider } from './Navigation/authcontext';
import { Provider } from 'react-redux';
import store from './Navigation/config/Reducer';

const AppWithAuthProvider = () => (
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
    );

AppRegistry.registerComponent(appName, () => AppWithAuthProvider);
