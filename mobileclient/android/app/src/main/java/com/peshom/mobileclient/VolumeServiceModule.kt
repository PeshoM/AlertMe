package com.peshom.mobileclient

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import org.json.JSONArray
import org.json.JSONObject
import android.app.NotificationManager
import android.app.NotificationChannel
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import java.util.concurrent.CopyOnWriteArrayList

class VolumeServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    init {
        setReactApplicationContext(reactContext)
    }

    override fun getName(): String = "VolumeServiceModule"

    companion object {
        private val buttonSequence = CopyOnWriteArrayList<String>()
        private const val SEQUENCE_TIMEOUT = 3000L
        private val handler = Handler(Looper.getMainLooper())
        private var sequenceRunnable: Runnable? = null
        private var combinations = JSONArray()
        private var friends = JSONArray()
        private const val CHANNEL_ID = "AlertMe_Channel"
        private const val NOTIFICATION_ID = 123
        @Volatile
        private var reactApplicationContext: ReactApplicationContext? = null
        
        fun setReactApplicationContext(context: ReactApplicationContext) {
            reactApplicationContext = context
        }

        fun createEventParams(action: String, timestamp: Long): WritableMap {
            val params = Arguments.createMap()
            params.putString("action", action)
            params.putDouble("timestamp", timestamp.toDouble())
            return params
        }
        
        fun createParams(eventName: String, action: String): WritableMap {
            val params = Arguments.createMap()
            params.putString("type", eventName)
            params.putString("action", action)
            params.putDouble("timestamp", System.currentTimeMillis().toDouble())
            return params
        }

        fun emitJSEvent(context: ReactApplicationContext?, event: String, action: String) {
            try {
                val contextToUse = context ?: reactApplicationContext
                if (contextToUse == null || !contextToUse.hasActiveReactInstance()) return
                
                val params = createParams(event, action)
                UiThreadUtil.runOnUiThread {
                    try {
                        contextToUse.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            ?.emit("VolumeEvent", params)
                    } catch (e: Exception) {
                    }
                }
            } catch (e: Exception) {
            }
        }
        
        fun emitJSEvent(event: String, params: WritableMap) {
            try {
                UiThreadUtil.runOnUiThread {
                    val appContext = reactApplicationContext
                    if (appContext != null && appContext.hasActiveReactInstance()) {
                        try {
                            appContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                                ?.emit(event, params)
                        } catch (e: Exception) {
                        }
                    }
                }
            } catch (e: Exception) {
            }
        }

        fun addButtonToSequence(action: String) {
            sequenceRunnable?.let { handler.removeCallbacks(it) }
            
            buttonSequence.add(action)
            
            sequenceRunnable = Runnable { 
                buttonSequence.clear() 
                sequenceRunnable = null
            }
            
            handler.postDelayed(sequenceRunnable!!, SEQUENCE_TIMEOUT)
        }
        
        fun setCombinations(combinationsArray: ReadableArray) {
            try {
                val jsonArray = JSONArray()
                for (i in 0 until combinationsArray.size()) {
                    val combination = combinationsArray.getMap(i)
                    val jsonObject = JSONObject()
                    
                    jsonObject.put("id", combination?.getString("id") ?: "")
                    jsonObject.put("name", combination?.getString("name") ?: "")
                    jsonObject.put("userId", combination?.getString("userId") ?: "")
                    jsonObject.put("friendId", combination?.getString("target") ?: combination?.getString("friendId") ?: "")
                    jsonObject.put("message", combination?.getString("message") ?: "")
                    
                    val sequenceArray = JSONArray()
                    val sequence = combination?.getArray("sequence")
                    if (sequence != null) {
                        for (j in 0 until sequence.size()) {
                            sequenceArray.put(sequence.getString(j))
                        }
                    }
                    jsonObject.put("sequence", sequenceArray)
                    
                    jsonArray.put(jsonObject)
                }
                combinations = jsonArray
            } catch (e: Exception) {
            }
        }
        
        fun setFriends(friendsArray: ReadableArray) {
            try {
                val jsonArray = JSONArray()
                for (i in 0 until friendsArray.size()) {
                    val friend = friendsArray.getMap(i)
                    val jsonObject = JSONObject()
                    
                    jsonObject.put("id", friend?.getString("id") ?: friend?.getString("_id") ?: "")
                    jsonObject.put("username", friend?.getString("username") ?: "")
                    jsonObject.put("name", friend?.getString("name") ?: friend?.getString("username") ?: "")
                    
                    jsonArray.put(jsonObject)
                }
                friends = jsonArray
            } catch (e: Exception) {
            }
        }
        
        fun handleVolumeButtonPress(context: Context?, volumeKey: String) {
            try {
                if (context is ReactApplicationContext) {
                    emitJSEvent(context, "volume", volumeKey)
                } else {
                    emitJSEvent(reactApplicationContext, "volume", volumeKey)
                }
                
                addButtonToSequence(volumeKey)
                checkForMatchingCombination(context)
            } catch (e: Exception) {
            }
        }
        
        private fun checkForMatchingCombination(context: Context?) {
            try {
                if (buttonSequence.isEmpty() || combinations.length() == 0) {
                    return
                }
                
                for (i in 0 until combinations.length()) {
                    val combination = combinations.getJSONObject(i)
                    val sequenceArray = combination.getJSONArray("sequence")
                    
                    if (buttonSequence.size != sequenceArray.length()) {
                        continue
                    }
                    
                    var isMatch = true
                    for (j in 0 until buttonSequence.size) {
                        if (j >= sequenceArray.length() || buttonSequence[j] != sequenceArray.getString(j)) {
                            isMatch = false
                            break
                        }
                    }
                    
                    if (isMatch) {
                        val name = combination.optString("name", "Combination")
                        val message = combination.optString("message", "")
                        val friendId = combination.optString("friendId", "")
                        val combinationId = combination.optString("id", "")
                        
                        var friendName = "Friend"
                        for (k in 0 until friends.length()) {
                            val friend = friends.getJSONObject(k)
                            if (friend.getString("id") == friendId) {
                                friendName = friend.optString("name", "Friend")
                                break
                            }
                        }
                        
                        if (context != null) {
                            try {
                                sendNotification(context, name, message, friendName)
                            } catch (e: Exception) {
                            }
                        }
                        
                        val params = Arguments.createMap()
                        params.putString("type", "combinationMatched")
                        params.putString("action", "combinationMatched")
                        params.putString("combinationId", combinationId)
                        params.putString("combinationName", name)
                        params.putString("message", message)
                        params.putString("friendId", friendId)
                        params.putString("friendName", friendName)
                        params.putString("sequence", buttonSequence.toString())
                        params.putDouble("timestamp", System.currentTimeMillis().toDouble())
                        
                        emitJSEvent("CombinationEvent", params)
                        
                        buttonSequence.clear()
                        sequenceRunnable?.let { handler.removeCallbacks(it) }
                        sequenceRunnable = null
                        break
                    }
                }
            } catch (e: Exception) {
            }
        }
        
        private fun sendNotification(context: Context, combinationName: String, message: String, friendName: String) {
            try {
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val channel = NotificationChannel(
                        CHANNEL_ID,
                        "AlertMe Notifications",
                        NotificationManager.IMPORTANCE_HIGH
                    ).apply {
                        description = "AlertMe combination notifications"
                    }
                    notificationManager.createNotificationChannel(channel)
                }
                
                val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, intent, 
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) 
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    else 
                        PendingIntent.FLAG_UPDATE_CURRENT
                )
                
                val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_alert)
                    .setContentTitle("Combination Activated: $combinationName")
                    .setContentText("Message for $friendName: $message")
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true)
                    .build()
                
                notificationManager.notify(NOTIFICATION_ID, notification)
            } catch (e: Exception) {
            }
        }
    }
    
    @ReactMethod
    fun resetSequence() {
        try {
            buttonSequence.clear()
            sequenceRunnable?.let { handler.removeCallbacks(it) }
            sequenceRunnable = null
            emitJSEvent(reactApplicationContext, "resetSequence", "")
        } catch (e: Exception) {
        }
    }
}