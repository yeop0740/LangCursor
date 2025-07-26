# LangCursor - 입력 언어 기반 커서 색상 변경

![LangCursor Demo](https://raw.githubusercontent.com/your-username/lang-cursor/main/images/demo.gif) <!-- 실제 데모 GIF로 교체해주세요 -->

**LangCursor**는 현재 사용 중인 입력 언어에 따라 에디터 커서의 색상을 변경해주는 Visual Studio Code 확장 프로그램입니다. 이 기능을 통해 현재 입력 언어가 주 언어인지, 보조 언어인지 직관적으로 파악하여 오타를 줄이고 작업 흐름을 개선할 수 있습니다.

## 주요 기능

- **자동 언어 감지**: 시스템의 현재 입력 소스를 감지합니다.
- **사용자 정의 색상**: VS Code 설정을 통해 주 언어와 보조 언어의 커서 색상을 쉽게 지정할 수 있습니다.
- **실시간 업데이트**: 입력 언어를 변경하면 커서 색상이 즉시 변경됩니다.
- **크로스 플랫폼 지원**: macOS, Windows, Linux에서 모두 작동합니다.
- **가볍고 효율적인 성능**: 최소한의 성능 영향으로 백그라운드에서 실행됩니다.

## 요구 사항

이 확장 프로그램은 셸 명령을 통해 현재 활성화된 입력 언어를 감지합니다.

- **macOS**: 별도의 의존성이 필요하지 않습니다.
- **Windows**: 별도의 의존성이 필요하지 않습니다. 내장된 PowerShell 명령을 사용합니다.
- **Linux (GNOME)**: `gsettings` 명령어가 필요하며, 이는 일반적으로 GNOME 기반 배포판에 사전 설치되어 있습니다.
- **Linux (기타)**: `xkb-switch`와 같은 도구를 설치해야 할 수 있습니다. 필요한 경우 향후 명령어 사용자 정의 기능이 추가될 수 있습니다.

## 확장 프로그램 설정

`파일 > 기본 설정 > 설정`으로 이동하여 "LangCursor"를 검색하면 커서 색상과 확인 주기를 사용자 정의할 수 있습니다.

이 확장 프로그램은 다음과 같은 설정을 제공합니다:

- `lang-cursor.primaryLangColor`: 주 언어(예: 영어)의 커서 색상입니다.
  - **기본값**: `#ffffff` (흰색)
- `lang-cursor.secondaryLangColor`: 보조 언어(예: 한국어)의 커서 색상입니다.
  - **기본값**: `#fbff00` (노란색)
- `lang-cursor.checkInterval`: 현재 입력 언어를 확인하는 주기(밀리초)입니다.
  - **기본값**: `1000` (1초)

`settings.json` 설정 예시:

```json
{
    "lang-cursor.primaryLangColor": "#d4d4d4",
    "lang-cursor.secondaryLangColor": "#ff6347",
    "lang-cursor.checkInterval": 500
}
```

## 작동 방식

이 확장 프로그램은 주기적으로 시스템별 명령어를 실행하여 현재 키보드 레이아웃/입력 소스를 가져옵니다. 그 결과에 따라 VS Code의 `workbench.colorCustomizations` 설정에 있는 `editorCursor.foreground` 색상을 업데이트합니다.

- **macOS**: `defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources | grep 'KeyboardLayout Name'`
- **Windows**: `powershell -command "(Get-WinUserLanguageList)[0].LanguageTag"`
- **Linux**: `gsettings get org.gnome.desktop.input-sources current`

## 알려진 문제

- 일부 시스템에서는 `checkInterval` 설정에 따라 언어 전환과 커서 색상 변경 사이에 약간의 지연이 발생할 수 있습니다.
- Windows 및 Linux의 언어 감지 기능이 모든 시스템 구성을 다루지 못할 수 있습니다. 문제가 발생하면 GitHub에 이슈를 등록해주세요.

## 릴리스 노트

각 릴리스에 대한 자세한 내용은 [CHANGELOG.md](CHANGELOG.md) 파일을 참조하세요.

---

**더 다채롭고 생산적인 코딩 경험을 즐겨보세요!**
