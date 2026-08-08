package com.example.floatingsidebar

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView

class FloatingService : Service() {

    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null

    override fun onCreate() {
        super.onCreate()
        startForegroundService()
        initFloatingView()
    }

    private fun startForegroundService() {
        val channelId = "floating_sidebar_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Barre Latérale Flottante",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, channelId)
                .setContentTitle("Barre Latérale Active")
                .setContentText("L'overlay flottant est en cours d'exécution.")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle("Barre Latérale Active")
                .setContentText("L'overlay flottant est en cours d'exécution.")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .build()
        }

        startForeground(1, notification)
    }

    private fun initFloatingView() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val paramsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            paramsType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.END
            x = 0
            y = 300
        }

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#CC2E3036"))
            setPadding(16, 24, 16, 24)
        }

        val title = TextView(this).apply {
            text = "SideFlow Pro"
            setTextColor(Color.WHITE)
            textSize = 14f
        }
        layout.addView(title)

        floatingView = layout
        windowManager.addView(floatingView, params)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        floatingView?.let { windowManager.removeView(it) }
    }
}
