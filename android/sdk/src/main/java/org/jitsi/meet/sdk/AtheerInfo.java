/*
 * Copyright @ 2019-present 8x8, Inc.
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

package org.jitsi.meet.sdk;

import android.os.Bundle;

/**
 * This class represents user information to be passed to {@link JitsiMeetConferenceOptions} for
 * Proxy server.
 */
public class AtheerInfo {


    /**
     * Proxy.
     */
    private ProxyServerInfo proxyServerInfo;

    /**
     * Remote Video
     */
    private RemoteVideoInfo remoteVideoInfo;

    /**
     * Camera Resolution
     */
    private CameraResolutionInfo cameraResolutionInfo;

    public AtheerInfo() {
        this.proxyServerInfo = null;
        this.remoteVideoInfo = null;
        this.cameraResolutionInfo = null;
    }

    public AtheerInfo(Bundle b) {
        super();

        if (b.containsKey("proxyServerInfo")) {
            this.proxyServerInfo = new ProxyServerInfo(b.getBundle("proxyServerInfo"));
        }

        if (b.containsKey("remoteVideoInfo")) {
            this.remoteVideoInfo = new RemoteVideoInfo(b.getBundle("remoteVideoInfo"));
        }

        if (b.containsKey("cameraResolutionInfo")) {
            this.cameraResolutionInfo = new CameraResolutionInfo(b.getBundle("cameraResolutionInfo"));
        }

    }

    public ProxyServerInfo getProxyServerInfo() {

        return proxyServerInfo;
    }

    public void setProxyServerInfo(ProxyServerInfo proxyServerInfo) {
        this.proxyServerInfo = proxyServerInfo;
    }

    public RemoteVideoInfo getRemoteVideoInfo() {

        return remoteVideoInfo;
    }

    public void setRemoteVideoInfo(RemoteVideoInfo remoteVideoInfo) {
        this.remoteVideoInfo = remoteVideoInfo;
    }

    public CameraResolutionInfo getCameraResolutionInfo() {

        return cameraResolutionInfo;
    }

    public void setCameraResolutionInfo(CameraResolutionInfo cameraResolutionInfo) {
        this.cameraResolutionInfo = cameraResolutionInfo;
    }

    Bundle asBundle() {
        Bundle b = new Bundle();

        if (proxyServerInfo != null) {
            b.putBundle("proxyServerInfo", proxyServerInfo.asBundle());
        }

        if (remoteVideoInfo != null) {
            b.putBundle("remoteVideoInfo", remoteVideoInfo.asBundle());
        }

        if (cameraResolutionInfo != null) {
            b.putBundle("cameraResolutionInfo", cameraResolutionInfo.asBundle());
        }
        return b;
    }
}
