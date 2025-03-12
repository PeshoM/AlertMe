package com.peshom.mobileclient

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import android.os.Build
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat

class ButtonHandlerService : Service() {

    private lateinit var volumeReceiver: BroadcastReceiver
    private lateinit var volumeEventReceiver: BroadcastReceiver
    private var previousVolume: Int = -1
    private val CHANNEL_ID = "VolumeServiceChannel"
    private lateinit var audioManager: AudioManager
    private var maxVolume: Int = 0
    
    // Flag to indicate if we're ignoring volume change events temporarily
    private var ignoreNextVolumeChange = false
    
    // Handler for delaying operations
    private val handler = Handler(Looper.getMainLooper())

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()
        startForeground()
        registerVolumeReceiver()
        registerVolumeEventReceiver()
        
        // Ensure volume is within our working range
        ensureVolumeInWorkingRange()
        
        return Service.START_STICKY
    }
    
    /**
     * Ensures volume is within 1 to maxVolume-1 range without triggering events
     */
    private fun ensureVolumeInWorkingRange() {
        val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        
        if (currentVolume >= maxVolume) {
            // Set to max-1
            ignoreNextVolumeChange = true
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume - 1, 0)
        } else if (currentVolume <= 0) {
            // Set to 1
            ignoreNextVolumeChange = true
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 1, 0)
        }
        
        // Initialize previousVolume after any adjustments
        previousVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
    }

    private fun startForeground() {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Volume Monitor")
            .setContentText("Listening for volume buttons")
            .setSmallIcon(R.drawable.ic_notification)
            .build()

        startForeground(1, notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Volume Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun showNotification(message: String) {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("AlertMe")
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_notification)
            .build()

        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun registerVolumeReceiver() {
        volumeReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (intent?.action == "android.media.VOLUME_CHANGED_ACTION") {
                    // Get current volume
                    val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
                    
                    // If we're ignoring this event, reset the flag and return
                    if (ignoreNextVolumeChange) {
                        ignoreNextVolumeChange = false
                        previousVolume = currentVolume
                        return
                    }
                    
                    // Process the volume change (only if it's actually changed)
                    if (previousVolume != -1 && currentVolume != previousVolume) {
                        if (currentVolume > previousVolume) {
                            // Volume up detected
                            showNotification("Volume Up! Current Volume: $currentVolume")
                            // Send event to React Native
                            val params = VolumeServiceModule.createEventParams("volumeUp", currentVolume)
                            VolumeServiceModule.emitJSEvent(this@ButtonHandlerService, "VolumeEvent", params)
                        } else if (currentVolume < previousVolume) {
                            // Volume down detected
                            showNotification("Volume Down! Current Volume: $currentVolume")
                            // Send event to React Native
                            val params = VolumeServiceModule.createEventParams("volumeDown", currentVolume)
                            VolumeServiceModule.emitJSEvent(this@ButtonHandlerService, "VolumeEvent", params)
                        }
                    }
                    
                    // Save current volume before potentially adjusting it
                    previousVolume = currentVolume
                    
                    // Keep volume in our working range, but ignore the resulting volume change event
                    if (currentVolume >= maxVolume) {
                        ignoreNextVolumeChange = true
                        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume - 1, 0)
                    } else if (currentVolume <= 0) {
                        ignoreNextVolumeChange = true
                        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 1, 0)
                    }
                }
            }
        }
        val filter = IntentFilter("android.media.VOLUME_CHANGED_ACTION")
        registerReceiver(volumeReceiver, filter)
    }

    private fun registerVolumeEventReceiver() {
        volumeEventReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (intent?.action == "com.peshom.VOLUME_EVENT") {
                    val action = intent.getStringExtra("action") ?: return
                    val volume = intent.getIntExtra("volume", -1)
                    
                    // Show a notification that we received a direct volume button press
                    val message = when (action) {
                        "volumeUp" -> "Volume Up Button Pressed! Current: $volume"
                        "volumeDown" -> "Volume Down Button Pressed! Current: $volume"
                        else -> "Unknown volume action: $action"
                    }
                    
                    showNotification(message)
                    
                    // Make sure volume stays in our working range even for direct button events
                    handler.post {
                        ensureVolumeInWorkingRange()
                    }
                    
                    // Forward this event to React Native
                    val params = VolumeServiceModule.createEventParams(action, volume)
                    VolumeServiceModule.emitJSEvent(this@ButtonHandlerService, "VolumeEvent", params)
                }
            }
        }
        val filter = IntentFilter("com.peshom.VOLUME_EVENT")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(volumeEventReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(volumeEventReceiver, filter)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)
        unregisterReceiver(volumeReceiver)
        unregisterReceiver(volumeEventReceiver)
    }

    companion object {
        // If we needed to share state across service instances,
        // we could put static variables here
    }
}