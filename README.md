# 대산 창호 발주도우미

LX 창호의 현장·제품·형태치수·색상·유리·핸들 정보를 상담하며 정리하고, 도식과 XLSX/JPG 정리본을 만드는 정적 웹앱입니다.

2026-10-20에 **실제 ChatGPT Sites 관리 Git 저장소**에서 추출했습니다. 공개 페이지 HTML을 내려받거나 앱을 재구현한 자료가 아닙니다. 게시 버전 8의 원본 커밋은 `49149d1bf93d5af59616132572d90af9612f6786`이며, 당시 PC 앱의 실행 파일 11개도 전부 동일합니다. 미게시 앱 수정은 없습니다. 출처·파일별 SHA-256·원본 배포 ID는 [docs/source-provenance.json](docs/source-provenance.json)에 기록했습니다.

원본 운영 주소: https://daesanwins.sales965625.chatgpt.site/

## 프로젝트 구조

```text
dist/                        실행·배포 소스 자체(컴파일 산출물이 아님)
  index.html                 화면 틀 및 스크립트 로딩
  app.js                     8단계 UI, 제품/모델/색상 데이터, SVG 도식, 입력 상태
  report.js                  사양표, XLSX/JPG 생성, 이미지 공유·복사
  app.css                    화면 스타일
  jszip.min.js               JSZip 3.10.1(로컬 포함)
  jszip-LICENSE.txt          원 라이선스
  *.png                      로고/랩핑/유리/핸들 참고 자산 5개
scripts/serve.mjs            외부 의존성 없는 로컬 HTTP 서버
scripts/check.mjs            구문·자산·설정 검증
.openai/hosting.json         정적 배포 설정, 원 계정 project_id 제거
.env.example                환경변수 설명(실행 필수값 없음)
package.json / package-lock.json
docs/                       출처, 이전/검증/외부 코드 안내
```

기존 프로젝트는 HTML/CSS/JavaScript를 직접 실행하므로 `src/`나 숨겨진 빌드 소스가 따로 없습니다. 제품 데이터는 `app.js`에, 내보내기용 데이터 조합은 `report.js`에 들어 있습니다. 원본에는 package/lock 파일이 없었으며 이관용 실행 명령을 위해 추가했습니다. npm 외부 의존성은 없고 JSZip은 원본 파일로 포함했습니다.

## 설치 및 로컬 실행

Node.js 20 이상이 필요한 경로입니다. 이관 검증은 Node.js 24에서 수행했습니다. 앱 자체는 `dist/index.html`을 직접 열어도 동작하지만, HTTP 또는 HTTPS로 확인하는 것이 공유 기능 검수에 편합니다.

```sh
git clone https://github.com/idnnatee-cyber/wins.git
cd wins
node scripts/check.mjs
node scripts/serve.mjs
```

출력된 `http://127.0.0.1:4173`으로 접속합니다. 종료는 Ctrl+C입니다. 선택적으로 `npm ci`, `npm run check`, `npm start`도 사용할 수 있습니다. 설치할 외부 패키지가 없어 Node 명령만으로 실행 가능합니다.

환경변수는 필수값이 없습니다. 선택 `PORT`는 로컬 서버 포트입니다. `.env.example`은 자동 로딩되지 않으므로 셸 환경변수로 지정하거나 `.env`로 복사한 뒤 `node --env-file=.env scripts/serve.mjs`로 실행합니다. `.env`는 Git에서 제외됩니다.

## 빌드와 일반 정적 배포

빌드/번들 변환 단계가 없습니다. `node scripts/check.mjs` 또는 `npm run build`로 검증한 뒤 **`dist/` 안의 파일 전체**를 정적 호스팅의 공개 루트에 업로드합니다. 출력 디렉터리는 `dist`, 빌드 명령이 필요한 호스팅은 `node scripts/check.mjs`를 사용하면 됩니다. 자산 경로는 상대 경로입니다.

API 서버, 프록시, DB 연결 및 API 키는 필요하지 않습니다. 이미지 공유와 클립보드는 브라우저·OS의 API와 권한에 의존하므로 배포 주소는 HTTPS를 사용하십시오. Web Share API가 카카오톡을 자동 발송하는 방식은 아니며, 지원되는 환경에서 사용자가 공유 대상을 고릅니다. 공유/복사가 지원되지 않으면 PNG 저장으로 대체합니다.

## B가 별도 ChatGPT Sites 계정에서 배포할 때

1. B 계정에서 이 저장소를 clone하고 로컬 검증을 수행합니다.
2. B의 Sites 도구로 **새 Site를 생성/등록**합니다. 기존 대산 사이트의 project_id를 재사용하지 않습니다.
3. 새로 반환된 B의 project_id를 `.openai/hosting.json`에 넣고 `static.directory`는 `dist`로 유지합니다. Sites 소스 helper로 B의 관리 소스 저장소를 준비한 뒤 현재 파일을 동기화하고 저장·배포합니다. GitHub에 push하는 것만으로 Sites가 배포되지는 않습니다.
4. B의 새 Site에서 별도 주소/접근 범위를 설정합니다. 원본 DaesanWINS 도메인·공개 범위·소유권은 B에게 자동 이전되지 않습니다.

