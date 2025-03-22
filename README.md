# YouTime extension

## Description

Extension that memorized video last timestamp of a video, useful when disabling youtube history or when not updating right away.

## Extension setup

installing with webpack with the accepted build vars:

- npm run build:firefox
- npm run build:chrome
- npm run build:ext - for both

## Permissions and limitations

This extensions doesn't use the sites cookies but the extensions local storage.
The extension is limited to youtube hosts permission and in content script.

- tabs
- storage
- unlimitedStorage - this permission needed because the extension could cross the 5MB limit with titles saved
