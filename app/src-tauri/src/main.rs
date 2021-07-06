#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[tauri::command]
fn get_args() -> Vec<String> {
  std::env::args().collect()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_args])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
