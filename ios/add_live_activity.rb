#!/usr/bin/env ruby
# Run from ios/ directory: ruby add_live_activity.rb
# Requires: gem install xcodeproj (already available via CocoaPods)

require 'xcodeproj'

PROJECT_PATH      = 'ThawApp.xcodeproj'
EXTENSION_NAME    = 'ThawLiveActivity'
BUNDLE_ID         = 'com.egealpay.ThawMobileApp.ThawLiveActivity'
TEAM_ID           = 'V48Z4QU5Q4'
DEPLOYMENT_TARGET = '16.1'

project = Xcodeproj::Project.open(PROJECT_PATH)
main_target = project.targets.find { |t| t.name == 'ThawApp' }
raise "ThawApp target not found" unless main_target

# Skip if already added
if project.targets.any? { |t| t.name == EXTENSION_NAME }
  puts "⚠️  #{EXTENSION_NAME} target already exists — skipping."
  exit 0
end

# --- Create extension target ---
ext_target = project.new_target(:app_extension, EXTENSION_NAME, :ios, DEPLOYMENT_TARGET)

# --- Create Xcode group ---
ext_group = project.main_group.find_subpath(EXTENSION_NAME, true)
ext_group.set_source_tree('<group>')
ext_group.set_path(EXTENSION_NAME)

# --- Add source files ---
['ThawActivityAttributes.swift', 'ThawLiveActivityWidget.swift'].each do |name|
  ref = ext_group.new_file(name)
  ext_target.source_build_phase.add_file_reference(ref)
end

# ThawActivityAttributes.swift must also compile in the main app
attrs_ref = ext_group.find_file_by_path('ThawActivityAttributes.swift')
main_target.source_build_phase.add_file_reference(attrs_ref) if attrs_ref

# --- Add Info.plist ---
plist_ref = ext_group.new_file('Info.plist')

# --- Add WidgetKit + ActivityKit frameworks ---
frameworks_group = project.frameworks_group

wk_path  = 'System/Library/Frameworks/WidgetKit.framework'
ak_path  = 'System/Library/Frameworks/ActivityKit.framework'

wk_ref = frameworks_group.new_file(wk_path)
ak_ref = frameworks_group.new_file(ak_path)

ext_target.frameworks_build_phase.add_file_reference(wk_ref)
ext_target.frameworks_build_phase.add_file_reference(ak_ref)

# ActivityKit also needed in main app (for ActivityAuthorizationInfo etc.)
main_target.frameworks_build_phase.add_file_reference(ak_ref)

# --- Build settings ---
ext_target.build_configurations.each do |config|
  s = config.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER']    = BUNDLE_ID
  s['SWIFT_VERSION']                = '5.0'
  s['IPHONEOS_DEPLOYMENT_TARGET']   = DEPLOYMENT_TARGET
  s['DEVELOPMENT_TEAM']             = TEAM_ID
  s['INFOPLIST_FILE']               = "#{EXTENSION_NAME}/Info.plist"
  s['CODE_SIGN_STYLE']              = 'Automatic'
  s['SKIP_INSTALL']                 = 'YES'
  s['SWIFT_EMIT_LOC_STRINGS']       = 'YES'
  s['MARKETING_VERSION']            = '1.0'
  s['CURRENT_PROJECT_VERSION']      = '1'
end

# --- Embed the extension in the main app ---
embed_phase = main_target.build_phases.find do |p|
  p.is_a?(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase) &&
    p.dst_subfolder_spec == '13'
end
unless embed_phase
  embed_phase = project.new(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase)
  embed_phase.name = 'Embed App Extensions'
  embed_phase.dst_subfolder_spec = '13'
  main_target.build_phases << embed_phase
end
ext_build_file = embed_phase.add_file_reference(ext_target.product_reference)
ext_build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

# --- Add target dependency so extension builds first ---
proxy = project.new(Xcodeproj::Project::Object::PBXContainerItemProxy)
proxy.container_portal = project.root_object.uuid
proxy.proxy_type = '1'
proxy.remote_global_id_string = ext_target.uuid
proxy.remote_info = ext_target.name

dep = project.new(Xcodeproj::Project::Object::PBXTargetDependency)
dep.name = ext_target.name
dep.target = ext_target
dep.target_proxy = proxy
main_target.dependencies << dep

project.save

puts "✅  #{EXTENSION_NAME} widget extension added to #{PROJECT_PATH}"
puts ""
puts "Next steps:"
puts "  1. Open ThawApp.xcworkspace in Xcode"
puts "  2. Select the ThawLiveActivity target → Signing & Capabilities → set your team"
puts "  3. Run: cd ios && pod install"
puts "  4. Build & run on a real device (Live Activities don't work in Simulator)"
