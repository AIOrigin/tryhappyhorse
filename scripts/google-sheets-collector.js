/**
 * HappyHorse Lead Magnet — Google Sheets Email Collector
 *
 * 部署步骤：
 * 1. 打开 Google Sheets，新建一个表格，命名为 "HappyHorse Leads"
 * 2. 在第一行写入表头：A1=email, B1=timestamp, C1=source
 * 3. 点击 扩展程序 → Apps Script
 * 4. 删除默认代码，粘贴下面的代码
 * 5. 点击 部署 → 新建部署
 * 6. 类型选 "网页应用"
 * 7. 执行身份选 "我自己"，访问权限选 "任何人"
 * 8. 点击部署，复制生成的 URL
 * 9. 把 URL 填入 site-copy.ts 的 leadMagnet.formAction
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    var email = data.email || '';
    var source = data.source || 'tryhappyhorse.xyz';
    var timestamp = new Date().toISOString();

    if (!email || !email.includes('@')) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Invalid email' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 去重检查
    var existingEmails = sheet.getRange('A:A').getValues().flat();
    if (existingEmails.includes(email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Already subscribed' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([email, timestamp, source]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'HappyHorse Lead Collector' }))
    .setMimeType(ContentService.MimeType.JSON);
}
