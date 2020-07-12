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
public class CameraResolutionInfo {
    /**
     * height.
     */
    private String height;

    /**
     * width
     */
    private String width;

    /**
     * frame rate.
     */
    private String frameRate;

    /**
     * user Override
     */
    private String useOverRide;


    public CameraResolutionInfo() {}

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getWidth() {
        return width;
    }

    public void setWidth(String width) {
        this.width = width;
    }

    public String getFrameRate() {
        return frameRate;
    }

    public void setFrameRate(String frameRate) {
        this.frameRate = frameRate;
    }

    public String getUseOverRide() {
        return frameRate;
    }

    public void setUseOverRide(String useOverRide) {
        this.useOverRide = useOverRide;
    }

    public CameraResolutionInfo(Bundle b) {
        super();
        if (b.containsKey("height")) {
            height = b.getString("height");
        }

        if (b.containsKey("width")) {
            width = b.getString("width");
        }

        if (b.containsKey("frameRate")) {
            width = b.getString("frameRate");
        }

        if (b.containsKey("useOverRide")) {
            width = b.getString("useOverRide");
        }
    }

    Bundle asBundle() {
        Bundle b = new Bundle();
        if (height != null) {
            b.putString("height", height);
        }

        if (width != null) {
            b.putString("width", width);
        }

        if (frameRate != null) {
            b.putString("frameRate", frameRate);
        }

        if (useOverRide != null) {
            b.putString("useOverRide", useOverRide);
        }
        return b;
    }
}
