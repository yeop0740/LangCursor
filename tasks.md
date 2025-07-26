# LangCursor VSCode Extension 개발 작업 목록

## 1. 프로젝트 설정 및 구성 (package.json)

- [x] **기본 설정 정의:**
    - 확장 프로그램의 이름, 설명, 버전, 게시자 등 기본 정보 입력
- [x] **활성화 이벤트 (Activation Events) 설정:**
    - VSCode 시작 시 확장이 활성화되도록 `onStartupFinished` 이벤트 사용
- [x] **사용자 설정 (Configuration) 정의:**
    - 사용자가 언어별 커서 색상을 직접 지정할 수 있도록 설정 항목 추가
    - 예: `lang-cursor.primaryLangColor`, `lang-cursor.secondaryLangColor`
    - 기본값으로 사용할 색상 지정 (예: 영어는 흰색, 한글은 노란색)
- [x] **의존성 모듈 추가:**
    - 현재 입력 언어를 확인하기 위해 외부 CLI 도구를 실행해야 하므로, Node.js의 `child_process`를 활용할 준비. (별도 `npm` 모듈은 필요 없을 수 있음)

## 2. 핵심 로직 구현 (src/extension.ts)

- [x] **`activate` 함수 구현:**
    - 확장이 활성화될 때 실행될 메인 로직
- [x] **운영체제(OS)별 입력 언어 확인 로직 구현:**
    - `process.platform`을 사용하여 현재 OS 확인 (darwin, win32, linux)
    - **macOS (`darwin`):**
        - `defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources | grep 'KeyboardLayout Name' | cut -d '=' -f 2` 와 같은 셸 명령어를 `child_process.exec`로 실행하여 현재 키보드 레이아웃 확인
    - **Windows (`win32`):**
        - Windows에서는 특정 언어 감지를 위한 내장 CLI가 명확하지 않으므로, `PowerShell` 스크립트나 외부 도구(예: `input-method-cli`) 사용을 고려하고, `README.md`에 해당 도구 설치를 안내.
    - **Linux (`linux`):**
        - `gsettings get org.gnome.desktop.input-sources current | cut -d " " -f 2` (GNOME) 또는 `xkb-switch` 와 같은 명령어를 사용하여 확인.
- [x] **주기적인 언어 상태 확인:**
    - `setInterval`을 사용하여 1-2초 간격으로 현재 입력 언어를 지속적으로 확인
- [x] **커서 색상 동적 변경 로직:**
    - 확인된 입력 언어에 따라 `package.json`에 정의된 색상 값을 가져옴
    - `workspace.getConfiguration('workbench')` API 사용
    - `colorCustomizations` 설정의 `editorCursor.foreground` 값을 `update` 메서드를 통해 동적으로 변경
    - **주의:** 기존 사용자의 다른 `colorCustomizations` 설정을 덮어쓰지 않도록, 현재 설정을 먼저 읽어온 후 `editorCursor.foreground` 속성만 수정하여 다시 저장.

## 3. 기능 개선 및 안정화

- [x] **`deactivate` 함수 구현:**
    - 확장이 비활성화될 때 `setInterval` 정리 및 커서 색상을 원래대로 복원하는 로직 추가
- [x] **에러 핸들링:**
    - 입력 언어 확인 명령어 실행 실패 시 에러 처리
    - 설정 값이 유효하지 않을 경우 기본값 사용
- [x] **성능 최적화:**
    - `setInterval` 주기를 사용자가 설정할 수 있도록 옵션 추가 (`lang-cursor.checkInterval`)

## 4. 문서화 및 배포 준비

- [ ] **README.md 작성:**
    - 확장의 기능, 사용 방법, 설정 옵션 상세히 설명
    - 특히 Windows/Linux 사용자를 위한 사전 설치 필요 도구 안내
- [x] **CHANGELOG.md 작성:**
    - 버전별 변경 사항 기록
- [ ] **아이콘 및 스크린샷 준비:**
    - Marketplace에 게시할 때 사용할 아이콘 및 기능 설명 스크린샷 제작
- [ ] **테스트:**
    - 각 OS 환경에서 커서 색상 변경이 잘 동작하는지 테스트
- [ ] **패키징 및 배포:**
    - `vsce` 도구를 사용하여 확장을 패키징하고 Visual Studio Marketplace에 게시
