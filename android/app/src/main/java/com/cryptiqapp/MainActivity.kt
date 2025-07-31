package com.cryptiqapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facetec.sdk.FaceTecSDK

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        FaceTecSDK.initialize(this, "dxaDWEbcd8XnDYY7lxpCIv2ScJefs8sO")
    }

    override fun getMainComponentName(): String? {
        return "CryptiqApp"
    }
}
