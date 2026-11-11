#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivityModule, NSObject)

RCT_EXTERN_METHOD(startActivity:(NSString *)subject
                  targetSeconds:(double)targetSeconds
                  remainingSeconds:(double)remainingSeconds)

RCT_EXTERN_METHOD(updateActivity:(double)remainingSeconds
                  isPaused:(BOOL)isPaused)

RCT_EXTERN_METHOD(endActivity)

RCT_EXTERN_METHOD(consumeLastBackgroundWasLock:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
