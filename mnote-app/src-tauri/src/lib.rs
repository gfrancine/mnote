
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

use tauri::Emitter;
use tauri::Manager;

#[cfg(target_os = "macos")]
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let builder = tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
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

      #[cfg(target_os = "macos")]
      {
        let quit = PredefinedMenuItem::quit(app, None)?;

        let main_submenu = SubmenuBuilder::new(app, "Mnote")
          .item(&quit)
          .build()?;

        let open_file = MenuItemBuilder::with_id("open-file", "Open File...").build(app)?;
        let open_folder =
          MenuItemBuilder::with_id("open-folder", "Open Folder...").build(app)?;
        let close_folder =
          MenuItemBuilder::with_id("close-folder", "Close Folder").build(app)?;
        let refresh_folder =
          MenuItemBuilder::with_id("refresh-folder", "Refresh Folder").build(app)?;
        let save = MenuItemBuilder::with_id("save", "Save")
          .accelerator("CmdOrControl+S")
          .build(app)?;
        let save_as = MenuItemBuilder::with_id("save-as", "Save As...")
          .accelerator("CmdOrControl+Shift+S")
          .build(app)?;
        let close_editor = MenuItemBuilder::with_id("close-editor", "Close Editor")
          .accelerator("CmdOrControl+W")
          .build(app)?;

        let file_submenu = SubmenuBuilder::new(app, "File")
          .item(&open_file)
          .item(&open_folder)
          .item(&close_folder)
          .item(&refresh_folder)
          .separator()
          .item(&save)
          .item(&save_as)
          .separator()
          .item(&close_editor)
          .build()?;

        let edit_submenu = SubmenuBuilder::new(app, "Edit")
          .undo()
          .redo()
          .separator()
          .cut()
          .copy()
          .paste()
          .separator()
          .select_all()
          .build()?;

        let menu = MenuBuilder::new(app)
          .item(&main_submenu)
          .item(&file_submenu)
          .item(&edit_submenu)
          .build()?;

        app.set_menu(menu)?;

        let app_handle = app.handle().clone();
        app.on_menu_event(move |_app, event| {
          let id = event.id().0.clone();
          if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.emit("menu_event", id);
          }
        });
      }

      Ok(())
    });

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
      if let Some(window) = app_handle.get_webview_window(&label) {
        let _ = window.emit("close-requested", ());
      }
    }
  });
}
