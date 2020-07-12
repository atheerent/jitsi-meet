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

import java.net.MalformedURLException;
import java.net.URL;

/**
 * This class represents user information to be passed to {@link JitsiMeetConferenceOptions} for
 * Proxy server.
 */
public class ProxyServerInfo {
    /**
     * Type.
     */
    private String type;
    /**
     * Host.
     */
    private String host;

    /**
     * port
     */
    private String port;

    /**
     * Username.
     */
    private String username;

    /**
     * password.
     */
    private String password;

    public ProxyServerInfo() {}

    public ProxyServerInfo(Bundle b) {
        super();

        if (b.containsKey("type")) {
            type = b.getString("type");
        }

        if (b.containsKey("host")) {
            host = b.getString("host");
        }

        if (b.containsKey("port")) {
            port = b.getString("port");
        }

        if (b.containsKey("username")) {
            username = b.getString("username");
        }

        if (b.containsKey("password")) {
            password = b.getString("password");
        }

    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    Bundle asBundle() {
        Bundle b = new Bundle();

        if (type != null) {
            b.putString("type", type);
        }

        if (host != null) {
            b.putString("host", host);
        }

        if (port != null) {
            b.putString("port", port);
        }

        if (username != null) {
            b.putString("username", username);
        }

        if (password != null) {
            b.putString("password", password);
        }
        return b;
    }
}
