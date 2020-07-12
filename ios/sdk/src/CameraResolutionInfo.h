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

@interface CameraResolutionInfo : NSObject

/**
 * User display name.
 */
@property (nonatomic, copy, nullable) NSString *width;
/**
 * User e-mail.
 */
@property (nonatomic, copy, nullable) NSString *height;

/**
 * User display name.
 */
@property (nonatomic, copy, nullable) NSString *frameRate;
/**
 * User e-mail.
 */
@property (nonatomic, copy, nullable) NSString *useOverride;

/**
 * User display name.
 */
@property (nonatomic, copy, nullable) NSString *password;

- (instancetype _Nullable)initWithWidth:(NSString *_Nullable)width
                               andHeight:(NSString *_Nullable)height
                               andFrameRate:(NSString *_Nullable)frameRate
                               andUseOverride:(NSString *_Nullable)useOverride;
@end
