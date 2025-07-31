import { NativeEventEmitter, NativeModules } from 'react-native';
import FaceTecConfig from '../FaceTecConfig';

const { FaceTecSDKModule } = NativeModules;

const nativeEmitter = new NativeEventEmitter(FaceTecSDKModule);

// This is an example of a self-contained class to perform Liveness checks with the FaceTecSDK.
// You may choose to further componentize parts of this in your own apps based on your specific requirements.
class LivenessCheckProcessor {
  private success: boolean = false;

  //
  // Part 1: Set up your processor to listen for an onProcessSession event
  //
  constructor() {
    this.handleSessionDataToProcess =
      this.handleSessionDataToProcess.bind(this);
    nativeEmitter.addListener(
      'onProcessSession',
      this.handleSessionDataToProcess,
    );
  }

  async handleSessionDataToProcess(params: {
    status: string;
    lowQualityAuditTrailCompressedBase64: string;
    auditTrailCompressedBase64: string;
    faceScanBase64: string;
    sessionId: string;
    ftUserAgentString: string;
  }) {
    const {
      status,
      lowQualityAuditTrailCompressedBase64,
      auditTrailCompressedBase64,
      faceScanBase64,
      sessionId,
      ftUserAgentString,
    } = params;

    try {
      await this.processSession(
        status,
        lowQualityAuditTrailCompressedBase64,
        auditTrailCompressedBase64,
        faceScanBase64,
        sessionId,
        ftUserAgentString,
      );
    } catch (error) {
      console.error('Error processing session: ', error);
    }
  }

  //
  // Part 2: Handle the result of a FaceScan
  //
  async processSession(
    status: string,
    lowQualityAuditTrailCompressedBase64: string,
    auditTrailCompressedBase64: string,
    faceScanBase64: string,
    sessionId: string,
    ftUserAgentString: string,
  ) {
    //
    // Part 3:  Handles early exit scenarios where there is no FaceScan to handle -- i.e. User Cancellation, Timeouts, etc.
    //
    if (status !== 'sessionCompletedSuccessfully') {
      FaceTecSDKModule.cancelFaceScan();
      return;
    }
    // IMPORTANT:  FaceTecSDK.FaceTecSessionStatus.SessionCompletedSuccessfully DOES NOT mean the Liveness Check was Successful.
    // It simply means the User completed the Session and a 3D FaceScan was created.  You still need to perform the Liveness Check on your Servers.
    //
    // Part 4:  Get essential data off the FaceTecSessionResult
    //
    const parameters = {
      faceScan: faceScanBase64,
      auditTrailImage: auditTrailCompressedBase64,
      lowQualityAuditTrailImage: lowQualityAuditTrailCompressedBase64,
    };

    //
    // Part 5:  Make the Networking Call to Your Servers.  Below is just example code, you are free to customize based on how your own API works.
    //
    try {
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${FaceTecConfig.baseURL}/liveness-3d`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Device-Key', FaceTecConfig.deviceKeyIdentifier);
        xhr.setRequestHeader('User-Agent', ftUserAgentString);
        xhr.setRequestHeader('X-User-Agent', ftUserAgentString);

        xhr.onreadystatechange = function () {
          if (this.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              try {
                const responseData = JSON.parse(xhr.responseText);
                resolve(responseData);
              } catch (error) {
                console.error('Failed to parse response JSON: ', error);
                FaceTecSDKModule.cancelFaceScan();
                reject(new Error('Failed to parse response JSON'));
              }
            } else {
              FaceTecSDKModule.cancelFaceScan();
              reject(new Error(`HTTP status ${xhr.status}: ${xhr.statusText}`));
            }
          }
        };

        xhr.onerror = function () {
          console.error(
            'FaceTec API was unable to process the scan due to a networking error.',
          );
          FaceTecSDKModule.cancelFaceScan();
          reject(new Error('Network error occurred when processing request.'));
        };
        xhr.send(JSON.stringify(parameters));
      });

      this.handleResponse(response);
    } catch (error) {
      console.error('Error issuing request to the FaceTec API: ', error);
      FaceTecSDKModule.cancelFaceScan();
      return;
    }
  }

  //
  // Part 6: Handle the response
  //
  private handleResponse(responseJSON: any) {
    if (responseJSON.error) {
      // CASE:  Parsing the response into JSON failed -->
      // You define your own API contracts with yourself and may choose to do something different here based on the error.
      // Solid server-side code should ensure you don't get to this case.
      console.error(
        'Error while processing FaceScan: ',
        responseJSON.errorMessage,
      );
      FaceTecSDKModule.cancelFaceScan();
      return;
    }
    // In v9.2.0+, simply pass in scanResultBlob to the proceedToNextStep function to advance the User flow.
    // scanResultBlob is a proprietary, encrypted blob that controls the logic for what happens next for the User.
    if (responseJSON.scanResultBlob && responseJSON.wasProcessed) {
      FaceTecSDKModule.onScanResultBlobReceived(responseJSON.scanResultBlob);
      this.success = true;
    } else {
      // CASE:  UNEXPECTED response from API.  Our Sample Code keys off a wasProcessed boolean on the root of the JSON object -->
      // You define your own API contracts with yourself and may choose to do something different here based on the error.
      FaceTecSDKModule.cancelFaceScan();
    }
  }

  public isSuccess(): boolean {
    return this.success;
  }
}

export default new LivenessCheckProcessor();
