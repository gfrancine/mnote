// https://stackoverflow.com/questions/66485945/

use std::ffi::OsStr;
use std::fs;
use std::io;
use std::path::Path;
use std::process::Command;

fn show<P: AsRef<Path>>(path: P) -> io::Result<()> {
  let path = path.as_ref();

  let path = if cfg!(target_os = "linux") && fs::metadata(path)?.is_file() {
    let mut parent_path = path.to_path_buf();
    parent_path.pop();
    parent_path
  } else {
    path.to_path_buf()
  };

  let mut command = if cfg!(target_os = "macos") {
    let mut command = Command::new("open");
    command.arg("--reveal");
    command
  } else if cfg!(target_os = "windows") {
    let mut command = Command::new("explorer");
    command.arg("/select,");
    command
  } else {
    Command::new("xdg-open")
  };

  command.arg(&OsStr::new(&path)).spawn().map(|_| {})
}

#[tauri::command]
pub fn show_in_explorer(path: String) -> Result<(), String> {
  show(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_folder_in_explorer(path: String) -> Result<(), String> {
  match Command::new(if cfg!(target_os = "macos") {
    "open"
  } else if cfg!(target_os = "windows") {
    "explorer"
  } else {
    "xdg-open"
  })
  .arg(path)
  .spawn()
  {
    Ok(_) => Ok(()),
    Err(e) => Err(e.to_string()),
  }
}
