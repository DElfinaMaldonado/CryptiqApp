package com.cryptiqapp

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facetec.sdk.FaceTecSessionActivity
import com.facetec.sdk.FaceTecSessionResult
import com.facetec.sdk.FaceTecSessionResultCallback

class FaceTecModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "FaceTecModule"

    override fun getName(): String = "FaceTecModule"

    @ReactMethod
    fun startFaceTecSession() {
        val activity = currentActivity ?: run {
            Log.e(TAG, "No hay actividad actual disponible.")
            return
        }

        val sessionCallback = object : FaceTecSessionResultCallback {
            override fun onFaceTecSessionResult(result: FaceTecSessionResult) {
                if (result.isSessionCompletedSuccessfully) {
                    Log.d(TAG, "¡Sesión FaceTec completada exitosamente!")
                } else {
                    Log.d(TAG, "Sesión FaceTec fallida o cancelada.")
                }
            }
        }

        FaceTecSessionActivity.createAndLaunchSession(sessionCallback, activity)
    }
}
