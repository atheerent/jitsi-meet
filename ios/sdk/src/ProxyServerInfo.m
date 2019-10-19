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

#import "ProxyServerInfo+Private.h"

@implementation ProxyServerInfo

- (instancetype)initWithType:(NSString *)type
                     andHost:(NSString *)host
                     andPort:(NSString *)port
                 andUsername:(NSString *)username
                 andPassword:(NSString *)password {
    self = [super init];
    if (self) {
        self.type = type;
        self.host = host;
        self.port = port;
        self.username = username;
        self.password = password;
    }
    
    return self;
}

- (NSDictionary *)asDict {
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    
    if (self.type != nil) {
        dict[@"type"] = self.type;
    }
    
    if (self.host != nil) {
        dict[@"host"] = self.host;
    }
    
    if (self.port != nil) {
        dict[@"port"] = self.port;
    }
    
    if (self.username != nil) {
        dict[@"username"] = self.username;
    }
    
    if (self.password != nil) {
        dict[@"password"] = self.password;
    }
    
    return dict;
}

@end
