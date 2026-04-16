#![allow(unexpected_cfgs)]

use std::path::{Path, PathBuf};
use std::process::Command;

#[cfg(target_os = "macos")]
use cocoa::{
    appkit::{NSApp, NSWindowCollectionBehavior},
    base::{id, nil},
    foundation::NSUInteger,
};
#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};
use tao::{
    event_loop::EventLoopWindowTarget,
    monitor::MonitorHandle,
    window::{Window, WindowBuilder},
};

#[cfg(target_os = "macos")]
use tao::platform::macos::{ActivationPolicy, EventLoopExtMacOS, WindowBuilderExtMacOS, WindowExtMacOS};

use crate::platform::{AppPaths, PlatformResult, UiPlatformInfo};

const KCG_DESKTOP_WINDOW_LEVEL_KEY: i32 = 2;

#[cfg(target_os = "macos")]
#[link(name = "CoreGraphics", kind = "framework")]
unsafe extern "C" {
    fn CGWindowLevelForKey(key: i32) -> i32;
}

pub struct PlatformPaths {
    pub work_dir: PathBuf,
    pub bg_dir: PathBuf,
    pub cache_dir: PathBuf,
}

pub fn get_platform_paths() -> PlatformPaths {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    let work_dir = PathBuf::from(home).join("Library").join("Application Support").join("AIWallpaper");
    let bg_dir = work_dir.join("bg");
    let cache_dir = work_dir.join("cache");
    
    if !bg_dir.exists() { let _ = std::fs::create_dir_all(&bg_dir); }
    if !cache_dir.exists() { let _ = std::fs::create_dir_all(&cache_dir); }
    
    PlatformPaths { work_dir, bg_dir, cache_dir }
}

pub fn current_system_wallpaper_url() -> String {
    String::new()
}

pub fn configure_process(_paths: &AppPaths) -> PlatformResult<()> {
    Ok(())
}

pub fn configure_event_loop<T>(event_loop: &EventLoopWindowTarget<T>) {
    #[cfg(target_os = "macos")]
    {
        event_loop.set_activation_policy(ActivationPolicy::Accessory);
        event_loop.enable_default_menu_creation(false);
        event_loop.set_activate_ignoring_other_apps(true);
    }
}

pub fn configure_background_window_builder<T>(
    mut builder: WindowBuilder,
    _target: &EventLoopWindowTarget<T>,
) -> WindowBuilder {
    let primary_monitor = _target.primary_monitor();
    if let Some(monitor) = primary_monitor {
        builder = builder
            .with_position(monitor.position())
            .with_inner_size(monitor.size());
    }

    builder = builder
        .with_decorations(false)
        .with_resizable(false)
        .with_transparent(true);

    #[cfg(target_os = "macos")]
    {
        builder = builder
            .with_visible_on_all_workspaces(true)
            .with_has_shadow(false);
    }

    builder
}

pub fn attach_background_window(window: &Window) -> PlatformResult<()> {
    #[cfg(target_os = "macos")]
    {
        window.set_visible_on_all_workspaces(true);
        window.set_ignore_cursor_events(true)?;

        unsafe {
            let ns_window = window.ns_window() as id;
            let desktop_level = CGWindowLevelForKey(KCG_DESKTOP_WINDOW_LEVEL_KEY);
            let _: () = msg_send![ns_window, setLevel: desktop_level];

            let collection_behavior: NSUInteger = msg_send![ns_window, collectionBehavior];
            let stationary_behavior =
                (NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                    | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
                    | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary)
                    .bits();
            let _: () = msg_send![
                ns_window,
                setCollectionBehavior: collection_behavior | stationary_behavior
            ];
        }

        window.set_visible(true);

        unsafe {
            let ns_window = window.ns_window() as id;
            let _: () = msg_send![ns_window, orderBack: nil];
        }
    }

    Ok(())
}

pub fn get_ui_platform_info<T>(_event_loop: &EventLoopWindowTarget<T>) -> UiPlatformInfo {
    UiPlatformInfo {
        device_pixel_ratio: 2.0,
    }
}