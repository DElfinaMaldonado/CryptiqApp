package com.cryptiqapp

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import com.facetec.sdk.FaceTecSDK
import com.facetec.sdk.FaceTecSDKStatus

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean {
            return BuildConfig.DEBUG
        }

        override fun getPackages(): List<ReactPackage> {
            val packages = PackageList(this).packages.toMutableList()
            // Agrega FaceTecPackage si existe
            // packages.add(FaceTecPackage())
            return packages
        }

        override fun getJSMainModuleName(): String {
            return "index"
        }
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)

        val deviceKeyIdentifier = "dxaDWEbcd8XnDYY7lxpCIv2ScJefs8sO"
        val publicFaceScanEncryptionKey = """
    -----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnb8CIhfevJ0dSiyO/4U5
    Cz2L+UjLxFZAKFEXAMPLEKEYqOT0X5W9S23wMysDpQe3p/jqGMnYm1qD+g19DcM2
    VExuDRZn+vUJnqF+Ym6uX1c5BbRwoMvOIHGL2xX8PKOah4E4fSg8cYYZMtI/t9V1
    hFwIDAQAB
    -----END PUBLIC KEY-----
""".trimIndent()


        val status = FaceTecSDK.initializeInDevelopmentMode(
            this,
            deviceKeyIdentifier,
            publicFaceScanEncryptionKey
        )

        if (status != FaceTecSDKStatus.Success) {
            Log.e("MainApplication", "Error al inicializar FaceTec SDK: $status")
        }
    }
}
