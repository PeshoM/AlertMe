package com.peshom.mobileclient

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.KeyEvent
import androidx.core.app.NotificationCompat
import java.util.concurrent.atomic.AtomicBoolean

class ButtonHandlerService : Service() {
    private var mediaSession: MediaSession? = null
    private var audioManager: AudioManager? = null
    private var lastVolume = 0
    private val handler = Handler(Looper.getMainLooper())
    private var lastEventTime = 0L
    private val throttleTime = 500L 
    private val isServiceReady = AtomicBoolean(false)

    companion object {
        private const val NOTIFICATION_ID = 101
        private const val CHANNEL_ID = "AlertMeService"
    }

    override fun onCreate() {
        try {
            super.onCreate()
            startForeground(NOTIFICATION_ID, createNotification())
            audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            lastVolume = getSystemVolume()
            setupMediaSession()
            isServiceReady.set(true)
        } catch (e: Exception) {
            isServiceReady.set(false)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForeground(NOTIFICATION_ID, createNotification())
            }
            
            if (!isServiceReady.get()) {
                audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
                lastVolume = getSystemVolume()
                setupMediaSession()
                isServiceReady.set(true)
            }
            
            if (intent?.action == Intent.ACTION_MEDIA_BUTTON) {
                val keyEvent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(Intent.EXTRA_KEY_EVENT, KeyEvent::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(Intent.EXTRA_KEY_EVENT)
                }
                
                if (keyEvent != null) {
                    handleKeyEvent(keyEvent)
                    return START_STICKY
                }
            }
            
            when (intent?.action) {
                "volume_up" -> {
                    handleVolumeKey("volumeUp")
                    return START_STICKY
                }
                "volume_down" -> {
                    handleVolumeKey("volumeDown")
                    return START_STICKY
                }
            }
        } catch (e: Exception) {
        }
        
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun setupMediaSession() {
        try {
            mediaSession?.release()
            
            mediaSession = MediaSession(this, "AlertMeMediaSession").apply {
                setCallback(object : MediaSession.Callback() {
                    override fun onMediaButtonEvent(mediaButtonIntent: Intent): Boolean {
                        try {
                            val keyEvent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                mediaButtonIntent.getParcelableExtra(Intent.EXTRA_KEY_EVENT, KeyEvent::class.java)
                            } else {
                                @Suppress("DEPRECATION")
                                mediaButtonIntent.getParcelableExtra(Intent.EXTRA_KEY_EVENT)
                            }
                            
                            return if (keyEvent != null) {
                                handleKeyEvent(keyEvent)
                            } else {
                                super.onMediaButtonEvent(mediaButtonIntent)
                            }
                        } catch (e: Exception) {
                            return super.onMediaButtonEvent(mediaButtonIntent)
                        }
                    }
                })
                
                setPlaybackState(PlaybackState.Builder()
                    .setActions(PlaybackState.ACTION_PLAY_PAUSE)
                    .setState(PlaybackState.STATE_PLAYING, 0, 1.0f)
                    .build())
                
                isActive = true
            }
        } catch (e: Exception) {
            isServiceReady.set(false)
        }
    }

    private fun handleKeyEvent(event: KeyEvent): Boolean {
        if (!isServiceReady.get() || event.action != KeyEvent.ACTION_DOWN) {
            return false
        }
        
        return try {
            when (event.keyCode) {
                KeyEvent.KEYCODE_VOLUME_UP -> {
                    handleVolumeKey("volumeUp")
                    true
                }
                KeyEvent.KEYCODE_VOLUME_DOWN -> {
                    handleVolumeKey("volumeDown")
                    true
                }
                else -> false
            }
        } catch (e: Exception) {
            false
        }
    }

    private fun handleVolumeKey(action: String) {
        if (!isServiceReady.get()) return
        
        val currentTime = System.currentTimeMillis()
        
        if (currentTime - lastEventTime < throttleTime) {
            return
        }
        
        lastEventTime = currentTime
        
        try {
            vibrate(50)
        } catch (e: Exception) {
        }
        
        try {
            VolumeServiceModule.handleVolumeButtonPress(applicationContext, action)
        } catch (e: Exception) {
        }
        
        handler.postDelayed({
            try {
                val currentVol = audioManager?.getStreamVolume(AudioManager.STREAM_MUSIC) ?: return@postDelayed
                if (currentVol != lastVolume) {
                    audioManager?.setStreamVolume(AudioManager.STREAM_MUSIC, lastVolume, 0)
                }
            } catch (e: Exception) {
            }
        }, 300)
    }

    private fun getSystemVolume(): Int {
        return try {
            audioManager?.getStreamVolume(AudioManager.STREAM_MUSIC) ?: 0
        } catch (e: Exception) {
            0
        }
    }

    private fun vibrate(duration: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator.vibrate(
                    VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(duration)
                }
            }
        } catch (e: Exception) { }
    }

    private fun createNotification(): android.app.Notification {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "AlertMe Service",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Background service for AlertMe app"
                }
                
                val notificationManager = getSystemService(NotificationManager::class.java)
                notificationManager.createNotificationChannel(channel)
            }
            
            val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) 
                PendingIntent.FLAG_IMMUTABLE 
            else 
                PendingIntent.FLAG_UPDATE_CURRENT
                
            val pendingIntent = PendingIntent.getActivity(
                this, 0, 
                packageManager.getLaunchIntentForPackage(packageName), 
                pendingIntentFlags
            )
            
            return NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("AlertMe")
                .setContentText("Listening for combinations")
                .setSmallIcon(android.R.drawable.ic_lock_silent_mode_off)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setContentIntent(pendingIntent)
                .build()
        } catch (e: Exception) {
            return NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("AlertMe")
                .setContentText("Service running")
                .setSmallIcon(android.R.drawable.ic_lock_silent_mode_off)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build()
        }
    }

    override fun onDestroy() {
        isServiceReady.set(false)
        
        try {
            if (mediaSession != null) {
                mediaSession?.isActive = false
                mediaSession?.release()
                mediaSession = null
            }
        } catch (e: Exception) {
        }
        
        super.onDestroy()
    }
}