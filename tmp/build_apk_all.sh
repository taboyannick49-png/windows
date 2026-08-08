#!/bin/bash
set -e

echo "=== 1. Installing Gradle and dependencies ==="
apt-get install -y gradle

echo "=== 2. Running Android SDK setup ==="
bash /tmp/setup_sdk.sh

echo "=== 3. Building Android APK with Gradle ==="
cd /tmp/FloatingSidebarApp

export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# Initialize gradle wrapper
gradle wrapper --gradle-version 8.5

# Run assembleDebug
./gradlew assembleDebug --no-daemon

echo "=== 4. Copying compiled APK ==="
mkdir -p /app/applet/.build-outputs
mkdir -p /app/applet/APK_DOWNLOAD

COMPILED_APK=$(find /tmp/FloatingSidebarApp -name "*.apk" | head -n 1)

if [ -f "$COMPILED_APK" ]; then
    cp "$COMPILED_APK" /app/applet/.build-outputs/app-debug.apk
    cp "$COMPILED_APK" /app/applet/APK_DOWNLOAD/app-debug.apk
    echo "BUILD SUCCESS! APK file size:"
    ls -lh /app/applet/APK_DOWNLOAD/app-debug.apk
else
    echo "ERROR: APK compilation did not produce an APK file."
    exit 1
fi
