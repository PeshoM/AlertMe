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
import androidx.core.app.NotificationCompat

class VolumeServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    init {
        setReactApplicationContext(reactContext)
    }

    override fun getName(): String = "VolumeServiceModule"

    companion object {
        private val buttonSequence = ArrayList<String>()
        private const val SEQUENCE_TIMEOUT = 3000L
        private var sequenceTimer: Thread? = null
        private var combinations = JSONArray()
        private var friends = JSONArray()
        private const val CHANNEL_ID = "AlertMe_Channel"
        private const val NOTIFICATION_ID = 123
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
            val contextToUse = context ?: reactApplicationContext
            if (contextToUse == null) return
            
            val params = createParams(event, action)
            UiThreadUtil.runOnUiThread {
                contextToUse.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("VolumeEvent", params)
            }
        }
        
        fun emitJSEvent(event: String, params: WritableMap) {
            UiThreadUtil.runOnUiThread {
                val appContext = reactApplicationContext
                appContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit(event, params)
            }
        }

        fun addButtonToSequence(action: String) {
            buttonSequence.add(action)
            
            sequenceTimer?.interrupt()
            
            sequenceTimer = Thread {
                    Thread.sleep(SEQUENCE_TIMEOUT)
                    buttonSequence.clear()
                
            }
            sequenceTimer?.start()
        }
        
        fun setCombinations(combinationsArray: ReadableArray) {
            val jsonArray = JSONArray()
            for (i in 0 until combinationsArray.size()) {
                val combination = combinationsArray.getMap(i)
                val jsonObject = JSONObject()
                
                jsonObject.put("id", combination?.getString("id") ?: "")
                jsonObject.put("name", combination?.getString("name") ?: "")
                jsonObject.put("userId", combination?.getString("userId") ?: "")
                jsonObject.put("friendId", combination?.getString("friendId") ?: "")
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
        }
        
        fun setFriends(friendsArray: ReadableArray) {
            val jsonArray = JSONArray()
            for (i in 0 until friendsArray.size()) {
                val friend = friendsArray.getMap(i)
                val jsonObject = JSONObject()
                
                jsonObject.put("id", friend?.getString("id") ?: "")
                jsonObject.put("username", friend?.getString("username") ?: "")
                jsonObject.put("name", friend?.getString("name") ?: "")
                
                jsonArray.put(jsonObject)
            }
            friends = jsonArray
        }
        
        fun handleVolumeButtonPress(context: Context?, volumeKey: String) {
            if (context is ReactApplicationContext) {
                emitJSEvent(context, "volume", volumeKey)
            } else {
                emitJSEvent(reactApplicationContext, "volume", volumeKey)
            }
            
            addButtonToSequence(volumeKey)
            checkForMatchingCombination(context)
        }
        
        private fun checkForMatchingCombination(context: Context?) {
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
                    if (buttonSequence[j] != sequenceArray.getString(j)) {
                        isMatch = false
                        break
                    }
                }
                
                if (isMatch) {
                    val name = combination.getString("name")
                    val message = combination.getString("message")
                    val friendId = combination.getString("friendId")
                    val combinationId = combination.getString("id")
                    
                    var friendName = "Friend"
                    for (k in 0 until friends.length()) {
                        val friend = friends.getJSONObject(k)
                        if (friend.getString("id") == friendId) {
                            friendName = friend.getString("name")
                            break
                        }
                    }
                    
                    if (context != null) {
                        sendNotification(context, name, message, friendName)
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
                    
                    UiThreadUtil.runOnUiThread {
                        val appContext = reactApplicationContext
                        appContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            ?.emit("CombinationEvent", params)
                    }
                    
                    buttonSequence.clear()
                    sequenceTimer?.interrupt()
                    break
                }
            }
        }
        
        private fun sendNotification(context: Context, combinationName: String, message: String, friendName: String) {
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
        }
    }
    
    @ReactMethod
    fun resetSequence() {
        buttonSequence.clear()
        sequenceTimer?.interrupt()
        emitJSEvent(reactApplicationContext, "resetSequence", "")
    }
}