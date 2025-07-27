import * as vscode from 'vscode';
import { exec } from 'child_process';

let interval: NodeJS.Timeout | undefined;
let lastColor: string | undefined;

export function activate(context: vscode.ExtensionContext) {
    let checkInterval: number;
    const originWorkbenchConfig = vscode.workspace.getConfiguration('workbench');
    const originColorCustomizations = originWorkbenchConfig.get<{ [key: string]: string }>('colorCustomizations')!;
    const originCursorColor = originColorCustomizations['editorCursor.foreground'];

    function updateConfig() {
        const config = vscode.workspace.getConfiguration('lang-cursor');
        checkInterval = config.get<number>('checkInterval') || 500;
    }

    updateConfig();

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('workbench')) {
            updateConfig();
            if(interval) {
                clearInterval(interval);
            }
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
                if(interval) {
                    clearInterval(interval);
                };
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
                const workbenchConfig = vscode.workspace.getConfiguration('workbench');
                const themeConfig = workbenchConfig.get<string>('colorTheme')!;

                const config = vscode.workspace.getConfiguration('lang-cursor');
                const primaryLangColor = config.get<{light: string, dark: string}>('primaryLangColor')!;
                const secondaryLangColor = config.get<{light: string, dark: string}>('secondaryLangColor')!;
                let primaryCursorColor: string;
                let secondaryCursorColor: string;
                if (themeConfig.toLowerCase().includes('light')) {
                    primaryCursorColor = primaryLangColor.light;
                    secondaryCursorColor = secondaryLangColor.light;
                } else if (themeConfig.toLowerCase().includes('dark')) {
                    primaryCursorColor = primaryLangColor.dark;
                    secondaryCursorColor = secondaryLangColor.dark;
                } else {
                    primaryCursorColor = originCursorColor;
                    secondaryCursorColor = originCursorColor;
                }

                const currentLayout = stdout.trim();
                const colorCustomizations = workbenchConfig.get<{ [key: string]: string }>('colorCustomizations')!;
                
                let newColor;
                if (currentLayout.toLowerCase().includes('korean') || currentLayout.toLowerCase().includes('hangul')) {
                    newColor = secondaryCursorColor;
                } else {
                    newColor = primaryCursorColor;
                }

                if (newColor && newColor !== lastColor && newColor !== colorCustomizations['editorCursor.foreground']) {
                    updateCursorColor(newColor);
                }
            });
        }, checkInterval);
    }

    function updateCursorColor(newColor: string) {
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        const colorCustomizations = workbenchConfig.get<{ [key: string]: string }>('colorCustomizations') || {};
        lastColor = newColor;
        const newColorCustomizations = { ...colorCustomizations, 'editorCursor.foreground': newColor };
        workbenchConfig.update('colorCustomizations', newColorCustomizations, vscode.ConfigurationTarget.Global);
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
