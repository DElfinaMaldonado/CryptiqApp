package com.cryptiqapp;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facetec.sdk.FaceTecFaceScanProcessor;
import com.facetec.sdk.FaceTecFaceScanResultCallback;
import com.facetec.sdk.FaceTecSDK;
import com.facetec.sdk.FaceTecSessionActivity;
import com.facetec.sdk.FaceTecSessionResult;
import com.facetec.sdk.FaceTecSessionStatus;

import java.util.HashMap;
import java.util.Map;

import kotlin.NotImplementedError;

// Based docs at https://reactnative.dev/docs/native-modules-android
public class FaceTecSDKModule extends ReactContextBaseJavaModule implements FaceTecFaceScanProcessor {
    FaceTecSDKModule(ReactApplicationContext context) {
        super(context);
    }

    private FaceTecFaceScanResultCallback pendingFaceScanResultCallback;

    @NonNull
    @Override
    public String getName() {
        return "FaceTecSDKModule";
    }

    @ReactMethod
    public void initialize(String deviceKeyIdentifier, String publicFaceScanEncryptionKey,
            Callback initializeCallback) {
        Context context = getReactApplicationContext();
        FaceTecSDK.initializeInDevelopmentMode(context, deviceKeyIdentifier, publicFaceScanEncryptionKey,
                new FaceTecSDK.InitializeCallback() {
                    @Override
                    public void onCompletion(boolean success) {
                        String errorStr = success ? null
                                : FaceTecSDK.getStatus(getReactApplicationContext()).toString();
                        initializeCallback.invoke(success, errorStr);
                    }
                });
    }

    @ReactMethod
    public void startLiveness(String sessionToken) {
        // startLiveness() will open the FaceTec interface and start the Liveness check
        // process. The
        // methods processSessionWhileFaceTecSDKWaits() and onFaceTecSDKCompletelyDone()
        // are not explicitly called,
        // but are implicitly called through the FaceTec controller.
        try {
            FaceTecSessionActivity.createAndLaunchSession(getCurrentActivity(), this, sessionToken);
        } catch (Exception e) {
            Log.e("FaceTecSDKModule java", "Error when starting a Liveness check");
        }
    }

    @ReactMethod
    public void getAPIUserAgentString(Promise promise) {
        try {
            String data = FaceTecSDK.createFaceTecAPIUserAgentString("");
            promise.resolve(data);
        } catch (Exception e) {
            promise.reject("ERROR_USER_AGENT", "Failed to create User Agent String", e);
        }
    }

    // FaceTecFaceScanProcessor required method
    @Override
    public void processSessionWhileFaceTecSDKWaits(FaceTecSessionResult faceTecSessionResult,
            FaceTecFaceScanResultCallback faceTecFaceScanResultCallback) {
        // This callback will be called outside the scope of this method, when the scan
        // is received.
        pendingFaceScanResultCallback = faceTecFaceScanResultCallback;
        String status;

        if (faceTecSessionResult.getStatus() == FaceTecSessionStatus.SESSION_COMPLETED_SUCCESSFULLY) {
            status = "sessionCompletedSuccessfully";

            try {
                // Ready arguments to be sent from native Android code to the React layer
                // Sending data to the React layer requires a WritableMap data structure, so we
                // encode arguments as a WritableMap.
                WritableMap map = Arguments.createMap();
                map.putString("status", status);
                map.putString("lowQualityAuditTrailCompressedBase64",
                        faceTecSessionResult.getLowQualityAuditTrailCompressedBase64()[0]);
                map.putString("auditTrailCompressedBase64",
                        faceTecSessionResult.getAuditTrailCompressedBase64()[0]);
                map.putString("faceScanBase64", faceTecSessionResult.getFaceScanBase64());
                map.putString("sessionId", faceTecSessionResult.getSessionId());
                map.putString("ftUserAgentString",
                        FaceTecSDK.createFaceTecAPIUserAgentString(faceTecSessionResult.getSessionId()));

                ReactApplicationContext reactContext = getReactApplicationContext();
                if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                    // Send arguments to the React layer by emitting an event called
                    // "onProcessSession".
                    // On the React layer's side, it listens for the event and reads the data
                    // contained
                    // in map.
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onProcessSession", map);
                }
            } catch (Exception e) {
                Log.e("FaceTecSDKModule java", "Session terminated or unsuccessful.");
            }
        } else {
            status = "sessionUnsuccessful";
        }
    }

    // FaceTecFaceScanProcessor required method
    public void onFaceTecSDKCompletelyDone() {
        //
        // DEVELOPER NOTE: onFaceTecSDKCompletelyDone() is called after the Session has
        // completed or you signal the FaceTec SDK with cancel().
        // Calling a custom function on the Sample App Controller is done for
        // demonstration purposes to show you that here is where you get control back
        // from the FaceTec SDK.
        //

        // In this case, we don't perform any post-processing.
        Log.d("MainActivity", "onFaceTecSDKCompletelyDone");
    }

    @ReactMethod
    public void cancelFaceScan() {
        // Handle an unsuccessful scan event
        Log.e("MainActivity", "Face Scan result cancelled");
        if (pendingFaceScanResultCallback != null) {
            pendingFaceScanResultCallback.cancel();
        }
        pendingFaceScanResultCallback = null;
    }

    @ReactMethod
    public void onScanResultBlobReceived(String scanResultBlob) {
        // Handle a successfully received scanResultBlob from the FaceTec API
        if (pendingFaceScanResultCallback != null) {
            pendingFaceScanResultCallback.proceedToNextStep(scanResultBlob);
        }
        pendingFaceScanResultCallback = null;
    }
}