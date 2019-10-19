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

#import "AtheerInfo+Private.h"
#import "ProxyServerInfo.h"
#import "ProxyServerInfo+Private.h"
#import "RemoteVideoInfo+Private.h"

@implementation AtheerInfo

- (instancetype)initWithProxyServerInfo:(ProxyServerInfo *)proxyServerInfo
                     andRemoteVideoInfo:(RemoteVideoInfo *)remoteVideoInfo {
    self = [super init];
    if (self) {
        self.proxyServerInfo = proxyServerInfo;
        self.remoteVideoInfo = remoteVideoInfo;
    }
    
    return self;
}

- (NSDictionary *)asDict {
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    
    if (self.proxyServerInfo != nil) {
        dict[@"proxyServerInfo"] = [self.proxyServerInfo asDict];
    }
    
    if (self.remoteVideoInfo != nil) {
        dict[@"remoteVideoInfo"] = [self.remoteVideoInfo asDict];
    }
    
    return dict;
}

@end
