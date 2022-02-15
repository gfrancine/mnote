use rfd::FileDialog;
use serde::Deserialize;
use std::path::PathBuf;

#[derive(Deserialize)]
pub struct DialogFilter {
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
pub fn dialog_open(
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
pub fn dialog_save(
  filters: Option<Vec<DialogFilter>>,
  starting_directory: Option<String>,
  starting_file_name: Option<String>,
) -> Option<String> {
  process_dialog_result(
    dialog_from_opts(filters, starting_directory, starting_file_name)
      .save_file(),
  )
}
