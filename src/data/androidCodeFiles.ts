import { CodeFile } from '../types/android';

export const ANDROID_CODE_FILES: CodeFile[] = [
  {
    id: 'manifest',
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    language: 'xml',
    description: 'Manifeste Android principal avec autorisations SYSTEM_ALERT_WINDOW et déclaration du Service.',
    contentXml: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.floatingsidebar">

    <!-- Autorisation d'affichage en superposition (Floating Overlay) -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- Service en arrière-plan pour maintenir la barre flottante active -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" 
        tools:targetApi="34" />

    <!-- Notification Foreground pour Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Vibrations pour retours haptiques au glisser/déposer -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Détection des applications installées pour les raccourcis -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"
        tools:ignore="QueryAllPackagesPermission" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FloatingSidebar">

        <!-- Écran de configuration principal -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.FloatingSidebar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Service d'arrière-plan de la Barre Latérale Flottante -->
        <service
            android:name=".FloatingService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse"
            tools:targetApi="34" />

    </application>

</manifest>`
  },
  {
    id: 'floating_service',
    filename: 'FloatingService.kt / .java',
    path: 'app/src/main/java/com/example/floatingsidebar/FloatingService.kt',
    category: 'code',
    language: 'kotlin',
    description: 'Service d\'overlay principal gérant la fenêtre WindowManager, le Drag & Drop vertical, la barre latérale et le presse-papier.',
    contentKotlin: `package com.example.floatingsidebar

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import kotlin.math.abs

/**
 * Service Android en arrière-plan responsable d'afficher la barre latérale flottante (Overlay Window).
 * Optimisé pour tablettes et téléphones Android (API 24+).
 */
class FloatingService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var floatingView: View
    private lateinit var sidebarView: View
    private lateinit var layoutParams: WindowManager.LayoutParams

    private lateinit var clipboardManager: ClipboardManager
    private var clipboardListener: ClipboardManager.OnPrimaryClipChangedListener? = null

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var isSidebarExpanded = false

    // Positionnement sur le bord (Gauche ou Droite)
    private var isDockedRight = true

    companion object {
        const val CHANNEL_ID = "FloatingSidebarChannel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_STOP_SERVICE = "ACTION_STOP_SERVICE"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        clipboardManager = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager

        // Démarrage en Service Foreground pour éviter le kill de la mémoire
        startForegroundServiceNotification()

        // Initialisation de la vue de l'onglet flottant
        initFloatingWidget()

        // Écoute du Presse-papier
        setupClipboardListener()
    }

    private fun startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Barre Latérale Flottante Active",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Maintient l'overlay flottant toujours accessible"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val openIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Barre Latérale Flottante")
            .setContentText("L'overlay est actif sur votre écran")
            .setSmallIcon(R.drawable.ic_sidebar_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun initFloatingWidget() {
        val inflater = LayoutInflater.from(this)
        floatingView = inflater.inflate(R.layout.widget_floating_handle, null)
        sidebarView = floatingView.findViewById(R.id.sidebar_expanded_container)

        // Configuration des LayoutParams WindowManager (SYSTEM_ALERT_WINDOW)
        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.END // Ancré à droite par défaut
            x = 0
            y = 300 // Hauteur initiale
        }

        // Ajouter la vue sur l'écran
        windowManager.addView(floatingView, layoutParams)

        // Gestion du Drag & Drop vertical sur la poignée flottante
        val handleIcon = floatingView.findViewById<View>(R.id.floating_handle_icon)
        handleIcon.setOnTouchListener(object : View.OnTouchListener {
            private var CLICK_ACTION_THRESHOLD = 15

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = layoutParams.x
                        initialY = layoutParams.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val deltaY = (event.rawY - initialTouchY).toInt()
                        layoutParams.y = initialY + deltaY
                        // Mise à jour fluide sans réinstancier de vue
                        windowManager.updateViewLayout(floatingView, layoutParams)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val diffX = abs(event.rawX - initialTouchX)
                        val diffY = abs(event.rawY - initialTouchY)

                        // Si le mouvement est très faible -> C'est un clic pour déplier/replier
                        if (diffX < CLICK_ACTION_THRESHOLD && diffY < CLICK_ACTION_THRESHOLD) {
                            toggleSidebar()
                        }
                        return true
                    }
                }
                return false
            }
        })

        // Configuration des actions dans la barre latérale développée
        setupSidebarActions()
    }

    private fun toggleSidebar() {
        isSidebarExpanded = !isSidebarExpanded

        if (isSidebarExpanded) {
            sidebarView.visibility = View.VISIBLE
            sidebarView.alpha = 0f
            sidebarView.translationX = if (isDockedRight) 150f else -150f
            sidebarView.animate()
                .alpha(1f)
                .translationX(0f)
                .setDuration(250)
                .setInterpolator(DecelerateInterpolator())
                .start()
            
            // Mise à jour des infos du presse-papier
            refreshClipboardPreview()
        } else {
            sidebarView.animate()
                .alpha(0f)
                .translationX(if (isDockedRight) 150f else -150f)
                .setDuration(200)
                .withEndAction {
                    sidebarView.visibility = View.GONE
                }
                .start()
        }
    }

    private fun setupSidebarActions() {
        // Raccourcis rapides d'applications
        floatingView.findViewById<View>(R.id.btn_shortcut_calc)?.setOnClickListener {
            launchApp("com.google.android.calculator", "com.sec.android.app.popupcalculator")
        }
        floatingView.findViewById<View>(R.id.btn_shortcut_browser)?.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://www.google.com")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
            toggleSidebar()
        }
        floatingView.findViewById<View>(R.id.btn_shortcut_notes)?.setOnClickListener {
            launchApp("com.google.android.keep", "com.samsung.android.app.notes")
        }

        // Bouton Paramètres
        floatingView.findViewById<View>(R.id.btn_shortcut_settings)?.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
            toggleSidebar()
        }

        // Bouton de Fermeture
        floatingView.findViewById<View>(R.id.btn_close_sidebar)?.setOnClickListener {
            toggleSidebar()
        }

        // Bouton Copier depuis le mini presse-papier
        floatingView.findViewById<View>(R.id.btn_copy_clipboard)?.setOnClickListener {
            val tvClip = floatingView.findViewById<TextView>(R.id.tv_clipboard_text)
            val textToCopy = tvClip.text.toString()
            if (textToCopy.isNotEmpty() && textToCopy != "Aucun texte copié") {
                val clip = android.content.ClipData.newPlainText("OverlayCopy", textToCopy)
                clipboardManager.setPrimaryClip(clip)
                Toast.makeText(this, "Texte copié dans le presse-papier !", Toast.LENGTH_SHORT).show()
                vibrateFeedback()
            }
        }
    }

    private fun setupClipboardListener() {
        clipboardListener = ClipboardManager.OnPrimaryClipChangedListener {
            refreshClipboardPreview()
        }
        clipboardManager.addPrimaryClipChangedListener(clipboardListener)
    }

    private fun refreshClipboardPreview() {
        val tvClip = floatingView.findViewById<TextView>(R.id.tv_clipboard_text) ?: return
        val clipData = clipboardManager.primaryClip
        if (clipData != null && clipData.itemCount > 0) {
            val text = clipData.getItemAt(0).text
            if (!text.isNull_empty()) {
                tvClip.text = text
                return
            }
        }
        tvClip.text = "Aucun texte copié"
    }

    private fun launchApp(vararg packageNames: String) {
        val pm = packageManager
        for (pkg in packageNames) {
            val intent = pm.getLaunchIntentForPackage(pkg)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
                toggleSidebar()
                return
            }
        }
        Toast.makeText(this, "Application non installée", Toast.LENGTH_SHORT).show()
    }

    private fun vibrateFeedback() {
        val vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(40)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::floatingView.isInitialized) {
            windowManager.removeView(floatingView)
        }
        clipboardListener?.let {
            clipboardManager.removePrimaryClipChangedListener(it)
        }
    }
}

