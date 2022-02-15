use hotwatch::{Event, Hotwatch};
use serde::Serialize;
use std::sync::Mutex;
use std::time::Duration;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct WatcherPayload<'a> {
  kind: &'a str, //
  path: Option<&'a str>,
  target_path: Option<&'a str>,
}

pub struct Watcher(Mutex<Hotwatch>);

impl Watcher {
  pub fn default() -> Self {
    Watcher(Mutex::new(
      Hotwatch::new_with_custom_delay(Duration::from_millis(500)).unwrap(),
    ))
  }
}

#[tauri::command]
pub fn watch(
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
pub fn unwatch(path: String, watcher: tauri::State<'_, Watcher>) {
  watcher.0.lock().unwrap().unwatch(path).unwrap();
}
