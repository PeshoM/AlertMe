package com.peshom.mobileclient

import android.content.Intent
import android.content.IntentFilter
import android.content.BroadcastReceiver
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class VolumeServiceModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var volumeEventReceiver: BroadcastReceiver? = null

    override fun getName(): String {
        return "VolumeServiceModule"
    }

    @ReactMethod
    fun startService() {
        // Register receiver for volume button presses
        registerVolumeEventReceiver()
        
        val intent = Intent(reactContext, ButtonHandlerService::class.java)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopService() {
        // Unregister receiver
        unregisterVolumeEventReceiver()
        
        val intent = Intent(reactContext, ButtonHandlerService::class.java)
        reactContext.stopService(intent)
    }

    private fun registerVolumeEventReceiver() {
        volumeEventReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (intent?.action == "com.peshom.VOLUME_EVENT") {
                    val action = intent.getStringExtra("action") ?: return
                    val volume = intent.getIntExtra("volume", -1)
                    
                    val params = Arguments.createMap().apply {
                        putString("action", action)
                        putInt("volume", volume)
                    }
                    
                    sendEvent("VolumeEvent", params)
                }
            }
        }
        val filter = IntentFilter("com.peshom.VOLUME_EVENT")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(volumeEventReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            reactContext.registerReceiver(volumeEventReceiver, filter)
        }
    }

    private fun unregisterVolumeEventReceiver() {
        volumeEventReceiver?.let {
            reactContext.unregisterReceiver(it)
            volumeEventReceiver = null
        }
    }

    // Helper method to send events to JavaScript
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // This allows JavaScript to register for volume events
    @ReactMethod
    fun addListener(eventName: String) {
        // Keep track of listeners if needed
    }

    // This allows JavaScript to unregister from volume events
    @ReactMethod
    fun removeListeners(count: Int) {
        // Remove listeners if needed
    }
    
    override fun onCatalystInstanceDestroy() {
        unregisterVolumeEventReceiver()
        super.onCatalystInstanceDestroy()
    }

    // Helper methods for the service to use
    companion object {
        fun createEventParams(action: String, volume: Int): WritableMap {
            return Arguments.createMap().apply {
                putString("action", action)
                putInt("volume", volume)
            }
        }

        fun emitJSEvent(context: Context, eventName: String, params: WritableMap) {
            val intent = Intent("com.peshom.VOLUME_EVENT")
            intent.putExtra("action", params.getString("action"))
            intent.putExtra("volume", params.getInt("volume"))
            context.sendBroadcast(intent)
        }
    }
} 