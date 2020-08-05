/*
 * Copyright @ 2018-present 8x8, Inc.
 * Copyright @ 2017-2018 Atlassian Pty Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jitsi.meet;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.KeyEvent;

import com.facebook.react.modules.network.NetworkingModule;
import com.facebook.react.modules.websocket.WebSocketModule;

import org.jitsi.meet.sdk.AtheerInfo;
import org.jitsi.meet.sdk.JitsiMeet;
import org.jitsi.meet.sdk.JitsiMeetActivity;
import org.jitsi.meet.sdk.JitsiMeetConferenceOptions;
import org.jitsi.meet.sdk.ProxyServerInfo;
import org.jitsi.meet.sdk.RemoteVideoInfo;

import java.io.IOException;
import java.lang.reflect.Method;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.Proxy;
import java.net.URL;
import java.util.Map;

import okhttp3.Authenticator;
import okhttp3.Credentials;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.Route;


/**
 * The one and only Activity that the Jitsi Meet app needs. The
 * {@code Activity} is launched in {@code singleTask} mode, so it will be
 * created upon application initialization and there will be a single instance
 * of it. Further attempts at launching the application once it was already
 * launched will result in {@link MainActivity#onNewIntent(Intent)} being called.
 */
public class MainActivity extends JitsiMeetActivity {

    /**
     * The request code identifying requests for the permission to draw on top
     * of other apps. The value must be 16-bit and is arbitrarily chosen here.
     */
    private static final int OVERLAY_PERMISSION_REQUEST_CODE
        = (int) (Math.random() * Short.MAX_VALUE);

    // JitsiMeetActivity overrides
    //

    @Override
    protected boolean extraInitialize() {
        Log.d(this.getClass().getSimpleName(), "LIBRE_BUILD="+BuildConfig.LIBRE_BUILD);

        // Setup Crashlytics and Firebase Dynamic Links
        // Here we are using reflection since it may have been disabled at compile time.
        try {
            Class<?> cls = Class.forName("org.jitsi.meet.GoogleServicesHelper");
            Method m = cls.getMethod("initialize", JitsiMeetActivity.class);
            m.invoke(null, this);
        } catch (Exception e) {
            // Ignore any error, the module is not compiled when LIBRE_BUILD is enabled.
        }

        // In Debug builds React needs permission to write over other apps in
        // order to display the warning and error overlays.
        if (BuildConfig.DEBUG) {
            if (canRequestOverlayPermission() && !Settings.canDrawOverlays(this)) {
                Intent intent
                    = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName()));

                startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);

