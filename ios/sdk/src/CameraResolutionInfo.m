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

#import "CameraResolutionInfo+Private.h"

@implementation CameraResolutionInfo

- (instancetype)initWithWidth:(NSString *)width
                     andHeight:(NSString *)height
                     andFrameRate:(NSString *)frameRate
                     andUseOverride:(NSString *)useOverride {
    self = [super init];
    if (self) {
        self.width = width;
        self.height = height;
        self.frameRate = frameRate;
        self.useOverride = useOverride;
    }

    return self;
}

- (NSDictionary *)asDict {
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];

    if (self.width != nil) {
        dict[@"width"] = self.width;
    }

    if (self.height != nil) {
        dict[@"height"] = self.height;
    }

    if (self.frameRate != nil) {
        dict[@"frameRate"] = self.frameRate;
    }

    if (self.useOverride != nil) {
        dict[@"useOverride"] = self.useOverride;
    }

    return dict;
}

@end
