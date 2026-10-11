# 日日手帳（免登入版）

日曆蓋章、每日與一次性待辦、筆記資料夾、主題與夜晚模式、PNG 匯出。

## 資料保存

資料只存在同一網址的目前瀏覽器 localStorage，各訪客獨立，沒有帳號或雲端同步。清除網站資料會移除紀錄。請使用設定 → 備份與回收桶 → 下載完整 JSON 備份。

原私人網站紀錄可先匯出 JSON，再在這裡匯入。此程式不包含任何私人手帳紀錄。

## GitHub Pages

將此資料夾內容（包含 docs 與 src）上傳到儲存庫。在 Settings → Pages 選 Deploy from a branch，分支 main，資料夾 /docs，儲存即可。

docs 已含建置好的檔案，首次發布不需安裝。後續修改程式請執行 npm install、npm run build，將 dist 內容更新到 docs。
