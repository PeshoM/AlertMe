package com.peshom.mobileclient

import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.media.VolumeProviderCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat

class PlayService : Service() {
    private lateinit var mediaSession: MediaSessionCompat

    override fun onCreate() {
        super.onCreate()
        
        mediaSession = MediaSessionCompat(this, "PlayService")
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
                MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS)
        mediaSession.setPlaybackState(PlaybackStateCompat.Builder()
                .setState(PlaybackStateCompat.STATE_PLAYING, 0, 0f)
                .build())

        val myVolumeProvider =
                object : VolumeProviderCompat(VolumeProviderCompat.VOLUME_CONTROL_RELATIVE, 100, 50) {
            override fun onAdjustVolume(direction: Int) {
                when (direction) {
                    -1 -> {
                        val intent = Intent(applicationContext, ButtonHandlerService::class.java)
                        intent.action = "volume_down"
                        startService(intent)
                    }
                    1 -> {
                        val intent = Intent(applicationContext, ButtonHandlerService::class.java)
                        intent.action = "volume_up"
                        startService(intent)
                    }
                }
            }
        }

        mediaSession.setPlaybackToRemote(myVolumeProvider)
        mediaSession.isActive = true
    }

    override fun onBind(intent: Intent): IBinder? = null

    override fun onDestroy() {
        mediaSession.release()
        super.onDestroy()
    }
}