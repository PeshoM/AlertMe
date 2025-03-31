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
import android.util.Log
import androidx.core.app.NotificationCompat

class ButtonHandlerService : Service() {

    private lateinit var volumeReceiver: BroadcastReceiver
    private var previousVolume: Int = -1
    private var ignoreNextVolumeChange = false
    private var isInitialVolumeCaptured = false
    private var lastEventTime = 0L
    private val EVENT_THROTTLE_MS = 300
    private val CHANNEL_ID = "VolumeServiceChannel"
    private lateinit var audioManager: AudioManager
    private var maxVolume: Int = 0
    private var isAdjustingVolume = false

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

        val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        if (currentVolume == maxVolume) {
            isAdjustingVolume = true
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume - 1, 0)
            isAdjustingVolume = false
        } else if (currentVolume == 0) {
            isAdjustingVolume = true
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 1, 0)
            isAdjustingVolume = false
        }

        return Service.START_STICKY
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

        previousVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        isInitialVolumeCaptured = true
        Log.d("ButtonHandlerService", "Initial volume set to: $previousVolume")
        
        volumeReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent?) {
                if (intent?.action == "android.media.VOLUME_CHANGED_ACTION") {
                    val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
                    Log.d("ButtonHandlerService", "Volume event received: current=$currentVolume, previous=$previousVolume")
                    
                    if (ignoreNextVolumeChange) {
                        Log.d("ButtonHandlerService", "Ignoring volume change as flagged")
                        ignoreNextVolumeChange = false
                        previousVolume = currentVolume
                        return
                    }
                    
                    if (isInitialVolumeCaptured && currentVolume != previousVolume) {
                        if (currentVolume > previousVolume) {
                            Log.d("ButtonHandlerService", "Volume Up! Current Volume: $currentVolume")
                            val params = VolumeServiceModule.createEventParams("volumeUp", currentVolume)
                            VolumeServiceModule.emitJSEvent("VolumeEvent", params)
                        } else if (currentVolume < previousVolume) {
                            Log.d("ButtonHandlerService", "Volume Down! Current Volume: $currentVolume")
                            val params = VolumeServiceModule.createEventParams("volumeDown", currentVolume)
                            VolumeServiceModule.emitJSEvent("VolumeEvent", params)
                        }
                    }
                    
                    previousVolume = currentVolume
                    
                    if (currentVolume == 0) {
                        Log.d("ButtonHandlerService", "Adjusting volume from 0 to 1")
                        ignoreNextVolumeChange = true
                        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 1, 0)
                    } else if (currentVolume == maxVolume) {
                        Log.d("ButtonHandlerService", "Adjusting volume from max to max-1")
                        ignoreNextVolumeChange = true
                        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume - 1, 0)
                    }
                }
            }
        }
        val filter = IntentFilter("android.media.VOLUME_CHANGED_ACTION")
        registerReceiver(volumeReceiver, filter)
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(volumeReceiver)
    }
}