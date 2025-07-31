package com.cryptiqapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facetec.sdk.FaceTecSDK // <-- Import FaceTec

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Inicializa FaceTec SDK con tu licencia
        FaceTecSDK.initialize(this, "dxaDWEbcd8XnDYY7lxpCIv2ScJefs8sO")
    }

    override fun getMainComponentName(): String = "CryptiqApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}