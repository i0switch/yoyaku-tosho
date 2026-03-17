/**
 * upload-to-drive.js
 * 
 * 生成された .pptx ファイルを Google Drive にアップロードする。
 * 同名ファイルがある場合は上書き(Update)して URL を維持する。
 */
const { google } = require('googleapis');
const fs = require('fs');
const { authorize } = require('./auth-drive');

// ★カスタマイズ: デフォルトのアップロード先フォルダIDを指定してください
const TARGET_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '';

async function uploadFile(authClient, filePath, fileName) {
    const drive = google.drive({ version: 'v3', auth: authClient });

    try {
        // 既存ファイルのチェック
        const res = await drive.files.list({
            q: `name='${fileName}' and '${TARGET_FOLDER_ID}' in parents and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const fileMetadata = { name: fileName };
        const media = {
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            body: fs.createReadStream(filePath)
        };

        if (res.data.files && res.data.files.length > 0) {
            // 既存ファイルを上書き更新
            const fileId = res.data.files[0].id;
            const updated = await drive.files.update({
                fileId: fileId,
                media: media,
                fields: 'id, webViewLink'
            });
            console.log(`✅ ${fileName} を上書き更新しました。 URL: ${updated.data.webViewLink}`);
            return updated.data;
        } else {
            // 新規アップロード
            if (TARGET_FOLDER_ID) {
                fileMetadata.parents = [TARGET_FOLDER_ID];
            }
            const created = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink'
            });
            console.log(`✅ ${fileName} を新規アップロードしました。 URL: ${created.data.webViewLink}`);
            return created.data;
        }
    } catch (error) {
        console.error('❌ Google Drive アップロードでエラーが発生しました:', error.message);
        throw error;
    }
}

module.exports = { uploadFile };
