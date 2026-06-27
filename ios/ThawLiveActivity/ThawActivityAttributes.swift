import ActivityKit

struct ThawActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var remainingSeconds: Int
        var meltProgress: Double  // 0.0 – 1.0
        var isPaused: Bool
        var subject: String
    }

    var sessionId: String
    var targetDuration: Int
}
