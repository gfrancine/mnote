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

use notify::{watcher, RecursiveMode, Watcher};
use std::sync::mpsc::channel;
use std::time::Duration;

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
