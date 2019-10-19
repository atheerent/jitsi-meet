#import "RNEventEmitter.h"
@implementation RNEventEmitter

RCT_EXPORT_MODULE();

+ (id)allocWithZone:(NSZone *)zone {
    static RNEventEmitter *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [super allocWithZone:zone];
    });
    return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"setParticipantName", @"hangUp", @"toggleCamera", @"toggleAudio", @"initCameraFacingMode", @"hideRemoteView", @"showRemoteView"];
}

- (void)sendNotificationToReactNativeEventOnly:(NSString *)eventName
{
    printf("%s", [eventName UTF8String]);
    [self sendEventWithName:eventName body:nil];
}

- (void)sendNotificationToReactNative:(NSString *)eventName
                              withMap:(NSDictionary *)map
{
    printf("map %s", [eventName UTF8String]);
    [self sendEventWithName:eventName body:map];
}

@end
