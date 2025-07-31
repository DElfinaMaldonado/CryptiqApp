# ProGuard rules for FaceTec SDK integration

# Mantener todas las clases y métodos del SDK de FaceTec
-keep class com.facetec.sdk.** { *; }

# Evita advertencias relacionadas con FaceTec
-dontwarn com.facetec.sdk.**

# (Opcional) Mantener clases de tu propio paquete si usas reflexión o llamadas nativas
-keep class com.cryptiqapp.** { *; }

# Mantener clases usadas por React Native
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.core.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keepclassmembers class * extends com.facebook.react.bridge.JavaScriptModule {
  <methods>;
}
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
  <methods>;
}
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
  <methods>;
}
-dontwarn com.facebook.react.**
