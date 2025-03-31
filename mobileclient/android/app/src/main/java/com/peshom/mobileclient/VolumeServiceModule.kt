package com.peshom.mobileclient

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class VolumeServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        Companion.reactContext = reactContext
    }

    override fun getName(): String {
        return "VolumeServiceModule"
    }
    
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
    }

    companion object {
        var reactContext: ReactApplicationContext? = null
            private set

        fun createEventParams(action: String, volume: Int): WritableMap {
            val params = Arguments.createMap()
            params.putString("action", action)
            params.putInt("volume", volume)
            return params
        }
        
        fun emitJSEvent(eventName: String, params: WritableMap) {
            reactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        }
    }
}