import * as vscode from 'vscode';
import { exec } from 'child_process';

let interval: NodeJS.Timeout | undefined;
let lastColor: string | undefined;

export function activate(context: vscode.ExtensionContext) {
    let checkInterval: number;

    function updateConfig() {
        const config = vscode.workspace.getConfiguration('lang-cursor');
        checkInterval = config.get<number>('checkInterval') || 1000;
    }

    updateConfig();

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('lang-cursor')) {
            updateConfig();
            if(interval) clearInterval(interval);
            startChecking();
        }
    });

    function startChecking() {
        interval = setInterval(() => {
            const platform = process.platform;
            let command = '';

            if (platform === 'darwin') {
                command = "defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleCurrentKeyboardLayoutInputSourceID";
            } else if (platform === 'win32') {
                command = 'powershell -command "(Get-WinUserLanguageList)[0].LanguageTag"';
            } else if (platform === 'linux') {
                command = "gsettings get org.gnome.desktop.input-sources current | cut -d ' ' -f 2";
            }

            if (!command) {
                vscode.window.showErrorMessage('LangCursor: Unsupported OS.');
                if(interval) clearInterval(interval);
                return;
            }

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`LangCursor exec error: ${error.message}`);
                    // Optionally, show a less intrusive error message
                    // vscode.window.setStatusBarMessage('LangCursor: Could not determine language.', 5000);
                    return;
                }
                if (stderr) {
                    console.error(`LangCursor stderr: ${stderr}`);
                    return;
                }

                const config = vscode.workspace.getConfiguration('lang-cursor');
                const primaryLangColor = config.get<string>('primaryLangColor') || '#ffffff';
                const secondaryLangColor = config.get<string>('secondaryLangColor') || '#fbff00';

                const currentLayout = stdout.trim();
                const workbenchConfig = vscode.workspace.getConfiguration('workbench');
                const colorCustomizations = workbenchConfig.get<{ [key: string]: string }>('colorCustomizations') || {};
                
                let newColor;
                if (currentLayout.toLowerCase().includes('korean') || currentLayout.toLowerCase().includes('hangul')) {
                    newColor = secondaryLangColor;
                } else {
                    newColor = primaryLangColor;
                }

                if (newColor && newColor !== lastColor && newColor !== colorCustomizations['editorCursor.foreground']) {
                    lastColor = newColor;
                    const newColorCustomizations = { ...colorCustomizations, 'editorCursor.foreground': newColor };
                    workbenchConfig.update('colorCustomizations', newColorCustomizations, vscode.ConfigurationTarget.Global);
                }
            });
        }, checkInterval);
    }

    startChecking();

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
    
    const workbenchConfig = vscode.workspace.getConfiguration('workbench');
    const colorCustomizations = workbenchConfig.get<{ [key: string]: string }>('colorCustomizations');

    if (colorCustomizations && colorCustomizations['editorCursor.foreground']) {
        // Only revert if the color was set by this extension
        if (lastColor && colorCustomizations['editorCursor.foreground'] === lastColor) {
             const { 'editorCursor.foreground': _, ...rest } = colorCustomizations;
             workbenchConfig.update('colorCustomizations', rest, vscode.ConfigurationTarget.Global);
        }
    }
    lastColor = undefined;
}
