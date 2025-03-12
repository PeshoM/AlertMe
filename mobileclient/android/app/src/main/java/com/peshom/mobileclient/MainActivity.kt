package com.peshom.mobileclient

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  private var isProcessingVolumeKey = false

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "mobileclient"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
      
  /**
   * Handle physical volume button presses
   * This detects the actual button press event, not just volume changes
   * So it works even when volume is at min or max
   */
  override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    // Prevent multiple rapid events
    if (isProcessingVolumeKey) {
      return true
    }
    
    val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
    val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
    
    when (keyCode) {
      KeyEvent.KEYCODE_VOLUME_UP -> {
        isProcessingVolumeKey = true
        
        // Broadcast the button press event
        val intent = Intent("com.peshom.VOLUME_EVENT")
        intent.putExtra("action", "volumeUp")
        intent.putExtra("volume", currentVolume)
        sendBroadcast(intent)
        
        // Prevent volume from reaching maximum
        if (currentVolume >= maxVolume - 1) {
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume - 1, 0)
            isProcessingVolumeKey = false
            return true // consume the event if we're at max-1
        }
        
        isProcessingVolumeKey = false
        return super.onKeyDown(keyCode, event)
      }
      KeyEvent.KEYCODE_VOLUME_DOWN -> {
        isProcessingVolumeKey = true
        
        // Broadcast the button press event
        val intent = Intent("com.peshom.VOLUME_EVENT")
        intent.putExtra("action", "volumeDown")
        intent.putExtra("volume", currentVolume)
        sendBroadcast(intent)
        
        // Prevent volume from reaching minimum
        if (currentVolume <= 1) {
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 1, 0)
            isProcessingVolumeKey = false
            return true // consume the event if we're at 1
        }
        
        isProcessingVolumeKey = false
        return super.onKeyDown(keyCode, event)
      }
    }
    return super.onKeyDown(keyCode, event)
  }
}