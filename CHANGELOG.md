## 1.3.3 (2026-02-24)

### Bug Fixes

* **Debug Toggle:** Fixed "page stuck" issue when switching debug mode on/off by clearing SPFx component manifest caches from localStorage and sessionStorage (preserves placement preference)
* **Debug Toggle:** Renamed session storage key from `spfx-debug` to `pnp-lr-debug` to avoid conflicts with other SPFx tooling
* **Debug Toggle:** Debug connected state is now properly preserved across page navigations instead of being reset on initialization
* **Debug Toggle:** Simplified plug icon logic to use `debugConnected` state directly, removing unreliable webpack HMR function detection for UI state
* **Version Detection:** SPFx version is now detected at runtime instead of reading from static `.yo-rc.json`, which was unreliable in deployed scenarios

### Changes

* **Credits Panel:** SPFx version display now shows "Detecting..." on load and updates dynamically once runtime version detection completes

## 1.3.0 (2026-02-06)

### Features

* **HMR Control:** Intelligent SPFx version detection enables modern HMR interception for SPFx 1.22+
* **HMR Control:** Pause/resume toggle allows developers to control when live reload updates are applied
* **HMR Control:** Pending updates badge displays count of blocked HMR updates while paused
* **HMR Control:** Apply button enables manual application of accumulated changes without auto-reload
* **HMR Control:** Session storage persistence maintains pause state across page navigations
* **HMR Control:** `webpackHotUpdate*` interception provides fine-grained control over webpack HMR lifecycle
* **Build:** Upgraded SPFx dependencies from 1.22.1 to 1.22.2
* **Build:** Updated htwoo-core to 2.7.1, conventional-changelog to 7.1.1, tslib to 2.8.1
* **Documentation:** Added HMR flow diagram and version detection comparison (Dieter Rams design aesthetic)

### Technical Details

* **Modern Mode (SPFx 1.22+):** Leverages existing webpack-dev-server HMR infrastructure with interceptor
* **Legacy Mode (SPFx ≤ 1.21):** Maintains WebSocket-based reload approach for backward compatibility
* **HMR Strategy:** Passes empty `{}` modules to webpack when paused to block updates without disrupting HMR connection

## 1.2.0 (2026-01-28)

### Features

* **Build:** Upgraded from SPFx 1.19.0 (Gulp) to SPFx 1.22.1 (Heft) toolchain
* **Build:** Upgraded TypeScript from 4.7 to 5.8
* **UI:** Application customizer can be dynamically placed at Header (top) or Footer (bottom) with localStorage persistence

### Bug Fixes

* **Compatibility:** debugManifestUrl handling now supports SPFx 1.0 - 1.22 with fallback logic for backward compatibility
* **Compatibility:** WebSocket connection updated to use webpack-dev-server (`wss://localhost:4321/ws`) with hash-based change detection
* **Compatibility:** Fixed connected/disconnected toggle state management to properly respect user preference
* **Build:** Fixed TypeScript 5.8 strict mode warnings (TS2564 - definite assignment assertions)

## 1.1.0 (2024-07-23)

### Features

* **UI:** Credits information added to toolbar ([d0de686](https://github.com/pnp/sp-livereload/commit/d0de686d6102166b0f52ca1ddb60c439cb25b80d))
* **UI:** Theme Colors and Branding Information added ([b0a15b7](https://github.com/pnp/sp-livereload/commit/b0a15b7a25cd1834f62035397b9542eec9421190))

### Bug Fixes

* connected / disconnected state issue ([8562c10](https://github.com/pnp/sp-livereload/commit/8562c10cd73f93cc623987643f8ed7a3f7d347a6))
* theme handliing on live reloader bar ([52af4c0](https://github.com/pnp/sp-livereload/commit/52af4c0a771ab5fb44e7659a222658af2885f1f2))
