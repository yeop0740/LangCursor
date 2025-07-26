import * as vscode from 'vscode';
import { exec } from 'child_process';

let interval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('lang-cursor');
    const primaryLangColor = config.get<string>('primaryLangColor');
    const secondaryLangColor = config.get<string>('secondaryLangColor');
    const checkInterval = config.get<number>('checkInterval');

    interval = setInterval(() => {
        const platform = process.platform;
        let command = '';

        if (platform === 'darwin') {
            command = "defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources | grep 'KeyboardLayout Name' | cut -d '=' -f 2";
        } else if (platform === 'win32') {
            // PowerShell command to get current input language
            command = 'powershell -command "(Get-WinUserLanguageList)[0].LanguageTag"';
        } else if (platform === 'linux') {
            command = "gsettings get org.gnome.desktop.input-sources current | cut -d ' ' -f 2";
        }

        if (command) {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }

                const currentLayout = stdout.trim();
                const workbenchConfig = vscode.workspace.getConfiguration('workbench');
                const colorCustomizations = workbenchConfig.get('colorCustomizations') as { [key: string]: string } | undefined;
                let newColor;

                // NOTE: This is a simple example. You may need to adjust the condition based on your system's output.
                if (currentLayout.includes('Korean') || currentLayout.includes('Hangul')) {
                    newColor = secondaryLangColor;
                } else {
                    newColor = primaryLangColor;
                }

                const newColorCustomizations = { ...(colorCustomizations || {}), 'editorCursor.foreground': newColor };
                workbenchConfig.update('colorCustomizations', newColorCustomizations, vscode.ConfigurationTarget.Global);
            });
        }
    }, checkInterval);

    context.subscriptions.push({
        dispose: () => {
            if (interval) {
                clearInterval(interval);
            }
        }
    });
}

export function deactivate() {
    if (interval) {
        clearInterval(interval);
    }
    // Reset cursor color to default
    const workbenchConfig = vscode.workspace.getConfiguration('workbench');
    const colorCustomizations = workbenchConfig.get('colorCustomizations') as { [key: string]: string } | undefined;
    if (colorCustomizations && colorCustomizations['editorCursor.foreground']) {
        delete colorCustomizations['editorCursor.foreground'];
        workbenchConfig.update('colorCustomizations', colorCustomizations, vscode.ConfigurationTarget.Global);
    }
}