// Extension utile
private fun CharSequence?.isNull_empty(): Boolean = this == null || this.isEmpty()
`,
    contentJava: `package com.example.floatingsidebar;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * Service Android en Java pur (Zero dépendances externes).
 * Utilise WindowManager avec SYSTEM_ALERT_WINDOW pour l'overlay.
 */
public class FloatingService extends Service {

    private WindowManager windowManager;
    private View floatingView;
    private View sidebarView;
    private WindowManager.LayoutParams layoutParams;
    private ClipboardManager clipboardManager;
    private ClipboardManager.OnPrimaryClipChangedListener clipboardListener;

    private int initialX, initialY;
    private float initialTouchX, initialTouchY;
    private boolean isSidebarExpanded = false;

    public static final String CHANNEL_ID = "FloatingSidebarChannel";
    public static final int NOTIFICATION_ID = 1001;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        clipboardManager = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);

        startForegroundServiceNotification();
        initFloatingWidget();
        setupClipboardListener();
    }

    private void startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Barre Latérale Flottante",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        Intent openIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Barre Latérale Flottante")
                .setContentText("L'overlay est actif")
                .setSmallIcon(R.drawable.ic_sidebar_launcher)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();

        startForeground(NOTIFICATION_ID, notification);
    }

    private void initFloatingWidget() {
        LayoutInflater inflater = LayoutInflater.from(this);
        floatingView = inflater.inflate(R.layout.widget_floating_handle, null);
        sidebarView = floatingView.findViewById(R.id.sidebar_expanded_container);

        int layoutType = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ?
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY :
                WindowManager.LayoutParams.TYPE_PHONE;

        layoutParams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT
        );

        layoutParams.gravity = Gravity.TOP | Gravity.END;
        layoutParams.x = 0;
        layoutParams.y = 300;

        windowManager.addView(floatingView, layoutParams);

        View handleIcon = floatingView.findViewById(R.id.floating_handle_icon);
        handleIcon.setOnTouchListener(new View.OnTouchListener() {
            private static final int CLICK_THRESHOLD = 15;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = layoutParams.x;
                        initialY = layoutParams.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int deltaY = (int) (event.getRawY() - initialTouchY);
                        layoutParams.y = initialY + deltaY;
                        windowManager.updateViewLayout(floatingView, layoutParams);
                        return true;
                    case MotionEvent.ACTION_UP:
                        float diffX = Math.abs(event.getRawX() - initialTouchX);
                        float diffY = Math.abs(event.getRawY() - initialTouchY);
                        if (diffX < CLICK_THRESHOLD && diffY < CLICK_THRESHOLD) {
                            toggleSidebar();
                        }
                        return true;
                }
                return false;
            }
        });

        setupSidebarActions();
    }

    private void toggleSidebar() {
        isSidebarExpanded = !isSidebarExpanded;
        if (isSidebarExpanded) {
            sidebarView.setVisibility(View.VISIBLE);
            sidebarView.setAlpha(0f);
            sidebarView.animate().alpha(1f).setDuration(250).start();
            refreshClipboardPreview();
        } else {
            sidebarView.animate().alpha(0f).setDuration(200).withEndAction(new Runnable() {
                @Override
                public void run() {
                    sidebarView.setVisibility(View.GONE);
                }
            }).start();
        }
    }

    private void setupSidebarActions() {
        View btnClose = floatingView.findViewById(R.id.btn_close_sidebar);
        if (btnClose != null) {
            btnClose.setOnClickListener(v -> toggleSidebar());
        }

        View btnSettings = floatingView.findViewById(R.id.btn_shortcut_settings);
        if (btnSettings != null) {
            btnSettings.setOnClickListener(v -> {
                Intent intent = new Intent(FloatingService.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                toggleSidebar();
            });
        }
    }

    private void setupClipboardListener() {
        clipboardListener = this::refreshClipboardPreview;
        clipboardManager.addPrimaryClipChangedListener(clipboardListener);
    }

    private void refreshClipboardPreview() {
        TextView tvClip = floatingView.findViewById(R.id.tv_clipboard_text);
        if (tvClip == null) return;

        ClipData clip = clipboardManager.getPrimaryClip();
        if (clip != null && clip.getItemCount() > 0) {
            CharSequence text = clip.getItemAt(0).getText();
            if (text != null && text.length() > 0) {
                tvClip.setText(text);
                return;
            }
        }
        tvClip.setText("Aucun texte copié");
    }

    @Override
    public void onDestroy() {
        super.onDestroy() ;
        if (floatingView != null && windowManager != null) {
            windowManager.removeView(floatingView);
        }
        if (clipboardListener != null && clipboardManager != null) {
            clipboardManager.removePrimaryClipChangedListener(clipboardListener);
        }
    }
}`
  },
  {
    id: 'main_activity',
    filename: 'MainActivity.kt / .java',
    path: 'app/src/main/java/com/example/floatingsidebar/MainActivity.kt',
    category: 'code',
    language: 'kotlin',
    description: 'Activité de démarrage : vérification des autorisations SYSTEM_ALERT_WINDOW et panneau de configuration.',
    contentKotlin: `package com.example.floatingsidebar

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.RadioGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView
import com.google.android.material.materialswitch.MaterialSwitch

