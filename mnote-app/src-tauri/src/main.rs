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

mod filesystem;
mod show;
mod watcher;

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
      watcher::watch,
      watcher::unwatch,
      filesystem::fs_rename,
      filesystem::fs_read_dir,
      filesystem::fs_read_text_file,
      filesystem::fs_read_binary_file,
      filesystem::fs_write_text_file,
      filesystem::fs_write_binary_file,
      filesystem::fs_read_dir,
      filesystem::fs_delete_file,
      filesystem::fs_delete_dir,
      filesystem::fs_create_dir,
      filesystem::fs_is_file,
      filesystem::fs_is_dir,
      filesystem::fs_move_to_trash,
      show::show_in_explorer,
      show::open_folder_in_explorer
    ])
    .setup(|app| {
      app.manage(watcher::Watcher::default());
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
    if let tauri::RunEvent::WindowEvent {
      label,
      event: tauri::WindowEvent::CloseRequested { api, .. },
      ..
    } = e
    {
      api.prevent_close();
      let window = app_handle.get_window(&label).unwrap();
      window.emit("close-requested", ()).unwrap();
    }
  });
}
