# Developing

## Requirements

- Node >=16
- NPM >=7
- Rust and Cargo
- Prerequisites for Tauri as given in [this article](https://tauri.studio/docs/getting-started/prerequisites)

## Installing dependencies

Run `npm i --force` at the root.

`--force` is needed because there are dependencies having different major versions of React as peer dependencies. Always install new React dependencies at the root.

## Running scripts

I wrote `tomlrun` for Mnote to write scripts in TOML instead of JSON. The scripts are in `scripts.toml`.

They can be run with `npm run tomlrun <script> [-- args...]` or by using the CLI directly (install with `npm i -g tomlrun`).

## Running the web demo

Mnote has a web demo and the Tauri desktop app. More information can be found in the [file structure article](./File Structure.md). 

To run the web demo, run `tomlrun app dev-web`.

To build and run the Tauri app in development mode, run `tomlrun app dev`.

You can also replace `tomlrun app <script>` with `cd mnote-app && npm run <script>`.

## Building the desktop app

Run `tomlrun app build-debug` to build a development version of the app with the installer, and `tomlrun app build-release` for the production app.

It's also available as a Github Actions workflow that can be triggered manually.

## Formatting and linting

Mnote uses `prettier`  and `eslint`.

Run `tomlrun fmt` to run prettier on the entire project and `tomlrun lint` for eslint.

Run `tomlrun fmt-rs` to format the Tauri Rust crate and `tomlrun lint-rs` to lint and have the compiler run checks on it.

Make sure to run both before committing.











