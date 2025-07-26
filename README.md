# LangCursor - Input Language-based Cursor Color

![LangCursor Demo](https://raw.githubusercontent.com/your-username/lang-cursor/main/images/demo.gif) <!-- Replace with your actual demo GIF -->

**LangCursor** is a Visual Studio Code extension that changes the color of your editor cursor based on the current input language. This provides an intuitive, visual cue to instantly know whether you're about to type in your primary or secondary language, reducing typing errors and improving workflow.

## Features

- **Automatic Language Detection**: Monitors your system's current input source.
- **Customizable Colors**: Easily set your preferred cursor colors for both primary and secondary languages via VS Code settings.
- **Real-time Updates**: The cursor color changes instantly as you switch input languages.
- **Cross-Platform Support**: Works on macOS, Windows, and Linux.
- **Lightweight & Efficient**: Runs in the background with minimal performance impact.

## Requirements

This extension relies on shell commands to detect the active input language. 

- **macOS**: No additional dependencies required.
- **Windows**: No additional dependencies required. The extension uses a built-in PowerShell command.
- **Linux (GNOME)**: The `gsettings` command-line tool is required, which is typically pre-installed on GNOME-based distributions.
- **Linux (Other)**: You may need to install a tool like `xkb-switch`. The command can be customized in the future if needed.

## Extension Settings

Customize the cursor colors and check interval by navigating to `File > Preferences > Settings` and searching for "LangCursor".

This extension contributes the following settings:

- `lang-cursor.primaryLangColor`: The cursor color for your primary language (e.g., English). 
  - **Default**: `#ffffff` (White)
- `lang-cursor.secondaryLangColor`: The cursor color for your secondary language (e.g., Korean).
  - **Default**: `#fbff00` (Yellow)
- `lang-cursor.checkInterval`: The interval in milliseconds at which to check the current input language.
  - **Default**: `1000` (1 second)

Example `settings.json` configuration:

```json
{
    "lang-cursor.primaryLangColor": "#d4d4d4",
    "lang-cursor.secondaryLangColor": "#ff6347",
    "lang-cursor.checkInterval": 500
}
```

## How It Works

The extension periodically runs a system-specific command to get the current keyboard layout/input source. Based on the output, it updates the `editorCursor.foreground` color in your VS Code's `workbench.colorCustomizations` setting.

- **macOS**: `defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources | grep 'KeyboardLayout Name'`
- **Windows**: `powershell -command "(Get-WinUserLanguageList)[0].LanguageTag"`
- **Linux**: `gsettings get org.gnome.desktop.input-sources current`

## Known Issues

- On some systems, there might be a slight delay between switching the language and the cursor color changing, depending on the `checkInterval` setting.
- The language detection for Windows and Linux might not cover all possible system configurations. If you encounter issues, please open an issue on GitHub.

## Release Notes

See the [CHANGELOG.md](CHANGELOG.md) file for details on each release.

---

**Enjoy a more colorful and productive coding experience!**
