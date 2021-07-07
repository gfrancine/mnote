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

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_args,
      is_mac,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
