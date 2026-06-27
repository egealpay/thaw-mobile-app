#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivityModule, NSObject)

RCT_EXTERN_METHOD(startActivity:(NSString *)subject
                  targetSeconds:(double)targetSeconds
                  remainingSeconds:(double)remainingSeconds
                  meltProgress:(double)meltProgress)

RCT_EXTERN_METHOD(updateActivity:(double)remainingSeconds
                  meltProgress:(double)meltProgress
                  isPaused:(BOOL)isPaused)

RCT_EXTERN_METHOD(endActivity)

@end
