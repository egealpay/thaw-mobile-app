import ActivityKit
import Foundation

struct ThawActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// When the ice finishes melting if it keeps melting. The system renders the
        /// countdown from this date, so the lock screen stays live while the app is suspended.
        var endDate: Date
        /// Frozen value shown while paused.
        var remainingSeconds: Int
        var isPaused: Bool
        var subject: String
    }

    var sessionId: String
    var targetDuration: Int
}
