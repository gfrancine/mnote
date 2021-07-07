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

/* wait for channel support to send events from the global stream

use notify::{Watcher, RecursiveMode, watcher};
use std::sync::mpsc::channel;
use std::time::Duration;
use std::thread;

let (tx, rx) = channel();
let mut watcher = watcher(tx, Duration::from_secs(10)).unwrap();
watcher.watch(path, RecursiveMode::Recursive).unwrap();

loop {
  match rx.recv() {
    Ok(event) => println!("{:?}", event),
    // Err(e) => println!("watch error: {:?}", e),
    _ => (),
  }
} */

use walkdir::{WalkDir};
use std::collections::HashMap;
use serde::{Serialize};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ChangedResult {
  did_change: bool,
  new_files: HashMap<String, bool>,
}

// for now this is the solution bego

#[tauri::command]
fn dir_did_change(path: String, files: HashMap<String, bool>) -> ChangedResult {
  let mut new_files: HashMap<String, bool> = HashMap::new();
  let mut changed = false;

  for maybe_entry in WalkDir::new(path) {
    if let Ok(entry) = maybe_entry {
      if let Some(entry_path) = entry.path().to_str() {
        new_files.insert(String::from(entry_path), true);
        if !files.contains_key(entry_path) {
          changed = true;
        }
      }
    }
  }

  if changed {
    return ChangedResult {
      did_change: changed,
      new_files,
    };
  }

  for (entry, _) in files.iter() {
    if !new_files.contains_key(entry) {
      changed = true;
      return ChangedResult {
        did_change: changed,
        new_files,
      };
    }
  }

  ChangedResult {
    did_change: changed,
    new_files,
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_args,
      is_mac,
      dir_did_change,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
