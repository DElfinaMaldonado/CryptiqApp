package com.cryptiqapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facetec.sdk.FaceTecSDK

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Inicializa FaceTec SDK con tu licencia (deviceKeyIdentifier)
        val deviceKeyIdentifier = "dxaDWEbcd8XnDYY7lxpCIv2ScJefs8sO" // Cambia si es necesario

        val status = FaceTecSDK.initialize(this, deviceKeyIdentifier)

        if (status != FaceTecSDK.FaceTecSDKStatus.Success) {
            // Aquí puedes registrar un error si falla la inicialización
            println("Error al inicializar FaceTec SDK: $status")
        }
    }

    override fun getMainComponentName(): String? {
        return "CryptiqApp" // Cambia al nombre de tu componente principal si es otro
    }
}
