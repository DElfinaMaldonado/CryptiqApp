package com.cryptiqapp

import android.app.Activity
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facetec.sdk.FaceTecSDK
import com.facetec.sdk.FaceTecSessionResultCallback
import com.facetec.sdk.FaceTecSessionResult

class FaceTecModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "FaceTecModule"

    override fun getName(): String = "FaceTecModule"

    @ReactMethod
    fun startFaceTecScan(promise: Promise) {
        val activity: Activity? = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "No hay actividad disponible")
            return
        }

        FaceTecSDK.startSession(activity, object : FaceTecSessionResultCallback {
            override fun onSessionComplete(sessionResult: FaceTecSessionResult) {
                if (sessionResult.isSuccess) {
                    Log.d(TAG, "Sesión FaceTec completada exitosamente")
                    promise.resolve("Escaneo completado con éxito")
                } else {
                    Log.d(TAG, "Sesión FaceTec fallida o cancelada")
                    promise.reject("ESCANEO_ERROR", "El escaneo falló o fue cancelado")
                }
            }
        })
    }
}
