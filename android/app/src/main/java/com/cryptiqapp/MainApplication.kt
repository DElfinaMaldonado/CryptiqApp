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

    private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean {
            return BuildConfig.DEBUG
        }

        override fun getPackages(): List<ReactPackage> {
            val packages = PackageList(this).packages.toMutableList()
            packages.add(FaceTecPackage())  // Agregamos el paquete de FaceTec
            return packages
        }

        override fun getJSMainModuleName(): String {
            return "index"
        }
    }

    override fun getReactNativeHost(): ReactNativeHost = mReactNativeHost

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)

        val deviceKeyIdentifier = "TU_DEVICE_KEY"
        val publicFaceScanEncryptionKey = """
            -----BEGIN PUBLIC KEY-----
            TU_LLAVE_PUBLICA
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
