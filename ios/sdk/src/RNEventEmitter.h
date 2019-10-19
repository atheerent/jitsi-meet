#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNEventEmitter : RCTEventEmitter <RCTBridgeModule>
- (void)sendNotificationToReactNativeEventOnly:(NSString *)eventName;
- (void)sendNotificationToReactNative:(NSString *)eventName withMap:(NSDictionary *)map;
@end
