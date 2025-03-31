package com.peshom.mobileclient

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReactContextBaseJavaModule

class NativeCaller(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NativeCaller"
    }

    @ReactMethod
    fun startService() {
        val serviceIntent = Intent(reactApplicationContext, ButtonHandlerService::class.java)
        reactApplicationContext.startService(serviceIntent)
    }

    @ReactMethod
    fun stopService() {
        val serviceIntent = Intent(reactApplicationContext, ButtonHandlerService::class.java)
        reactApplicationContext.stopService(serviceIntent)
    }
}