/**
 * Interface d'administration pour autoriser la superposition et activer/désactiver la barre latérale.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var switchService: MaterialSwitch
    private lateinit var btnGrantOverlay: Button
    private lateinit var cardStatus: MaterialCardView

    // Launcher pour demander la permission d'overlay
    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        checkOverlayPermissionAndSetupUI()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()
        setContentView(R.layout.activity_main)

        switchService = findViewById(R.id.switch_enable_service)
        btnGrantOverlay = findViewById(R.id.btn_grant_overlay_permission)
        cardStatus = findViewById(R.id.card_permission_status)

        // Bouton de demande d'autorisation
        btnGrantOverlay.setOnClickListener {
            requestOverlayPermission()
        }

        // Interrupteur ON/OFF du service
        switchService.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                if (hasOverlayPermission()) {
                    startFloatingService()
                } else {
                    switchService.isChecked = false
                    Toast.makeText(this, "Veuillez accorder la permission de superposition d'abord", Toast.LENGTH_LONG).show()
                    requestOverlayPermission()
                }
            } else {
                stopFloatingService()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        checkOverlayPermissionAndSetupUI()
    }

    private fun hasOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }
    }

    private fun checkOverlayPermissionAndSetupUI() {
        val granted = hasOverlayPermission()
        if (granted) {
            btnGrantOverlay.text = "Permission Accordée ✓"
            btnGrantOverlay.isEnabled = false
            switchService.isEnabled = true
        } else {
            btnGrantOverlay.text = "Accorder l'autorisation Superposition"
            btnGrantOverlay.isEnabled = true
            switchService.isEnabled = false
            switchService.isChecked = false
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            overlayPermissionLauncher.launch(intent)
        }
    }

    private fun startFloatingService() {
        val intent = Intent(this, FloatingService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        Toast.makeText(this, "Barre Flottante Activée !", Toast.LENGTH_SHORT).show()
    }

    private fun stopFloatingService() {
        val intent = Intent(this, FloatingService::class.java)
        stopService(intent)
        Toast.makeText(this, "Barre Flottante Désactivée", Toast.LENGTH_SHORT).show()
    }
}`,
    contentJava: `package com.example.floatingsidebar;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.materialswitch.MaterialSwitch;

public class MainActivity extends AppCompatActivity {

    private MaterialSwitch switchService;
    private Button btnGrantOverlay;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        switchService = findViewById(R.id.switch_enable_service);
        btnGrantOverlay = findViewById(R.id.btn_grant_overlay_permission);

        btnGrantOverlay.setOnClickListener(v -> requestOverlayPermission());

        switchService.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                if (hasOverlayPermission()) {
                    startFloatingService();
                } else {
                    switchService.setChecked(false);
                    Toast.makeText(MainActivity.this, "Permission requise !", Toast.LENGTH_SHORT).show();
                    requestOverlayPermission();
                }
            } else {
                stopFloatingService();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        checkOverlayPermissionAndSetupUI();
    }

    private boolean hasOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(this);
        }
        return true;
    }

    private void checkOverlayPermissionAndSetupUI() {
        boolean granted = hasOverlayPermission();
        btnGrantOverlay.setEnabled(!granted);
        btnGrantOverlay.setText(granted ? "Permission Accordée ✓" : "Accorder Superposition");
        switchService.setEnabled(granted);
    }

    private void requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName())
            );
            startActivityForResult(intent, 1234);
        }
    }

    private void startFloatingService() {
        Intent intent = new Intent(this, FloatingService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
    }

    private void stopFloatingService() {
        Intent intent = new Intent(this, FloatingService.class);
        stopService(intent);
    }
}`
  },
  {
    id: 'widget_handle_xml',
    filename: 'widget_floating_handle.xml',
    path: 'app/src/main/res/layout/widget_floating_handle.xml',
    category: 'layout',
    language: 'xml',
    description: 'Layout XML combiné pour l\'onglet réduit sur le bord et la barre développée.',
    contentXml: `<?xml version="1.0" encoding="utf-8"?>
<!-- FrameLayout racine de l'Overlay Floating Window -->
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:clipChildren="false"
    android:clipToPadding="false">

    <!-- POIGNÉE FLOTTANTE / ONGLET RÉDUIT -->
    <LinearLayout
        android:id="@+id/floating_handle_icon"
        android:layout_width="48dp"
        android:layout_height="80dp"
        android:layout_gravity="top|end"
        android:background="@drawable/bg_floating_handle"
        android:clickable="true"
        android:focusable="true"
        android:gravity="center"
        android:elevation="8dp"
        android:orientation="vertical">

        <!-- Lignes d'indicateur de glissement (Grip Dots) -->
        <View
            android:layout_width="16dp"
            android:layout_height="3dp"
            android:layout_marginBottom="4dp"
            android:background="#80FFFFFF" />

        <ImageView
            android:layout_width="24dp"
            android:layout_height="24dp"
            android:contentDescription="Ouvrir la barre latérale"
            android:src="@android:drawable/ic_menu_compass"
            app:tint="#FFFFFF" />

        <View
            android:layout_width="16dp"
            android:layout_height="3dp"
            android:layout_marginTop="4dp"
            android:background="#80FFFFFF" />

    </LinearLayout>

    <!-- PANNEAU DE LA BARRE LATÉRALE DÉVELOPPÉE (Masqué par défaut) -->
    <include
        layout="@layout/layout_sidebar_expanded"
        android:id="@+id/sidebar_expanded_container"
        android:layout_width="280dp"
        android:layout_height="wrap_content"
        android:layout_marginEnd="56dp"
        android:visibility="gone" />

</FrameLayout>`
  },
  {
    id: 'sidebar_expanded_xml',
    filename: 'layout_sidebar_expanded.xml',
    path: 'app/src/main/res/layout/layout_sidebar_expanded.xml',
    category: 'layout',
    language: 'xml',
    description: 'Structure XML de la barre latérale développée avec raccourcis, mini presse-papier et paramètres.',
    contentXml: `<?xml version="1.0" encoding="utf-8"?>
<!-- Panneau latéral Material You épuré -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="280dp"
    android:layout_height="wrap_content"
    android:background="@drawable/bg_sidebar"
    android:elevation="12dp"
    android:orientation="vertical"
    android:padding="16dp">

    <!-- En-tête avec titre et bouton fermer -->
    <RelativeLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="12dp">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_centerVertical="true"
            android:text="Barre Latérale"
            android:textColor="#1F2937"
            android:textSize="18sp"
            android:textStyle="bold" />

        <ImageButton
            android:id="@+id/btn_close_sidebar"
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:layout_alignParentEnd="true"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="Fermer"
            android:src="@android:drawable/ic_menu_close_clear_cancel"
            app:tint="#6B7280" />
    </RelativeLayout>

    <!-- SECTION 1: RACCOURCIS RAPIDES D'APPLICATIONS -->
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="8dp"
        android:text="Raccourcis rapides"
        android:textColor="#4B5563"
        android:textSize="12sp"
        android:textStyle="bold" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="16dp"
        android:orientation="horizontal">

        <!-- Raccourci Calculatrice -->
        <LinearLayout
            android:id="@+id/btn_shortcut_calc"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:background="?attr/selectableItemBackground"
            android:clickable="true"
            android:focusable="true"
            android:gravity="center"
            android:orientation="vertical"
            android:padding="8dp">

            <ImageView
                android:layout_width="36dp"
                android:layout_height="36dp"
                android:background="@drawable/bg_icon_circle_blue"
                android:padding="8dp"
                android:src="@android:drawable/ic_menu_edit"
                app:tint="#FFFFFF" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="4dp"
                android:text="Calculs"
                android:textColor="#374151"
                android:textSize="11sp" />
        </LinearLayout>

        <!-- Raccourci Navigateur Web -->
        <LinearLayout
            android:id="@+id/btn_shortcut_browser"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:background="?attr/selectableItemBackground"
            android:clickable="true"
            android:focusable="true"
            android:gravity="center"
            android:orientation="vertical"
            android:padding="8dp">

            <ImageView
                android:layout_width="36dp"
                android:layout_height="36dp"
                android:background="@drawable/bg_icon_circle_purple"
                android:padding="8dp"
                android:src="@android:drawable/ic_menu_compass"
                app:tint="#FFFFFF" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="4dp"
                android:text="Web"
                android:textColor="#374151"
                android:textSize="11sp" />
        </LinearLayout>

        <!-- Raccourci Prise de Notes -->
        <LinearLayout
            android:id="@+id/btn_shortcut_notes"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:background="?attr/selectableItemBackground"
            android:clickable="true"
            android:focusable="true"
            android:gravity="center"
            android:orientation="vertical"
            android:padding="8dp">

            <ImageView
                android:layout_width="36dp"
                android:layout_height="36dp"
                android:background="@drawable/bg_icon_circle_emerald"
                android:padding="8dp"
                android:src="@android:drawable/ic_menu_agenda"
                app:tint="#FFFFFF" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="4dp"
                android:text="Notes"
                android:textColor="#374151"
                android:textSize="11sp" />
        </LinearLayout>

        <!-- Raccourci Paramètres App -->
        <LinearLayout
            android:id="@+id/btn_shortcut_settings"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:background="?attr/selectableItemBackground"
            android:clickable="true"
            android:focusable="true"
            android:gravity="center"
            android:orientation="vertical"
            android:padding="8dp">

            <ImageView
                android:layout_width="36dp"
                android:layout_height="36dp"
                android:background="@drawable/bg_icon_circle_orange"
                android:padding="8dp"
                android:src="@android:drawable/ic_menu_preferences"
                app:tint="#FFFFFF" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="4dp"
                android:text="Réglages"
                android:textColor="#374151"
                android:textSize="11sp" />
        </LinearLayout>

    </LinearLayout>

    <!-- SECTION 2: MINI PRESSE-PAPIER INTEL -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="12dp"
        android:background="#F3F4F6"
        android:orientation="vertical"
        android:padding="12dp">

        <RelativeLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="6dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Dernier texte copié"
                android:textColor="#6B7280"
                android:textSize="11sp"
                android:textStyle="bold" />

            <Button
                android:id="@+id/btn_copy_clipboard"
                style="@style/Widget.Material3.Button.TextButton"
                android:layout_width="wrap_content"
                android:layout_height="28dp"
                android:layout_alignParentEnd="true"
                android:paddingHorizontal="8dp"
                android:text="Copier"
                android:textSize="11sp" />
        </RelativeLayout>

        <TextView
            android:id="@+id/tv_clipboard_text"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:ellipsize="end"
            android:maxLines="3"
            android:text="Aucun texte copié pour le moment"
            android:textColor="#1F2937"
            android:textSize="13sp" />
    </LinearLayout>

</LinearLayout>`
  },
  {
    id: 'activity_main_xml',
    filename: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    category: 'layout',
    language: 'xml',
    description: 'Layout XML de l\'écran principal de configuration.',
    contentXml: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#F8FAFC">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="20dp">

        <!-- Banner Titre -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Barre Latérale Flottante"
            android:textColor="#0F172A"
            android:textSize="24sp"
            android:textStyle="bold" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:layout_marginBottom="20dp"
            android:text="Optimisé pour tablettes Android (API 24+)"
            android:textColor="#64748B"
            android:textSize="14sp" />

        <!-- CARTE 1: ETAT PERMISSION OVERLAY -->
        <com.google.android.material.card.MaterialCardView
            android:id="@+id/card_permission_status"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="16dp"
            app:cardCornerRadius="16dp"
            app:cardElevation="2dp"
            app:strokeWidth="1dp"
            app:strokeColor="#E2E8F0">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="1. Autorisation de Superposition"
                    android:textColor="#1E293B"
                    android:textSize="16sp"
                    android:textStyle="bold" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="4dp"
                    android:layout_marginBottom="12dp"
                    android:text="Requiert la permission 'Superposition sur les autres applications' (SYSTEM_ALERT_WINDOW)."
                    android:textColor="#475569"
                    android:textSize="13sp" />

                <Button
                    android:id="@+id/btn_grant_overlay_permission"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="Accorder la permission"
                    app:cornerRadius="12dp" />

            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- CARTE 2: INTERRUPTEUR DE SERVICE -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="16dp"
            app:cardCornerRadius="16dp"
            app:cardElevation="2dp"
            app:strokeWidth="1dp"
            app:strokeColor="#E2E8F0">

            <RelativeLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="16dp">

                <LinearLayout
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_toStartOf="@id/switch_enable_service"
                    android:layout_alignParentStart="true"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="2. Activer la Barre Flottante"
                        android:textColor="#1E293B"
                        android:textSize="16sp"
                        android:textStyle="bold" />

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="2dp"
                        android:text="Affiche la poignée glissante sur le bord de l'écran"
                        android:textColor="#64748B"
                        android:textSize="12sp" />
                </LinearLayout>

                <com.google.android.material.materialswitch.MaterialSwitch
                    android:id="@+id/switch_enable_service"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_alignParentEnd="true"
                    android:layout_centerVertical="true" />

            </RelativeLayout>
        </com.google.android.material.card.MaterialCardView>

    </LinearLayout>
</ScrollView>`
  },
  {
    id: 'drawables_styles',
    filename: 'bg_floating_handle.xml & Styles',
    path: 'app/src/main/res/drawable/bg_floating_handle.xml',
    category: 'drawable',
    language: 'xml',
    description: 'Fichiers de style, bordures arrondies et couleurs pour l\'effet Material You.',
    contentXml: `<!-- res/drawable/bg_floating_handle.xml -->
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#2563EB" />
    <corners
        android:topLeftRadius="16dp"
        android:bottomLeftRadius="16dp"
        android:topRightRadius="0dp"
        android:bottomRightRadius="0dp" />
</shape>

<!-- res/drawable/bg_sidebar.xml -->
<!--
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#FFFFFF" />
    <corners android:radius="20dp" />
    <stroke android:width="1dp" android:color="#E5E7EB" />
</shape>
-->

<!-- res/values/colors.xml -->
<!--
<resources>
    <color name="primary">#2563EB</color>
    <color name="primary_dark">#1D4ED8</color>
    <color name="accent">#3B82F6</color>
</resources>
-->`
  },
  {
    id: 'anim_transitions',
    filename: 'slide_in_and_fade.xml & ObjectAnimator.kt',
    path: 'app/src/main/res/anim/slide_in_right.xml',
    category: 'drawable',
    language: 'xml',
    description: 'Animations natives Android (Slide & Fade) pour l\'ouverture et la fermeture fluides de la barre latérale.',
    contentXml: `<!-- res/anim/slide_in_right.xml -->
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android"
    android:shareInterpolator="false">
    <translate
        android:fromXDelta="100%p"
        android:toXDelta="0"
        android:duration="250"
        android:interpolator="@android:anim/decelerate_interpolator" />
    <alpha
        android:fromAlpha="0.0"
        android:toAlpha="1.0"
        android:duration="200" />
</set>

<!-- Code Kotlin pour appliquer l'animation de superposition avec ViewPropertyAnimator -->
<!--
fun animateSidebarOpen(sidebarView: View, isRightEdge: Boolean) {
    sidebarView.visibility = View.VISIBLE
    sidebarView.alpha = 0f
    sidebarView.translationX = if (isRightEdge) 200f else -200f

    sidebarView.animate()
        .alpha(1f)
        .translationX(0f)
        .setDuration(240)
        .setInterpolator(DecelerateInterpolator(1.8f))
        .start()
}

fun animateSidebarClose(sidebarView: View, isRightEdge: Boolean) {
    sidebarView.animate()
        .alpha(0f)
        .translationX(if (isRightEdge) 200f else -200f)
        .setDuration(180)
        .setInterpolator(AccelerateInterpolator())
        .withEndAction {
            sidebarView.visibility = View.GONE
        }
        .start()
}
-->`
  },
  {
    id: 'setup_instructions',
    filename: 'README_INSTALLATION.md',
    path: 'README_INSTALLATION.md',
    category: 'instructions',
    language: 'markdown',
    description: 'Guide d\'installation pas-à-pas pour Android Studio et contournement des restrictions de superposition (MIUI, Samsung, ColorOS).',
    contentMd: `# Guide de Configuration et d'Optimisation - Overlay Floating Sidebar

## 📋 Prérequis Techniques
- **Android Studio** Jellyfish / Koala ou version supérieure.
- **Android Gradle Plugin** 8.x + **Kotlin** 1.9/2.0.
- **Min SDK** : 24 (Android 7.0 Nougat).
- **Target SDK** : 34 (Android 14).

---

## 🚀 Étape 1 : Importer les fichiers dans votre projet
1. Créez un nouveau projet **Empty Views Activity** dans Android Studio avec la formule package \`com.example.floatingsidebar\`.
2. Remplacez le contenu du fichier \`AndroidManifest.xml\`.
3. Ajoutez le fichier \`FloatingService.kt\` (ou \`FloatingService.java\` selon votre préférence) dans le package principal.
4. Copiez les layouts XML dans \`res/layout/\` :
   - \`activity_main.xml\`
   - \`widget_floating_handle.xml\`
   - \`layout_sidebar_expanded.xml\`
5. Ajoutez le drawable \`bg_floating_handle.xml\` dans \`res/drawable/\`.

---

## 🔒 Étape 2 : Gestion de l'autorisation 'SYSTEM_ALERT_WINDOW'
Android exige une autorisation explicite de l'utilisateur pour afficher des éléments par-dessus d'autres applications :

1. Au premier lancement, l'application vérifie \`Settings.canDrawOverlays(context)\`.
2. Si la permission est manquante, l'écran de paramètres système s'ouvre automatiquement :
   \`Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + packageName))\`.
3. L'utilisateur doit basculer l'interrupteur sur **Autorisé**.

---

## ⚡ Étape 3 : Spécificités Constructeurs (Xiaomi, Samsung, Huawei, Oppo)
Certaines surcouches constructeurs possèdent des restrictions agressives sur les services en arrière-plan :

- **Xiaomi / MIUI / HyperOS** :
  - Aller dans *Paramètres > Applications > Gérer les applications > Votre App*.
  - Activer **Afficher les fenêtres surgissantes en arrière-plan**.
  - Désactiver l'économiseur de batterie agressif pour cette application.
- **Samsung One UI / Tablettes Galaxy Tab** :
  - Aller dans *Maintenance de l'appareil > Batterie > Limites d'utilisation en arrière-plan*.
  - Ajouter l'application aux **Applications jamais en veille**.

---

## 🎯 Architecture & Optimisation Performance
- **Mémoire Empreinte Minimale** : L'overlay réutilise une seule instance de la vue via \`WindowManager.updateViewLayout()\`. Aucun re-gonflement XML répétitif lors du drag & drop.
- **Consommation CPU Zero IDLE** : Les événements tactiles exploitent un \`OnTouchListener\` natif direct sans boucle d'attente ni thread lourd.
- **Presse-papier temps réel** : Utilise le \`ClipboardManager.OnPrimaryClipChangedListener\` pour mettre à jour la valeur sans scrutation de batterie.`
  }
];
