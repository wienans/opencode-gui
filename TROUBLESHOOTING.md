# Troubleshooting Guide

## F5 Not Working / Extension Not Launching

### Step-by-Step Manual Launch

If pressing F5 doesn't work or hangs, follow these steps:

1. **Build the extension first**:
   ```bash
   npm run build
   ```

2. **Start watch mode in a terminal** (keep this running):
   ```bash
   npm run watch
   ```

3. **Open Run and Debug panel**:
   - Click the Run and Debug icon in the left sidebar (play button with bug icon)
   - OR press `Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows/Linux)

4. **Select "Run Extension"** from the dropdown at the top

5. **Click the green play button** or press F5

6. **Wait for the Extension Development Host window to open**

### In Cursor Specifically

Cursor sometimes has issues with the preLaunchTask. If you're having trouble:

1. **Use the "Run Extension" configuration** (not "Run Extension (with Watch)")
2. **Always run `npm run watch` manually** in a terminal first
3. Then press F5

### Verify Extension is Loaded

In the Extension Development Host window:

1. **Open the Debug Console**:
   - View menu > Debug Console
   - Or press `Cmd+Shift+Y` (Mac) / `Ctrl+Shift+Y` (Windows/Linux)

2. **Look for these messages**:
   ```
   OpenCode extension is now active!
   OpenCode webview provider registered
   ```

3. **If you don't see these messages**, check:
   - The `dist` folder exists and has `extension.js` and `OpenCodeViewProvider.js`
   - The `out` folder exists and has `main.js` and `main.css`

### Extension Icon Not Showing in Activity Bar

1. **Verify the icon file exists**:
   ```bash
   ls -la media/icon.svg
   ```

2. **Check the package.json** has the correct path:
   ```json
   "icon": "media/icon.svg"
   ```

3. **Try reloading the window**:
   - Command Palette (`Cmd+Shift+P`) > "Developer: Reload Window"

### Webview Shows Blank Screen

1. **Open Developer Tools**:
   - Command Palette > "Developer: Toggle Developer Tools"

2. **Check the Console** for errors

3. **Verify webview files exist**:
   ```bash
   ls -la out/main.js out/main.css
   ```

4. **Check the Console dropdown** shows "active frame" for webview context

### Hot Reload Not Working

**For Extension Code** (TypeScript backend):
- Make sure `npm run watch` is running
- After saving changes, press `Cmd+R` in the Extension Development Host window
- Look for compilation messages in the terminal

**For Webview Code** (React frontend):
- Make sure `npm run watch:webview` is running (part of `npm run watch`)
- Changes should reload automatically
- If not, check Vite output in the terminal for errors

### Common Errors

#### "Cannot find module 'vscode'"
- Run `npm install` again
- Make sure `@types/vscode` is in devDependencies

#### "activationEvents" warning
- This is just a warning, extension should still work
- For VS Code < 1.74, you may need to add explicit activation events

#### TypeScript compilation errors
- Run `npm run clean` to clear old build files
- Then `npm run build` to rebuild from scratch

#### Port already in use (for Vite)
- Another Vite server might be running
- Kill other Node processes or change Vite port in vite.config.ts

## Getting Help

If you're still stuck:

1. Check the **Debug Console** in both windows (main and Extension Development Host)
2. Check the **Developer Tools Console** (in Extension Development Host)
3. Run `npm run clean && npm run build` to start fresh
4. Make sure Node.js version is >= 18
