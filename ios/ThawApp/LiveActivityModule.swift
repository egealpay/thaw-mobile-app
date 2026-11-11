import Foundation
import UIKit
import ActivityKit
import React

/// Bridges the session timer to an iOS Live Activity and tells JS whether the last
/// trip to the background was a screen lock (not a distraction) or an app switch.
///
/// All state is touched on the main queue only.
@objc(LiveActivityModule)
class LiveActivityModule: NSObject {

    // Stored as Any? so the class compiles for iOS < 16.1 without @available on the class.
    private var currentActivity: Any?
    private var subject = ""
    private var endDate = Date()
    private var remainingSeconds = 0
    private var isPaused = false

    private var lastBackgroundWasLock = false

    @objc static func requiresMainQueueSetup() -> Bool { true }

    override init() {
        super.init()
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(appDidEnterBackground),
                       name: UIApplication.didEnterBackgroundNotification, object: nil)
        nc.addObserver(self, selector: #selector(protectedDataWillBecomeUnavailable),
                       name: UIApplication.protectedDataWillBecomeUnavailableNotification, object: nil)
        // A previous run may have been killed mid-session; its activity is stale now.
        if #available(iOS 16.1, *) {
            for activity in Activity<ThawActivityAttributes>.activities {
                Task { await activity.end(dismissalPolicy: .immediate) }
            }
        }
    }

    deinit { NotificationCenter.default.removeObserver(self) }

    // MARK: - JS API

    @objc func startActivity(_ subject: String, targetSeconds: Double, remainingSeconds: Double) {
        DispatchQueue.main.async {
            guard #available(iOS 16.1, *), ActivityAuthorizationInfo().areActivitiesEnabled else { return }

            for activity in Activity<ThawActivityAttributes>.activities {
                Task { await activity.end(dismissalPolicy: .immediate) }
            }
            self.currentActivity = nil
            self.subject = subject
            self.setTimer(remaining: remainingSeconds, paused: false)

            let attrs = ThawActivityAttributes(sessionId: UUID().uuidString, targetDuration: Int(targetSeconds))
            let state = self.contentState(paused: false)
            do {
                if #available(iOS 16.2, *) {
                    self.currentActivity = try Activity<ThawActivityAttributes>.request(
                        attributes: attrs, content: ActivityContent(state: state, staleDate: nil), pushType: nil)
                } else {
                    self.currentActivity = try Activity<ThawActivityAttributes>.request(
                        attributes: attrs, contentState: state, pushType: nil)
                }
            } catch {
                // Live Activities unavailable on this device/OS — non-fatal.
            }
        }
    }

    @objc func updateActivity(_ remainingSeconds: Double, isPaused: Bool) {
        DispatchQueue.main.async {
            self.setTimer(remaining: remainingSeconds, paused: isPaused)
            self.push(paused: isPaused, remaining: self.remainingSeconds)
        }
    }

    @objc func endActivity() {
        DispatchQueue.main.async {
            guard #available(iOS 16.1, *),
                  let activity = self.currentActivity as? Activity<ThawActivityAttributes> else {
                self.currentActivity = nil
                return
            }
            self.currentActivity = nil
            Task { await activity.end(dismissalPolicy: .immediate) }
        }
    }

    /// Resolves true if the app's last trip to the background was a screen lock. Resets the flag.
    @objc func consumeLastBackgroundWasLock(_ resolve: @escaping RCTPromiseResolveBlock,
                                           rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let locked = self.lastBackgroundWasLock
            self.lastBackgroundWasLock = false
            resolve(locked)
        }
    }

    // MARK: - Lock vs. app-switch detection

    @objc private func appDidEnterBackground() {
        // When the side button (or auto-lock) turns the screen off, brightness reads 0 here.
        lastBackgroundWasLock = UIScreen.main.brightness <= 0
        if !lastBackgroundWasLock && !isPaused {
            // Left for another app: the ice stops melting, so freeze the lock-screen timer.
            push(paused: true, remaining: secondsLeft())
        }
    }

    @objc private func protectedDataWillBecomeUnavailable() {
        // Second lock signal (devices with a passcode). If it arrives while we're in the
        // background, the screen was locked: undo the paused display from appDidEnterBackground.
        guard UIApplication.shared.applicationState == .background, !lastBackgroundWasLock else { return }
        lastBackgroundWasLock = true
        if !isPaused { push(paused: false, remaining: secondsLeft()) }
    }

    // MARK: - Helpers

    private func setTimer(remaining: Double, paused: Bool) {
        remainingSeconds = max(0, Int(remaining.rounded()))
        isPaused = paused
        endDate = Date().addingTimeInterval(Double(remainingSeconds))
    }

    private func secondsLeft() -> Int {
        isPaused ? remainingSeconds : max(0, Int(endDate.timeIntervalSinceNow.rounded()))
    }

    private func contentState(paused: Bool, remaining: Int? = nil) -> ThawActivityAttributes.ContentState {
        ThawActivityAttributes.ContentState(
            endDate: endDate,
            remainingSeconds: remaining ?? remainingSeconds,
            isPaused: paused,
            subject: subject
        )
    }

    /// Sends a state to the activity, keeping the app alive long enough to deliver it
    /// even if we're on our way to the background.
    private func push(paused: Bool, remaining: Int) {
        guard #available(iOS 16.1, *),
              let activity = currentActivity as? Activity<ThawActivityAttributes> else { return }
        let state = contentState(paused: paused, remaining: remaining)
        let task = UIApplication.shared.beginBackgroundTask(withName: "ThawLiveActivityUpdate")
        Task {
            if #available(iOS 16.2, *) {
                await activity.update(ActivityContent(state: state, staleDate: nil))
            } else {
                await activity.update(using: state)
            }
            DispatchQueue.main.async { UIApplication.shared.endBackgroundTask(task) }
        }
    }
}
