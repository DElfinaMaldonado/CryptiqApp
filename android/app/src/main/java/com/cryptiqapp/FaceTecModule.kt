package com.cryptiqapp

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.facebook.react.bridge.ActivityEventListener

class FaceTecModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var mPromise: Promise? = null
    private val FACETEC_REQUEST_CODE = 1001

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "FaceTecModule"

    @ReactMethod
    fun startFaceTecScan(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        mPromise = promise
        val intent = Intent()
        intent.setClassName(activity.packageName, "com.facetec.sdk.FaceTecActivity")
        activity.startActivityForResult(intent, FACETEC_REQUEST_CODE)
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FACETEC_REQUEST_CODE && mPromise != null) {
            if (resultCode == Activity.RESULT_OK) {
                mPromise?.resolve("FaceTec scan completed.")
            } else {
                mPromise?.reject("SCAN_FAILED", "FaceTec scan failed.")
            }
            mPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {
        // Obligatorio, pero no usado
    }
}
