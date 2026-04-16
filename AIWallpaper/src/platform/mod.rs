#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::*;

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
pub use macos::*;

use std::path::{Path, PathBuf};

pub type PlatformResult<T = ()> = Result<T, Box<dyn std::error::Error>>;

pub struct AppPaths {
    pub app_data_dir: PathBuf,
    pub cache_dir: PathBuf,
}

pub struct UiPlatformInfo {
    pub device_pixel_ratio: f64,
}

pub fn get_app_paths() -> AppPaths {
    let platform_paths = self::get_platform_paths();
    AppPaths {
        app_data_dir: platform_paths.work_dir,
        cache_dir: platform_paths.cache_dir,
    }
}

pub fn app_paths() -> AppPaths {
    get_app_paths()
}

pub fn initial_wallpaper_url(_path: &Path) -> Option<String> {
    Some(self::current_system_wallpaper_url())
}