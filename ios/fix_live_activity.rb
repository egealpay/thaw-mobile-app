#!/usr/bin/env ruby
require 'xcodeproj'

project = Xcodeproj::Project.open('ThawApp.xcodeproj')
main_target  = project.targets.find { |t| t.name == 'ThawApp' }
ext_target   = project.targets.find { |t| t.name == 'ThawLiveActivity' }
raise "Targets not found" unless main_target && ext_target

# ── 1. Fix widget extension product name / bundle IDs ─────────────────────────
product_ref = ext_target.product_reference
product_ref.path = 'ThawLiveActivity.appex' if product_ref.path == '.appex'

ext_target.build_configurations.each do |config|
  s = config.build_settings
  s['PRODUCT_NAME'] = 'ThawLiveActivity'
  s['PRODUCT_BUNDLE_IDENTIFIER'] = 'org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)'
  s['PRODUCT_BUNDLE_IDENTIFIER[sdk=iphoneos*]'] = 'com.egealpay.ThawMobileApp.ThawLiveActivity'
end
puts "✅ Widget extension product name & bundle IDs fixed"

# ── 2. Add LiveActivityModule.swift + .m to the main app target ───────────────
main_group = project.main_group.find_subpath('ThawApp', false)
raise "ThawApp group not found" unless main_group

added = 0
['LiveActivityModule.swift', 'LiveActivityModule.m'].each do |filename|
  # Skip if already in the group
  if main_group.find_file_by_path(filename)
    puts "ℹ️  #{filename} already in project — skipping"
    next
  end

  file_ref = main_group.new_file(filename)
  main_target.source_build_phase.add_file_reference(file_ref)
  puts "✅ Added #{filename} to ThawApp target"
  added += 1
end

project.save
puts "\nDone — #{added} file(s) added. Clean build folder in Xcode (Cmd+Shift+K) and rebuild."
