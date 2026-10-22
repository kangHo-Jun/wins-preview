# 창호 견적도우미 Wins 인계

최근 갱신: 2026-10-22

## 최근 진행
- 2026-10-22 비교용 배포 요청: 로컬 신규 브랜치 preview/daesan-window-helper에 변경을 준비했다. main과 기존 wins.daesan.ai는 변경하지 않는다. scripts/check.mjs 및 git diff --check 통과.
- GitHub CLI와 커넥터 계정은 kangHo-Jun. 원격 idnnatee-cyber/wins의 API 권한 확인 결과 pull=true, push=false, admin=false이며 has_pages=false. 따라서 원격 푸시/Pages 생성은 수행하지 못했다.
- 2026-10-22 헤더 D 아이콘을 사용자가 제공한 대산 캐릭터로 교체. 원본 PNG를 dist/daesan-character.png로 복사하고 CSS 표시 영역으로 안전모·얼굴을 중심 배치했다. 원본 파일은 수정하지 않았다. 헤더 이름/홈 접근성 이름/브라우저 제목을 대산 창호도우미로 통일했다.
- 2026-10-22 사용자 선택에 따라 2안 대산 카탈로그 스타일로 확정. 초기 HTML을 대산 테마로 설정하고 시안 전환 UI/JS/CSS를 제거했다. 기존 theme 쿼리로 접속해도 대산 스타일로 표시된다.
- 2026-10-22 IKEA 방식의 선택 창호 중심 플래너 구현. 왼쪽 목록, 중앙 확대 도식, 오른쪽 제품/치수/색상/유리/핸들 편집 구조. 창호 복제, 예시 입력, 도식 확대, 전체 사양 검토를 제공한다.
- 1안 IKEA 색상(파랑/노랑), 2안 대산 카탈로그 색상(짙은 녹색/연녹색)을 상단 버튼으로 전환한다. URL은 `?theme=ikea`, `?theme=daesan`. 변경 파일은 dist/index.html, dist/app.js, 신규 dist/planner.css.
- 검증: scripts/check.mjs 통과, 브라우저 치수 3200→3000 변경/시안 전환 데이터 유지/창호 복제/전체 사양 렌더링/실제 XLSX 다운로드 확인. 390px 모바일에서 문서 너비 390px 확인 및 화면 검토, 브라우저 오류 로그 없음.
- 미리보기 http://127.0.0.1:4173 (node scripts/serve.mjs). 로컬 변경만 완료했으며 커밋/푸시/배포는 하지 않았다. 입력 데이터는 메모리에만 유지되며 새로고침 시 초기화된다.
- 2026-10-22 기능 검토: 현장·공사 조건 입력 → 창호 항목 추가 → 제품/모델·형태/치수·색상/구성·유리·핸들 선택 → 전체 사양 확인 흐름. SVG 도식과 상담 요약 복사/공유, XLSX/JPG 사양서 저장을 지원한다. 자동 가격 산출·고객상담 이력 저장·다중 사용자 동기화·ERP 연결은 확인되지 않았다. 상담/발주 정보 정리 도구로는 유용하지만 금액 견적 시스템은 아니다.
- 사용자가 지정한 GitHub 저장소 `https://github.com/idnnatee-cyber/wins`를 이 폴더에 최초 clone했다. 원격 `origin`은 해당 저장소이며 현재 `main` 브랜치가 `origin/main`을 추적한다.
- 내려받은 기준 커밋: `67dc892` (`Record successful GitHub handoff after authentication`, 2026-10-20).
- clone 직후 작업 트리는 깨끗했다. 이 인계 문서는 로컬 체크아웃 상태를 기록하려고 새로 추가했으며, 원격에 커밋하지 않았다.

## 미해결
- 비교용 배포는 저장소 권한 대기. 소유자가 kangHo-Jun에 쓰기 권한을 부여하고 Pages 설정을 직접 수행하거나, Pages 설정 가능한 관리자 권한이 있는 계정으로 연결해야 한다. 대안으로 사용자 승인 후 본인 계정의 별도 저장소에 배포할 수 있다.
- 로컬 실행 및 주요 UI 동작 검증 완료. 삭제 확인 대화상자는 브라우저 자동화 타임아웃으로 완료 검증하지 못했다. JPG 저장은 이번 변경 후 재검증하지 않았다.
- `wins.daesan.ai` 사용자 도메인과 HTTPS 연결은 별도 단계로 확인이 필요하다. DNS 설정은 2026-10-20에 등록됐지만 당시 HTTPS 인증서가 준비되지 않은 상태였다.

## 다음
- 대산 카탈로그 스타일을 기준으로 후속 개선을 진행한다.
- 필요 시 상담 저장 기능 및 가격 산출을 별도로 구현한다.
- 사용자가 요청하면 로컬 실행 및 `wins.daesan.ai` HTTPS 연결 상태를 재검증한다.

## Separate preview deployment — 2026-10-22
- User approved deployment to their own account. Created public repository https://github.com/kangHo-Jun/wins-preview and added remote `preview`.
- Pushed branch `preview/daesan-window-helper`; workflow `.github/workflows/pages.yml` deploys `dist/` automatically on pushes to that branch.
- Pages deployment succeeded: https://kangho-jun.github.io/wins-preview/ . Verified live browser title and configuration UI. The github-pages environment explicitly allows this branch.
- Original repository and DNS unchanged. Original main remains 67dc892004d7ae7fe0e12502bf502ad93f7dba1a. Original-repository permission blocker is bypassed through this user-approved separate repository.
- Future updates: commit on preview/daesan-window-helper and push to preview remote. Never push these changes to origin/main without a new user instruction.
