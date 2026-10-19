# GitHub 인증과 수동 업로드

2026-10-20에 `https://github.com/idnnatee-cyber/wins.git`을 확인했을 때 기존 커밋/브랜치가 없는 빈 저장소였습니다. 로컬 `main` 커밋까지 준비했으나 push는 GitHub 인증 부재로 실패했습니다. 이후 2026-10-20에 사용자가 브라우저 인증을 완료하여 main에 정상 업로드했습니다. 아래 명령은 재인증이나 다른 PC에서 업로드할 때 참고용입니다. 원본 Sites 인증은 GitHub 쓰기 권한으로 사용할 수 없습니다.

## 이 작업을 수행한 PC에서 이어서 push

Git for Windows / Git Credential Manager가 있는 터미널에서 아래를 실행하고 브라우저 로그인을 완료합니다. 로그인 계정은 해당 저장소의 소유자 또는 쓰기 권한이 있는 협업자여야 합니다. 암호·토큰을 코드/문서에 기재하지 마십시오.

```powershell
git credential-manager github login --username idnnatee-cyber
git -C 'C:\Users\DS KCL\.codex\visualizations\2026\10\07\01a114df-c773-7b90-8ca9-2af6c3372708\github-wins-handoff' push -u origin main
```

명령이 없으면 Git Credential Manager가 포함된 Git for Windows를 준비하거나 GitHub CLI의 `gh auth login`으로 Git HTTPS 인증을 연결하십시오. 조직 저장소라면 협업 권한/조직 SSO도 승인해야 합니다. push가 rejected되면 강제 push하지 말고 원격 브랜치와 변경 내용을 확인하십시오.

## ZIP만 받은 PC에서 업로드

ZIP에는 `.git` 인증 설정/이력은 없고 프로젝트 파일 전체가 들어 있습니다. 아래 `PROJECT.zip`은 받은 ZIP의 실제 경로로 바꿉니다. 새 `wins-upload` 폴더에서 시작합니다. 기존 폴더를 덮어쓰지 마십시오.

```powershell
git credential-manager github login --username idnnatee-cyber
Expand-Archive -LiteralPath '.\PROJECT.zip' -DestinationPath '.\wins-upload'
Set-Location '.\wins-upload'
git init -b main
git remote add origin https://github.com/idnnatee-cyber/wins.git
$existingHeads = git ls-remote --heads origin
if ($LASTEXITCODE -ne 0) { throw 'GitHub 접근 권한을 먼저 확인하세요.' }
if ($existingHeads) { throw '원격에 기존 브랜치가 생겼습니다. 아래 별도 인계 브랜치 절차를 사용하세요.' }
node scripts/check.mjs
git add .
git -c user.name='Daesan Source Handoff' -c user.email='idnnatee-cyber@users.noreply.github.com' commit -m 'Import verified DaesanWINS source'
git push -u origin main
```

이 경우 새 로컬 커밋 ID가 생성됩니다. 소스 내용과 출처 해시는 보존됩니다. 원래 이관 작업의 커밋 ID를 그대로 사용하려면 위의 기존 PC 작업본에서 push하십시오.

## 원격에 기존 프로젝트가 생긴 경우

기존 원격을 clone하고 `handoff/daesanwins-20261020` 같은 새 브랜치를 만듭니다. ZIP을 별도 폴더에 풀어 파일을 검토한 뒤, 새 브랜치의 `daesanwins-handoff/` 하위 폴더에 복사하여 기존 파일을 덮어쓰지 않습니다. 검증 후 commit하고 `git push -u origin handoff/daesanwins-20261020`으로 올립니다. 이관 브랜치 병합은 저장소 담당자와 조율합니다. 강제 push나 기존 브랜치 삭제는 필요하지 않습니다.

GitHub 업로드는 원본 Sites를 배포/삭제하거나 도메인을 이전하는 작업이 아닙니다. 현재 Sites↔GitHub 자동 동기화는 없으며 이후에도 명시적으로 commit/push해야 합니다.
