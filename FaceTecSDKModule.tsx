import {NativeModules} from 'react-native';

const {FaceTecSDKModule} = NativeModules;

// This defines a type that includes the methods that exist in Native Android
// or iOS code. These methods must be able to be called from the React layer.
interface FaceTecSDKModuleInterface {
  initialize: (
    deviceKeyIdentifier: string,
    publicFaceScanEncryptionKey: string,
    initializeCallback: (success: boolean, errorMessage: string) => void,
  ) => void;
  startLiveness: (sessionToken: string) => void;
  getAPIUserAgentString: () => Promise<string>;
  cancelFaceScan: () => void;
  onScanResultBlobReceived: (scanResultBlob: string) => void;
};

// Ensure the module matches the expected type
export const FaceTecSDK: FaceTecSDKModuleInterface = {
  getAPIUserAgentString: async () => {
    return FaceTecSDKModule.getAPIUserAgentString();
  },
  startLiveness: (sessionToken: string) => {
    FaceTecSDKModule.startLiveness(sessionToken);
  },
  initialize: (
    deviceKeyIdentifier: string,
    publicFaceScanEncryptionKey: string,
    initializeCallback: (success: boolean, errorMessage: string) => void,
  ) => {
    FaceTecSDKModule.initialize(
      deviceKeyIdentifier,
      publicFaceScanEncryptionKey,
      initializeCallback,
    );
  },
  cancelFaceScan: () => {
    FaceTecSDKModule.cancelFaceScan();
  },
  onScanResultBlobReceived: (scanResultBlob: string) => {
    FaceTecSDKModule.onScanResultBlobReceived(scanResultBlob);
  },
};
