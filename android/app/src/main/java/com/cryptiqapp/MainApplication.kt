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
            // Obtiene la lista automática de paquetes
            val packages = PackageList(this).packages.toMutableList()
            // Agrega manualmente FaceTecPackage para registrar el módulo nativo
            packages.add(FaceTecPackage())
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

        val deviceKeyIdentifier = "dxaDWEbcd8XnDYY7lxpCIv2ScJefs8sO"
        val publicFaceScanEncryptionKey = """
            -----BEGIN PUBLIC KEY-----
            MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn+klFctV8lqT3qQ8I3Jo
            Ce1x5KHZ8BHa3r+Z0FzXv/ZKfZIMC9+MKjxZH5cI95fUpjDQkSG+aQy8R2u+NiF7
            eE8MREbHRcoD5uZnRRFYZ0JkFzGDfZkKlfb9SypPp44yEdE8nPKdDxEbXuhq6UVc
            F1W1vHeqZoB7x0gxk9Y+v2n2E3d7cQsOVljfYDbtHc2CDxz0L+C7KRn4i8fI9cE8
            fzCl+5l5Df8HX/UxXLHRfQIDAQAB
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
