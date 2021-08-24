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

use std::fs;

#[tauri::command]
fn fs_rename(from: String, to: String) -> Result<(), String> {
  if let Err(err) = fs::rename(from, to) {
    return Err(err.to_string());
  }
  Ok(())
}

use notify::{watcher, RecursiveMode, Watcher, DebouncedEvent};
use std::sync::mpsc::channel;
use std::time::Duration;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WatcherPayload<'a> {
  kind: &'a str, // 
  path: Option<&'a str>,
  target_path: Option<&'a str>,
}

#[tauri::command]
async fn watcher_init(window: tauri::Window, path: String) {
  let (tx, rx) = channel();
  let mut watcher = watcher(tx, Duration::from_secs(3)).unwrap();
  watcher.watch(path, RecursiveMode::Recursive).unwrap();

  loop {
    if let Ok(ev) = rx.recv() {
      println!("Event: {:?}", ev);
      let emit = |payload: WatcherPayload| {
        window.emit("watcher_event", payload).unwrap();
      };

      match ev {
        DebouncedEvent::Write(path) => emit(WatcherPayload {
          kind: "write",
          path: path.as_path().to_str(),
          target_path: None,
        }),
        DebouncedEvent::Rename(path, target) => emit(WatcherPayload {
          kind: "rename",
          path: path.as_path().to_str(),
          target_path: target.as_path().to_str(),
        }),
        DebouncedEvent::Remove(path) => emit(WatcherPayload {
          kind: "remove",
          path: path.as_path().to_str(),
          target_path: None,
        }),
        _ => ()
      };
    }
  }
}

use tauri::{Menu, MenuItem, Submenu};

fn make_menu() -> Menu {
  // https://docs.rs/tauri/1.0.0-beta.5/tauri/enum.MenuItem.html

  let main_submenu = Submenu::new(
    "Mnote",
    Menu::new()
      .add_native_item(MenuItem::Quit),
  );

  let edit_submenu = Submenu::new(
    "Edit",
    Menu::new()
      .add_native_item(MenuItem::Undo)
      .add_native_item(MenuItem::Redo)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Cut)
      .add_native_item(MenuItem::Copy)
      .add_native_item(MenuItem::Paste)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::SelectAll),
  );

  Menu::new()
    .add_submenu(main_submenu)
    .add_submenu(edit_submenu)
}

fn main() {
  let builder = tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_args, 
      is_mac, 
      is_windows, 
      watcher_init, 
      fs_rename
    ]);

  let builder = if cfg!(target_os = "macos") {
    builder
      .menu(make_menu())
      .on_menu_event(move |event| {
        let e: &str = event.menu_item_id();
        event.window().emit("menu_event", e).unwrap();
      })
  } else {
    builder
  };

  builder
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
