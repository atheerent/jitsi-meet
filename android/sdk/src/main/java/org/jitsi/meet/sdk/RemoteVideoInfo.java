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
public class RemoteVideoInfo {
    /**
     * Host.
     */
    private String height;

    /**
     * port
     */
    private String width;


    public RemoteVideoInfo() {}

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

    public RemoteVideoInfo(Bundle b) {
        super();
        if (b.containsKey("remoteViewHeight")) {
            height = b.getString("remoteViewHeight");
        }

        if (b.containsKey("remoteViewWidth")) {
            width = b.getString("remoteViewWidth");
        }
    }

    Bundle asBundle() {
        Bundle b = new Bundle();
        if (height != null) {
            b.putString("remoteViewHeight", height);
        }

        if (width != null) {
            b.putString("remoteViewWidth", width);
        }
        return b;
    }
}
