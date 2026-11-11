import WidgetKit
import SwiftUI
import ActivityKit

private let iceBlue = Color(red: 0.36, green: 0.73, blue: 0.95)

private func clock(_ seconds: Int) -> String {
    let s = max(0, seconds)
    return String(format: "%d:%02d", s / 60, s % 60)
}

private extension ActivityViewContext where Attributes == ThawActivityAttributes {
    /// Virtual start so that start...endDate always spans the full session length.
    var interval: ClosedRange<Date> {
        let end = state.endDate
        return end.addingTimeInterval(-Double(max(1, attributes.targetDuration)))...end
    }
    var pausedProgress: Double {
        let total = Double(max(1, attributes.targetDuration))
        return min(1, max(0, (total - Double(state.remainingSeconds)) / total))
    }
}

// MARK: - Shared pieces

private struct TimerText: View {
    let context: ActivityViewContext<ThawActivityAttributes>
    var body: some View {
        if context.state.isPaused {
            Text(clock(context.state.remainingSeconds))
        } else {
            Text(timerInterval: context.interval, countsDown: true)
        }
    }
}

private struct MeltBar: View {
    let context: ActivityViewContext<ThawActivityAttributes>
    var body: some View {
        Group {
            if context.state.isPaused {
                ProgressView(value: context.pausedProgress)
            } else {
                ProgressView(timerInterval: context.interval, countsDown: false) {
                    EmptyView()
                } currentValueLabel: {
                    EmptyView()
                }
            }
        }
        .progressViewStyle(.linear)
        .tint(iceBlue)
    }
}

// MARK: - Lock Screen / Notification Center

struct ThawLockScreenView: View {
    let context: ActivityViewContext<ThawActivityAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "snowflake")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(iceBlue)
                Text("Thaw")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                Spacer()
                Text(context.state.isPaused ? "PAUSED" : "MELTING")
                    .font(.system(size: 11, weight: .medium))
                    .kerning(0.5)
                    .foregroundColor(.white.opacity(0.55))
            }

            TimerText(context: context)
                .font(.system(size: 52, weight: .thin))
                .monospacedDigit()
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)

            if !context.state.subject.isEmpty {
                Text(context.state.subject)
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.65))
                    .lineLimit(1)
            }

            MeltBar(context: context)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .activityBackgroundTint(Color(red: 0.055, green: 0.227, blue: 0.388))
        .activitySystemActionForegroundColor(.white)
    }
}

// MARK: - Widget entry point

@main
struct ThawLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ThawActivityAttributes.self) { context in
            ThawLockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "snowflake")
                        .foregroundColor(iceBlue)
                        .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TimerText(context: context)
                        .font(.system(size: 15, weight: .medium))
                        .monospacedDigit()
                        .foregroundColor(.white)
                        .frame(maxWidth: 64, alignment: .trailing)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 6) {
                        MeltBar(context: context)
                        Text(context.state.isPaused ? "Paused" : (context.state.subject.isEmpty ? "Melting" : context.state.subject))
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                    .padding(.horizontal, 8)
                }
            } compactLeading: {
                Image(systemName: "snowflake")
                    .foregroundColor(iceBlue)
            } compactTrailing: {
                TimerText(context: context)
                    .font(.system(size: 13, weight: .medium))
                    .monospacedDigit()
                    .foregroundColor(.white)
                    .frame(maxWidth: 46)
            } minimal: {
                Image(systemName: "snowflake")
                    .foregroundColor(iceBlue)
            }
        }
    }
}
