// https://stackoverflow.com/questions/66485945/

use std::process::Command;

#[derive(Debug)]
pub enum ShowErr {
  UnsupportedOs,
  ProcessErr(std::io::Error),
}

#[tauri::command]
pub fn can_show_in_explorer() -> bool {
  cfg!(any(target_os = "windows", target_os = "macos"))
}

fn show<P: AsRef<std::ffi::OsStr>>(path: P) -> Result<(), ShowErr> {
  let mut command = if cfg!(target_os = "macos") {
    let mut command = Command::new("open");
    command.arg("--reveal");
    command
  } else if cfg!(target_os = "windows") {
    let mut command = Command::new("explorer");
    command.arg("/select,");
    command
  } else {
    return Err(ShowErr::UnsupportedOs);
  };

  match command.arg(path).spawn() {
    Ok(_) => Ok(()),
    Err(err) => Err(ShowErr::ProcessErr(err)),
  }
}

#[tauri::command]
pub fn show_in_explorer(path: String) {
  show(&path).unwrap();
}