                return true;
            }
        }

        return false;
    }

    @Override
    protected void initialize() {
        Log.d(this.getClass().getSimpleName(), "initialize");

        boolean enableProxy = true;

        RemoteVideoInfo remoteVideoInfo = new RemoteVideoInfo();
        remoteVideoInfo.setWidth("100");
        remoteVideoInfo.setHeight("80");

        AtheerInfo atheerInfo = new AtheerInfo();
        atheerInfo.setRemoteVideoInfo(remoteVideoInfo);

        if(enableProxy) {
            ProxyServerInfo proxyServerInfo = new ProxyServerInfo();
            proxyServerInfo.setType("HTTPS");
            proxyServerInfo.setHost("squid.atheerair.dev");
            proxyServerInfo.setPort("80");
            proxyServerInfo.setUsername("squid-user");
            proxyServerInfo.setPassword("P@ssword");

            atheerInfo.setProxyServerInfo(proxyServerInfo);

            Authenticator proxyAuthenticator = new Authenticator() {
                @Override public Request authenticate(Route route, Response response) throws IOException {
                    String credential = Credentials.basic("squid-user", "P@ssword");
                    return response.request().newBuilder()
                            .header("Proxy-Authorization", credential)
                            .build();
                }
            };

            NetworkingModule.setCustomClientBuilder(
                    new NetworkingModule.CustomClientBuilder() {

                        @Override
                        public void apply(OkHttpClient.Builder builder) {
                            Log.d(this.getClass().getSimpleName(), "Calling NetworkingModule Custom Client Builder");
                            builder.proxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("squid.atheerair.dev", 80)));
                            builder.proxyAuthenticator(proxyAuthenticator);
                        }
                    });

            WebSocketModule.setCustomClientBuilder(
                    new WebSocketModule.CustomClientBuilder() {
                        @Override
                        public void apply(OkHttpClient.Builder builder) {
                            Log.d(this.getClass().getSimpleName(), "Calling WebSocketModule Custom Client Builder");
                            builder.proxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("squid.atheerair.dev", 80)));
                            builder.proxyAuthenticator(proxyAuthenticator);
                        }
                    });
        }

        JitsiMeetConferenceOptions defaultOptions = new JitsiMeetConferenceOptions.Builder()
            .setRoom("https://meet.airsuite-live.atheerair.com/airps1" + "#" + getJitsiConfig())
            .setAtheerInfo(atheerInfo)
            .setWelcomePageEnabled(false)
            .setFeatureFlag("pip.enabled", false)
            .setFeatureFlag("calendar.enabled", false)
            .setFeatureFlag("chat.enabled", false)
            .build();

        JitsiMeet.setDefaultConferenceOptions(defaultOptions);

        super.initialize();
    }

    @Override
    public void onConferenceTerminated(Map<String, Object> data) {
        Log.d(TAG, "Conference terminated: " + data);
    }

    // Activity lifecycle method overrides
    //

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == OVERLAY_PERMISSION_REQUEST_CODE
                && canRequestOverlayPermission()) {
            if (Settings.canDrawOverlays(this)) {
                initialize();
                return;
            }

            throw new RuntimeException("Overlay permission is required when running in Debug mode.");
        }

        super.onActivityResult(requestCode, resultCode, data);
    }

    // ReactAndroid/src/main/java/com/facebook/react/ReactActivity.java
    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (BuildConfig.DEBUG && keyCode == KeyEvent.KEYCODE_MENU) {
            JitsiMeet.showDevOptions();
            return true;
        }

        return super.onKeyUp(keyCode, event);
    }

    // Helper methods
    //

    private @Nullable URL buildURL(String urlStr) {
        try {
            return new URL(urlStr);
        } catch (MalformedURLException e) {
            return null;
        }
    }

    private boolean canRequestOverlayPermission() {
        return
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                && getApplicationInfo().targetSdkVersion >= Build.VERSION_CODES.M;
    }

    public String getJitsiConfig() {
        StringBuffer config = new StringBuffer();

        boolean disableSimulCast = false;
        int cameraResolutionCode  = getCemaraResolutionCode();

        int resolutionWidth = getCemaraResolutionWidth(cameraResolutionCode);
        int resolutionHeight = getCemaraResolutionHeight(cameraResolutionCode);
        int frameRate = getFrameRate();

        if(disableSimulCast) {
            config.append("config.disableSimulcast=" + disableSimulCast + "&");
        }

        config.append("config.resolution=" + getCemaraResolution(cameraResolutionCode) + "&");

        config.append("config.constraints.video.width.ideal=" + resolutionWidth + "&");
        config.append("config.constraints.video.width.max=" + resolutionWidth + "&");
        config.append("config.constraints.video.width.min=" + resolutionWidth + "&");

        config.append("config.constraints.video.height.ideal=" + resolutionHeight + "&");
        config.append("config.constraints.video.height.max=" + resolutionHeight + "&");
        config.append("config.constraints.video.height.min=" + resolutionHeight + "&");

        config.append("config.constraints.video.fps=" + frameRate);

        Log.d(TAG, "Jitsi Config URL:" + config.toString());

        return config.toString();
    }

    private int getCemaraResolutionCode() {
        String cameraResolution = "4";
        if(cameraResolution != null && cameraResolution.length() > 0) {
            return Integer.parseInt(cameraResolution);
        } else {
            return 4;
        }
    }

    private int getCemaraResolution(int cameraResolutionCode) {
        switch(cameraResolutionCode) {
            case 0:
                return 180;
            case 1:
                return 320;
            case 2:
                return 360;
            case 3:
                return 640;
            case 4:
                return 720;
            default:
                return 720;
        }
    }

    private int getCemaraResolutionWidth(int cameraResolutionCode) {
        switch(cameraResolutionCode) {
            case 0:
                return 320;
            case 1:
                return 320;
            case 2:
                return 640;
            case 3:
                return 640;
            case 4:
                return 1280;
            default:
                return 1280;
        }
    }

    private int getCemaraResolutionHeight(int cameraResolutionCode) {
        switch(cameraResolutionCode) {
            case 0:
                return 180;
            case 1:
                return 240;
            case 2:
                return 360;
            case 3:
                return 480;
            case 4:
                return 720;
            default:
                return 720;
        }
    }

    private int getFrameRate() {
        String frameRateStr = "30";
        if(frameRateStr != null && frameRateStr.length() > 0) {
            int frameRate = Integer.parseInt(frameRateStr);
            switch(frameRate) {
                case 0:
                    return 10;
                case 1:
                    return 15;
                case 2:
                    return 24;
                case 3:
                    return 30;
                default:
                    return 30;
            }
        } else {
            return 30;
        }
    }
}
