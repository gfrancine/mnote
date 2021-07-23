#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[tauri::command]
fn get_args() -> Vec<String> {
  std::env::args().collect()
}

#[tauri::command]
fn is_mac() -> bool {
  cfg!(target_os = "macos")
}

#[tauri::command]
fn is_windows() -> bool {
  cfg!(windows)
}

#[tauri::command]
async fn watcher_init(window: tauri::Window, path: String) {
  let (tx, rx) = channel();
  let mut watcher = watcher(tx, Duration::from_secs(10)).unwrap();
  watcher.watch(path, RecursiveMode::Recursive).unwrap();

  loop {
    if let Ok(ev) = rx.recv() {
      println!("Event: {:?}", ev);
      window.emit("watcher_event", "").unwrap();
    }
  }
}

use notify::{watcher, RecursiveMode, Watcher};
use std::sync::mpsc::channel;
use std::time::Duration;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_args, is_mac, is_windows, watcher_init])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
