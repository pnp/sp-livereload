# PnP SPFx Live Reloader

![SPfx Live Reloader Logo](docs/assets/pnp-live-reloader.svg "Refresh and Stay up to date")

Download the [latest version](https://github.com/pnp/sp-livereload/tree/main/installation)

## Summary

Enables your SharePoint Framework Solutions to automatically refresh the browser window after rebuild.

## FAQ

### How is it different from spfx-fast-serve?

PnP SPFx live reloader supports projects from SPFx (SharePoint Framework) Version 1.0 onwards. After a successful build, SharePoint will automatically reload the updated code using a built-in mechanism.

spfx-fast-serve, on the other hand, requires Microsoft-unsupported manipulation of the SPFx build chain. 

### Are there any additional requirements?

The PnP SPFx Live Reloader is a custom application customiser that can be connected to any SPFx project with **zero configuration effort** for your current and upcoming projects.

### Will this make SharePoint Framework development faster?

Many factors of your system configuration and hardware influence the performance of the SharePoint Framework build chain. To make something faster or slower is always highly subjective.

However, PnP SPFx Live Reloader gives you a smoother development experience by not having to reload the browser manually and look for the SharePoint Framework build chain to complete all its tasks.

You can focus on your code rather than when it is time to reload your browser.


## Used SharePoint Framework Version

![version](https://img.shields.io/badge/SPFx-1.22.2-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

## Prerequisites

None so far.

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| PnP SFPx Live Reloader | Stefan Bauer - N8D, [Twitter](https://x.com/stfbauer), [LinkedIn](https://www.linkedin.com/in/stfbauer/) |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.3.3   | February 24, 2026 | Debug toggle fixes, runtime SPFx version detection, reload stuck fix |
| 1.3     | February 6, 2026 | HMR control: pause/resume, pending updates badge, SPFx version detection |
| 1.2     | January 28, 2026 | SPFx 1.22 Heft migration, placement toggle, WebSocket fixes |
| 1.1     | July 23, 2024 | Credits and Branding Information added |
| 1.0     | July 11, 2024 | Initial release |

For details look at the [CHANGELOG](CHANGELOG.md)

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Installation

1. Download the [latest release](https://github.com/pnp/sp-livereload/releases)
1. Create a [site collection app catalog](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog) in your development environment - DO NOT INSTALL GLOABLLY
1. Add 'PnPSPFxLiveReloader.sppkg' to this app site catalog and install
1. You will see the following bar at the bottom of your browser window.


## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **npm run serve**

## Features

### Automatic Browser Reload

Monitors the SPFx webpack-dev-server for build completion and automatically refreshes the browser window. Works seamlessly with existing SPFx projects with **zero configuration**.

### Dual-Mode Operation

- **Modern Mode (SPFx 1.22+):** Intercepts the webpack Hot Module Replacement (HMR) infrastructure for fine-grained control over live reload updates.
- **Legacy Mode (SPFx 1.0 - 1.21):** Uses WebSocket connection to `wss://localhost:4321/ws` for full-page reload on build completion.

The correct mode is selected automatically at runtime based on SPFx version detection.

### HMR Control (SPFx 1.22+)

- **Pause / Resume:** Toggle to control when live reload updates are applied, so you can focus on debugging without unexpected refreshes.
- **Pending Updates Badge:** Shows the count of blocked HMR updates while paused.
- **Apply Button:** Manually apply accumulated changes on your terms without automatic reload.
- **Session Persistence:** Pause state is persisted in session storage across page navigations.

### Debug Mode Toggle

- Toggle the debug manifest URL (`?debug=true&noredir=true&debugManifestsFile=...`) on or off with a single click.
- Automatically clears SPFx component manifest caches when switching modes to prevent stale state.
- Preserves your placement preference across debug mode toggles.

### Flexible Placement

- Position the Live Reloader bar at the **Header** (top) or **Footer** (bottom) of the page.
- Placement preference is persisted in localStorage.

### Theme Integration

- Inherits SharePoint theme colors automatically.
- Supports semantic and palette colors with real-time theme change detection.

### Architecture Diagrams

- [HMR Flow](docs/hmr-flow.svg) — How the HMR interceptor controls webpack hot updates
- [Version Detection](docs/version-detection.svg) — How SPFx version is detected at runtime

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
