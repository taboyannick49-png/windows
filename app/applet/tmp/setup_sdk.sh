#!/bin/bash
set -e

echo "=== Setting up Android SDK and Build Environment ==="

mkdir -p /opt/android-sdk/cmdline-tools
cd /opt/android-sdk/cmdline-tools

if [ ! -d "/opt/android-sdk/cmdline-tools/latest" ]; then
    echo "Downloading Android Command Line Tools..."
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
    unzip -q cmdline-tools.zip
    mv cmdline-tools latest
    rm cmdline-tools.zip
fi

export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

echo "Accepting Android Licenses and installing SDK packages..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools" > /dev/null 2>&1

echo "Android SDK setup complete!"
