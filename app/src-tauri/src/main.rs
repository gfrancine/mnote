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
  if cfg!(target_os = "macos") {
    return true;
  }
  false
}

use notify::{watcher, RecursiveMode, Watcher};
use std::sync::mpsc::channel;
use std::time::Duration;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_args, is_mac,])
    .on_page_load(|win, _| {
      let win_ = win.clone();

      win.once("watcher_init", move |event| {
        let win__ = win_.clone();

        let path: String = match event.payload() {
          Some(p) => p.into(),
          _ => return,
        };

        let (tx, rx) = channel();
        let mut watcher = watcher(tx, Duration::from_secs(10)).unwrap();
        watcher.watch(path, RecursiveMode::Recursive).unwrap();

        loop {
          if let Ok(ev) = rx.recv() {
            println!("Event: {:?}", ev);
            win__.emit("watcher_event", "").unwrap();
          }
        }
      });
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
