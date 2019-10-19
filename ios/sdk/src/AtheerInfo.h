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

#import <Foundation/Foundation.h>
#import "ProxyServerInfo.h"
#import "RemoteVideoInfo.h"

@interface AtheerInfo : NSObject

/**
 * User display name.
 */
@property (nonatomic, nullable) ProxyServerInfo *proxyServerInfo;

/**
 * User display name.
 */
@property (nonatomic, nullable) RemoteVideoInfo *remoteVideoInfo;

- (instancetype _Nullable)initWithProxyServerInfo:(ProxyServerInfo *_Nullable)proxyServerInfo
                               andRemoteVideoInfo:(RemoteVideoInfo *_Nullable)remoteVideoInfo;

@end
