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

use std::{
  fs::{self},
  path::PathBuf,
};

#[tauri::command]
fn fs_rename(from: String, to: String) -> Result<(), String> {
  if let Err(err) = fs::rename(from, to) {
    return Err(err.to_string());
  }
  Ok(())
}

use rfd::FileDialog;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct DialogFilter {
  name: String,
  extensions: Vec<String>,
}

fn dialog_from_opts(
  filters: Option<Vec<DialogFilter>>,
  starting_directory: Option<String>,
  starting_file_name: Option<String>,
) -> FileDialog {
  let mut dialog = FileDialog::new();

  if let Some(filters) = filters {
    for filter in filters.iter() {
      let extensions: Vec<&str> = filter
        .extensions
        .iter()
        .map(|string| string.as_str())
        .collect();
      dialog = dialog.add_filter(&filter.name, &extensions[..]);
    }
  }
  if let Some(file_name) = starting_file_name {
    dialog = dialog.set_file_name(&file_name);
  }
  if let Some(directory) = starting_directory {
    dialog = dialog.set_directory(directory);
  }

  dialog
}

fn process_dialog_result(result: Option<PathBuf>) -> Option<String> {
  match result {
    Some(pathbuf) => {
      if let Ok(path) = pathbuf.into_os_string().into_string() {
        return Some(path);
      }
      None
    }
    None => None,
  }
}

#[tauri::command]
fn fs_open_dialog(
  filters: Option<Vec<DialogFilter>>,
  is_directory: bool,
  starting_directory: Option<String>,
  starting_file_name: Option<String>,
) -> Option<String> {
  let dialog =
    dialog_from_opts(filters, starting_directory, starting_file_name);

  let result = if is_directory {
    dialog.pick_folder()
  } else {
    dialog.pick_file()
  };

  process_dialog_result(result)
}

#[tauri::command]
fn fs_save_dialog(
  filters: Option<Vec<DialogFilter>>,
  starting_directory: Option<String>,
  starting_file_name: Option<String>,
) -> Option<String> {
  process_dialog_result(
    dialog_from_opts(filters, starting_directory, starting_file_name)
      .save_file(),
  )
}

use hotwatch::{Event, Hotwatch};
use std::sync::Mutex;
use std::time::Duration;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct WatcherPayload<'a> {
  kind: &'a str, //
  path: Option<&'a str>,
  target_path: Option<&'a str>,
}

struct Watcher(Mutex<Hotwatch>);

#[tauri::command]
fn watch(
  path: String,
  window: tauri::Window,
  watcher: tauri::State<'_, Watcher>,
) {
  watcher
    .0
    .lock()
    .unwrap()
    .watch(path, move |ev| {
      println!("Event: {:?}", ev);
      let emit = |payload: WatcherPayload| {
        window.emit("watcher_event", payload).unwrap();
      };

      match ev {
        Event::Create(path) => emit(WatcherPayload {
          kind: "create",
          path: path.as_path().to_str(),
          target_path: None,
        }),
        Event::Write(path) => emit(WatcherPayload {
          kind: "write",
          path: path.as_path().to_str(),
          target_path: None,
        }),
        Event::Rename(path, target) => emit(WatcherPayload {
          kind: "rename",
          path: path.as_path().to_str(),
          target_path: target.as_path().to_str(),
        }),
        Event::Remove(path) => emit(WatcherPayload {
          kind: "remove",
          path: path.as_path().to_str(),
          target_path: None,
        }),
        _ => (),
      };
    })
    .unwrap();
}

#[tauri::command]
fn unwatch(path: String, watcher: tauri::State<'_, Watcher>) {
  watcher.0.lock().unwrap().unwatch(path).unwrap();
}

use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu};

fn make_menu() -> Menu {
  // https://docs.rs/tauri/1.0.0-beta.5/tauri/enum.MenuItem.html

  let main_submenu =
    Submenu::new("Mnote", Menu::new().add_native_item(MenuItem::Quit));

  let file_submenu = Submenu::new(
    "File",
    Menu::new()
      .add_item(CustomMenuItem::new("open-file", "Open File..."))
      .add_item(CustomMenuItem::new("open-folder", "Open Folder..."))
      .add_item(CustomMenuItem::new("close-folder", "Close Folder"))
      .add_item(CustomMenuItem::new("refresh-folder", "Refresh Folder"))
      .add_native_item(MenuItem::Separator)
      .add_item(
        CustomMenuItem::new("save", "Save").accelerator("CmdOrControl+S"),
      )
      .add_item(
        CustomMenuItem::new("save-as", "Save As...")
          .accelerator("CmdOrControl+Shift+S"),
      )
      .add_native_item(MenuItem::Separator)
      .add_item(
        CustomMenuItem::new("close-editor", "Close Editor")
          .accelerator("CmdOrControl+W"),
      ),
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
    .add_submenu(file_submenu)
    .add_submenu(edit_submenu)
}

fn main() {
  let builder = tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_args,
      is_mac,
      is_windows,
      watch,
      unwatch,
      fs_rename,
      fs_save_dialog,
      fs_open_dialog
    ])
    .setup(|app| {
      app.manage(Watcher(Mutex::new(
        Hotwatch::new_with_custom_delay(Duration::from_millis(500)).unwrap(),
      )));
      Ok(())
    });

  let builder = if cfg!(target_os = "macos") {
    builder.menu(make_menu()).on_menu_event(move |event| {
      let e: &str = event.menu_item_id();
      event.window().emit("menu_event", e).unwrap();
    })
  } else {
    builder
  };

  let app = builder
    .build(tauri::generate_context!())
    .expect("error building the app");

  app.run(|app_handle, e| {
    if let tauri::RunEvent::CloseRequested { label, api, .. } = e {
      api.prevent_close();
      let window = app_handle.get_window(&label).unwrap();
      window.emit("close-requested", ()).unwrap();
    }
  });
}
