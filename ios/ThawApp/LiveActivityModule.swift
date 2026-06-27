import Foundation
import ActivityKit

@objc(LiveActivityModule)
class LiveActivityModule: NSObject {

    // Stored as Any? so the class compiles on iOS < 16.1 without @available on the class
    private var currentActivity: Any?
    private var currentSubject: String = ""

    @objc static func requiresMainQueueSetup() -> Bool { false }

    // MARK: - Start

    @objc func startActivity(
        _ subject: String,
        targetSeconds: Double,
        remainingSeconds: Double,
        meltProgress: Double
    ) {
        guard #available(iOS 16.1, *),
              ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        // End any existing activity
        if #available(iOS 16.1, *),
           let existing = currentActivity as? Activity<ThawActivityAttributes> {
            Task { await existing.end(dismissalPolicy: .immediate) }
        }
        currentActivity = nil
        currentSubject = subject

        let attrs = ThawActivityAttributes(
            sessionId: UUID().uuidString,
            targetDuration: Int(targetSeconds)
        )
        let state = ThawActivityAttributes.ContentState(
            remainingSeconds: Int(remainingSeconds),
            meltProgress: meltProgress,
            isPaused: false,
            subject: subject
        )

        do {
            let activity = try Activity<ThawActivityAttributes>.request(
                attributes: attrs,
                contentState: state,
                pushType: nil
            )
            currentActivity = activity
        } catch {
            // Live Activities unavailable on this device/OS — non-fatal
        }
    }

    // MARK: - Update

    @objc func updateActivity(
        _ remainingSeconds: Double,
        meltProgress: Double,
        isPaused: Bool
    ) {
        guard #available(iOS 16.1, *),
              let activity = currentActivity as? Activity<ThawActivityAttributes> else { return }

        let state = ThawActivityAttributes.ContentState(
            remainingSeconds: Int(remainingSeconds),
            meltProgress: meltProgress,
            isPaused: isPaused,
            subject: currentSubject
        )
        Task { await activity.update(using: state) }
    }

    // MARK: - End

    @objc func endActivity() {
        guard #available(iOS 16.1, *),
              let activity = currentActivity as? Activity<ThawActivityAttributes> else {
            currentActivity = nil
            return
        }
        currentActivity = nil
        Task { await activity.end(dismissalPolicy: .immediate) }
    }
}
