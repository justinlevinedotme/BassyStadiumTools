use futures_util::StreamExt;
use reqwest::Client;
use serde::Serialize;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tauri::{AppHandle, Emitter};
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;

/// Default R2 URL for the BepInEx pack
/// Update this once your R2 bucket is configured
pub const BEPINEX_R2_URL: &str = "https://pub-PLACEHOLDER.r2.dev/bepinex_pack.zip";

/// Progress information emitted during download
#[derive(Clone, Serialize)]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: u64,
    pub speed_bps: f64,
    pub percent: f64,
}

/// Global cancellation flag for downloads
static CANCEL_FLAG: AtomicBool = AtomicBool::new(false);

/// State for tracking download progress
struct DownloadState {
    downloaded: u64,
    start_time: Instant,
    last_emit_time: Instant,
}

/// Downloads a file from a URL with progress reporting
async fn download_file_with_progress(
    app: &AppHandle,
    url: &str,
    dest_path: &PathBuf,
) -> Result<(), String> {
    // Reset cancellation flag
    CANCEL_FLAG.store(false, Ordering::SeqCst);

    let client = Client::new();

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Failed to connect: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }

    let total_size = response.content_length().unwrap_or(0);

    // Create parent directories if needed
    if let Some(parent) = dest_path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let mut file = File::create(dest_path)
        .await
        .map_err(|e| format!("Failed to create file: {}", e))?;

    let state = Arc::new(Mutex::new(DownloadState {
        downloaded: 0,
        start_time: Instant::now(),
        last_emit_time: Instant::now(),
    }));

    let mut stream = response.bytes_stream();

    while let Some(chunk_result) = stream.next().await {
        // Check for cancellation
        if CANCEL_FLAG.load(Ordering::SeqCst) {
            // Clean up partial file
            drop(file);
            let _ = tokio::fs::remove_file(dest_path).await;
            return Err("Download cancelled".to_string());
        }

        let chunk = chunk_result.map_err(|e| format!("Download error: {}", e))?;

        file.write_all(&chunk)
            .await
            .map_err(|e| format!("Failed to write: {}", e))?;

        // Update progress
        let mut state_guard = state.lock().await;
        state_guard.downloaded += chunk.len() as u64;

        // Emit progress every 100ms to avoid flooding
        let now = Instant::now();
        if now.duration_since(state_guard.last_emit_time).as_millis() >= 100 {
            let elapsed = now.duration_since(state_guard.start_time).as_secs_f64();
            let speed = if elapsed > 0.0 {
                state_guard.downloaded as f64 / elapsed
            } else {
                0.0
            };

            let percent = if total_size > 0 {
                (state_guard.downloaded as f64 / total_size as f64) * 100.0
            } else {
                0.0
            };

            let progress = DownloadProgress {
                downloaded: state_guard.downloaded,
                total: total_size,
                speed_bps: speed,
                percent,
            };

            let _ = app.emit("download-progress", progress);
            state_guard.last_emit_time = now;
        }
    }

    file.flush().await.map_err(|e| format!("Failed to flush: {}", e))?;

    // Emit final progress
    let state_guard = state.lock().await;
    let elapsed = Instant::now().duration_since(state_guard.start_time).as_secs_f64();
    let speed = if elapsed > 0.0 {
        state_guard.downloaded as f64 / elapsed
    } else {
        0.0
    };

    let _ = app.emit("download-progress", DownloadProgress {
        downloaded: state_guard.downloaded,
        total: total_size,
        speed_bps: speed,
        percent: 100.0,
    });

    Ok(())
}

/// Validates that a file is a valid zip archive
fn validate_zip_file(path: &PathBuf) -> Result<(), String> {
    let file = std::fs::File::open(path)
        .map_err(|e| format!("Failed to open file for validation: {}", e))?;

    let archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("Invalid zip file: {}", e))?;

    // Check that it has some content
    if archive.len() == 0 {
        return Err("Zip file is empty".to_string());
    }

    Ok(())
}

/// Downloads BepInEx pack from the default R2 URL
#[tauri::command]
pub async fn download_bepinex_from_r2(app: AppHandle) -> Result<String, String> {
    let temp_dir = std::env::temp_dir();
    let dest_path = temp_dir.join("bepinex_pack_download.zip");

    download_file_with_progress(&app, BEPINEX_R2_URL, &dest_path).await?;

    // Validate the downloaded file
    validate_zip_file(&dest_path)?;

    Ok(dest_path.to_string_lossy().to_string())
}

/// Downloads BepInEx pack from a custom URL
#[tauri::command]
pub async fn download_bepinex_from_url(app: AppHandle, url: String) -> Result<String, String> {
    // Basic URL validation
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("Invalid URL: must start with http:// or https://".to_string());
    }

    let temp_dir = std::env::temp_dir();
    let dest_path = temp_dir.join("bepinex_pack_download.zip");

    download_file_with_progress(&app, &url, &dest_path).await?;

    // Validate the downloaded file
    validate_zip_file(&dest_path)?;

    Ok(dest_path.to_string_lossy().to_string())
}

/// Cancels an in-progress download
#[tauri::command]
pub fn cancel_download() -> Result<(), String> {
    CANCEL_FLAG.store(true, Ordering::SeqCst);
    Ok(())
}
