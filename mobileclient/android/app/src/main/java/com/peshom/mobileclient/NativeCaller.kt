package com.peshom.mobileclient

import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray

class NativeCaller(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private var serviceStarted = false
        private var lastStartAttempt = 0L
    }

    override fun getName(): String = "NativeCaller"

    @ReactMethod
    fun startService() {
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastStartAttempt < 500) return
        
        lastStartAttempt = currentTime
        stopService()
        
        Handler(Looper.getMainLooper()).postDelayed({
            val serviceIntent = Intent(reactContext, ButtonHandlerService::class.java)
            val appContext = reactContext.applicationContext
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                appContext.startForegroundService(serviceIntent)
            } else {
                appContext.startService(serviceIntent)
            }
            
            serviceStarted = true
            
            Handler(Looper.getMainLooper()).postDelayed({
                val playServiceIntent = Intent(appContext, PlayService::class.java)
                appContext.startService(playServiceIntent)
            }, 500)
        }, 200)
    }

    @ReactMethod
    fun stopService() {
        val appContext = reactContext.applicationContext
        
        val playServiceIntent = Intent(appContext, PlayService::class.java)
        appContext.stopService(playServiceIntent)
        
        val serviceIntent = Intent(appContext, ButtonHandlerService::class.java)
        appContext.stopService(serviceIntent)
        
        serviceStarted = false
    }
    
    @ReactMethod
    fun restartServiceIfNeeded(promise: Promise) {
        stopService()
        
        Handler(Looper.getMainLooper()).postDelayed({
            val appContext = reactContext.applicationContext
            val intent = Intent(appContext, ButtonHandlerService::class.java)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                appContext.startForegroundService(intent)
            } else {
                appContext.startService(intent)
            }
            
            serviceStarted = true
            
            Handler(Looper.getMainLooper()).postDelayed({
                val playIntent = Intent(appContext, PlayService::class.java)
                appContext.startService(playIntent)
                promise.resolve("Services started successfully")
            }, 500)
        }, 300)
    }
    
    @ReactMethod
    fun setCombinations(combinationsArray: ReadableArray, promise: Promise) {
        VolumeServiceModule.setCombinations(combinationsArray)
        promise.resolve("Combinations set successfully: ${combinationsArray.size()}")
    }
    
    @ReactMethod
    fun setFriends(friendsArray: ReadableArray, promise: Promise) {
        VolumeServiceModule.setFriends(friendsArray)
        promise.resolve("Friends set successfully: ${friendsArray.size()}")
    }
    
    @ReactMethod
    fun isServiceRunning(promise: Promise) {
        promise.resolve(serviceStarted)
    }
}