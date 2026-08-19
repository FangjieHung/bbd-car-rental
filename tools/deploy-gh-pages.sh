#!/usr/bin/env bash
# 把三個 app 一起發布到 GitHub Pages 的同一個站：
#   /bbd-car-rental/            admin（車行後台）
#   /bbd-car-rental/booking/    消費者訂車
#   /bbd-car-rental/affiliate/  民宿代訂
#
# 為什麼需要這支腳本而不是直接 npx angular-cli-ghpages：
# GitHub Pages 的專案站「只認根目錄的 404.html」，子目錄自己的 404 不會被採用。
# 三個 app 都是 SPA，深層網址（/booking/search、/affiliate/p/xxx/search）重整時
# 一律會落到根目錄的 404.html。若那份 404 是 admin 的 index，重整就會載入錯的 app。
# 這裡的根 404.html 會判斷路徑屬於哪個 app、把原始路徑編進 query 再導向該 app，
# 各 app 的 index.html 開頭再把路徑還原回去 —— 使用者看到的網址與重整前一致。
#
# 用法：bash tools/deploy-gh-pages.sh
set -euo pipefail

REPO_PATH="/bbd-car-rental"
OUT="dist/gh-pages"

cd "$(dirname "$0")/.."
unset NX_WORKSPACE_ROOT_PATH || true

echo "==> 建置三個 app（各自的 base href）"
npx nx build admin      --base-href "${REPO_PATH}/"
npx nx build booking    --base-href "${REPO_PATH}/booking/"
npx nx build affiliate  --base-href "${REPO_PATH}/affiliate/"

echo "==> 組合發布目錄 ${OUT}"
rm -rf "$OUT"
mkdir -p "$OUT"
cp -R dist/penghu-rental-admin/browser/. "$OUT/"
mkdir -p "$OUT/booking" "$OUT/affiliate"
cp -R dist/apps/booking/browser/.   "$OUT/booking/"
cp -R dist/apps/affiliate/browser/. "$OUT/affiliate/"

# Jekyll 會吃掉底線開頭的檔案，Angular 的產物不該被處理
touch "$OUT/.nojekyll"

echo "==> 注入路徑還原片段到各 app 的 index.html"
# 讀回 404.html 編碼進 query 的原始路徑，在 Angular 啟動前用 replaceState 還原。
RESTORE='<script>(function(l){if(l.search.charAt(1)==="/"){var d=l.search.slice(1).split("&").map(function(s){return s.replace(/~and~/g,"&")}).join("?");window.history.replaceState(null,"",l.pathname.slice(0,-1)+d+l.hash)}})(window.location)</script>'
for f in "$OUT/index.html" "$OUT/booking/index.html" "$OUT/affiliate/index.html"; do
  python3 - "$f" "$RESTORE" <<'PY'
import sys, pathlib
path, snippet = pathlib.Path(sys.argv[1]), sys.argv[2]
html = path.read_text()
assert '<head>' in html, f'{path} 沒有 <head>，無法注入'
path.write_text(html.replace('<head>', '<head>' + snippet, 1))
PY
done

echo "==> 產生根目錄 404.html（判斷 app 並保留原始路徑）"
cat > "$OUT/404.html" <<'HTML'
<!doctype html>
<meta charset="utf-8">
<title>轉向中…</title>
<script>
  // GitHub Pages 專案站只會用根目錄這一份 404。判斷路徑屬於哪個 app，
  // 把剩餘路徑編進 query 後導向該 app 的 index，由 index 的還原片段接手。
  (function (l) {
    var apps = ['booking', 'affiliate'];
    var segs = l.pathname.split('/').filter(Boolean);      // ['bbd-car-rental','booking','search']
    var keep = (segs.length > 1 && apps.indexOf(segs[1]) !== -1) ? 2 : 1;
    var base = '/' + segs.slice(0, keep).join('/') + '/';
    var rest = segs.slice(keep).join('/');
    var q = l.search.slice(1);
    l.replace(base + '?/' + rest + (q ? '&' + q.replace(/&/g, '~and~') : '') + l.hash);
  })(window.location);
</script>
HTML

if [ "${SKIP_PUBLISH:-}" = "1" ]; then
  echo "==> SKIP_PUBLISH=1，只組裝不發布。產物在 ${OUT}"
  exit 0
fi

echo "==> 發布到 gh-pages 分支"
# --no-notfound：工具預設會用 index.html 覆蓋一份 404.html，那會蓋掉上面的導向器
npx angular-cli-ghpages --dir="$OUT" --no-silent --no-notfound

echo "==> 完成：https://fangjiehung.github.io${REPO_PATH}/"
