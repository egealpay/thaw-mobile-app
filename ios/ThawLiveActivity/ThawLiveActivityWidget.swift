import WidgetKit
import SwiftUI
import ActivityKit

// MARK: - Lock Screen / Notification Center view

struct ThawLockScreenView: View {
    let context: ActivityViewContext<ThawActivityAttributes>

    private var timerString: String {
        let s = context.state.remainingSeconds
        return String(format: "%d:%02d", s / 60, s % 60)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header row
            HStack {
                Image(systemName: "snowflake")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(Color(red: 0.36, green: 0.73, blue: 0.95))
                Text("Thaw")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                Spacer()
                if context.state.isPaused {
                    Text("PAUSED")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.55))
                        .kerning(0.5)
                }
            }

            // Timer
            Text(timerString)
                .font(.system(size: 52, weight: .thin, design: .monospaced))
                .foregroundColor(.white)
                .monospacedDigit()

            // Subject
            if !context.state.subject.isEmpty {
                Text(context.state.subject)
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.65))
                    .lineLimit(1)
            }

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.white.opacity(0.15))
                        .frame(height: 4)
                    RoundedRectangle(cornerRadius: 2)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.36, green: 0.73, blue: 0.95),
                                    Color(red: 0.25, green: 0.54, blue: 0.87),
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(
                            width: max(0, geo.size.width * CGFloat(context.state.meltProgress)),
                            height: 4
                        )
                }
            }
            .frame(height: 4)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.055, green: 0.227, blue: 0.388),
                    Color(red: 0.106, green: 0.318, blue: 0.498),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

// MARK: - Dynamic Island compact views

private struct CompactLeading: View {
    var body: some View {
        Image(systemName: "snowflake")
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(Color(red: 0.36, green: 0.73, blue: 0.95))
    }
}

private struct CompactTrailing: View {
    let remainingSeconds: Int
    var body: some View {
        Text(String(format: "%d:%02d", remainingSeconds / 60, remainingSeconds % 60))
            .font(.system(size: 13, weight: .medium, design: .monospaced))
            .monospacedDigit()
            .foregroundColor(.white)
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
                    CompactLeading()
                        .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    CompactTrailing(remainingSeconds: context.state.remainingSeconds)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        ProgressView(value: context.state.meltProgress)
                            .tint(Color(red: 0.36, green: 0.73, blue: 0.95))
                        Text(context.state.isPaused ? "Paused" : "Melting")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal, 8)
                    .padding(.bottom, 4)
                }
            } compactLeading: {
                CompactLeading()
            } compactTrailing: {
                CompactTrailing(remainingSeconds: context.state.remainingSeconds)
            } minimal: {
                Image(systemName: "snowflake")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(Color(red: 0.36, green: 0.73, blue: 0.95))
            }
        }
    }
}