원 계정 종속 항목은 Site ID, Sites의 관리 Git 저장소, 배포 버전·권한·URL·도메인·접속 정책입니다. 인증 토큰은 포함하지 않았습니다. 기존 project_id는 출처 문서에만 기록하고 활성 배포 설정에서는 제거했습니다. 새 ID를 설정한 이후에는 같은 ID를 유지하여 배포해야 합니다. `.openai/hosting.json`에는 비밀키를 넣지 않습니다.

일반 정적 호스팅을 쓰는 B는 `.openai` 설정 없이 `dist`를 배포하면 됩니다.

## 데이터·파일·외부 서비스 이전 범위

- DB, 스키마, 마이그레이션, 클라우드 파일 저장소, 로그인/결제/메시지 서버가 없습니다. 따라서 관련 덤프/초기 DB 생성은 필요하지 않습니다.
- 상담 입력은 현재 페이지의 메모리 상태에만 있으며 새로고침하면 초기화됩니다. 실제 고객 상담값은 Git에 포함하지 않았습니다.
- 다운로드한 발주서·엑셀·이미지 및 사용자의 OS 클립보드 내용은 소스로 이전되지 않습니다. 필요한 업무 자료는 담당자가 별도로 관리해야 합니다.
- 원본 Sites 계정의 배포 이력, 인증·접근 정책과 도메인 소유권은 이전 대상이 아닙니다.
- 브랜드·제품 이미지 5개는 원본 그대로 포함했습니다. [외부 코드와 이미지 안내](docs/THIRD_PARTY.md)를 확인하십시오.

## A의 수정 내용을 push하고 B가 pull하는 절차

**현재 자동 동기화는 구성되어 있지 않습니다.** 확인된 Sites 관리 원격은 `git.chatgpt-team.site`이며 이 GitHub 저장소와 별개입니다. 이번 작업은 검증된 소스 스냅샷을 GitHub에 올린 것입니다. 이 저장소에는 자동 연동 워크플로가 없고, 확인된 Sites 도구에도 이 GitHub 저장소로 자동 미러링하도록 연결한 설정이 없습니다. 이후 Sites 변경은 매번 실제 관리 소스를 가져와 **명시적으로 commit/push**해야 합니다.

A는 Sites의 실제 최신 관리 소스를 먼저 가져오고 게시 버전과 비교합니다. GitHub 작업본을 갱신한 후 최신 앱 파일을 `dist/`로 복사합니다. Sites 인증파일·원 계정 project_id·임시 상담 출력은 복사하지 않습니다. 제품 데이터는 앱 코드와 함께 복사됩니다.

```sh
git switch main
git pull --ff-only origin main
# 검증된 최신 Sites 프로젝트의 dist 파일들을 이 작업본 dist에 복사
node scripts/check.mjs
git add dist docs/source-provenance.json
git diff --cached
git commit -m "Update window ordering application from Sites"
git push origin main
```

B가 수정한 커밋이 먼저 올라왔으면 A는 복사하기 전에 pull하여 변경 내용을 확인합니다. 충돌은 담당자가 비교 후 해결하며 강제 push하지 않습니다. A가 `docs/source-provenance.json`의 날짜·버전·원본 커밋과 파일 해시도 갱신하면 검수에 도움이 됩니다.

B의 최신화 및 작업:

```sh
git switch main
git pull --ff-only origin main
node scripts/check.mjs
node scripts/serve.mjs
# 추가 수정을 시작할 때
git switch -c feature/my-change
```

B 작업본에 미커밋 수정이 있으면 먼저 별도 브랜치에 커밋하거나 보관한 뒤 pull합니다. `--ff-only`가 실패하면 강제로 덮어쓰지 말고 양쪽 커밋을 비교하여 병합합니다. GitHub 업로드와 각 계정 Sites 배포는 각각 수행하는 단계입니다.

## 검증과 제한

[docs/VALIDATION.md](docs/VALIDATION.md)에 이관 검증 결과를 기록합니다. 모바일 공유 대상에 카카오톡이 실제 나타나는지와 Microsoft Excel에서의 인쇄 결과는 각 사용 환경에서 최종 확인이 필요합니다. 검증용 상담값과 출력 파일은 저장소에 포함하지 않습니다.

GitHub는 비어 있는 저장소였으므로 `main`을 사용합니다. 원본 Sites 소스의 과거 Git 이력을 그대로 가져오지 않고 검증된 현재 파일을 초기 커밋으로 올립니다. 원본 출처 커밋은 추적 문서에 남기며 원본 사이트와 저장소의 이력은 보존합니다.

2026-10-20에 GitHub 인증을 완료하고 이 저장소의 main 브랜치에 전체 프로젝트 업로드를 완료했습니다. 이후 인증·수동 업로드 절차는 [GitHub 업로드 안내](docs/GITHUB_UPLOAD.md)를 참고하십시오.

