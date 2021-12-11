/**
 * Const parameters
 */
const cls_json = JSON.parse(DriveApp.getFileById("XXXXXXXX").getBlob().getDataAsString()); // Credentials which is saved on Google Drive.
const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36";
const contentType = "application/x-www-form-urlencoded";
const applicationType = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9";

/**
 * Get Salary info from freee.
 * @param {nowYYYYMM}: Date Format: YYYY/MM
 * @returns {number} Salary info.
 */
function getSalary(nowYYYYMM) {
  const suffix = "[getSalary]";

  const topURL = "https://p.secure.freee.co.jp/";

  // Access to Top page to get access token.
  let response = UrlFetchApp.fetch(topURL, {
    method: "GET",
    headers: {
      "Content-Type": contentType,
      Accept: applicationType,
      "user-agent": UserAgent,
    },
    followRedirects: false,
  });
  let retCode = response.getResponseCode();
  console.log(suffix + "[Access to Top page]retCode : " + retCode);

  if (retCode !== 302) {
    console.log(suffix + "[ERROR]Failed to access " + topURL);
    return -1;
  }

  // save "_p_session_id"
  let cookies = response.getAllHeaders()["Set-Cookie"];
  for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].split(";")[0];
  }

  const _p_session_id = cookies[1];

  const loginURL = "https://accounts.secure.freee.co.jp/login/hr";

  // Access to login page to get access token.
  response = UrlFetchApp.fetch(loginURL, {
    method: "GET",
    headers: {
      "Content-Type": contentType,
      Accept: applicationType,
      "user-agent": UserAgent,
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "[Access to login page] retCode : " + retCode);

  if (retCode !== 200) {
    console.log(suffix + "[ERROR]Failed to access " + loginURL);
    return -2;
  }

  // Scraping "cfs_token" from HTML.
  const cfs_token = response
    .getContentText()
    .match(/csrf-token" content=".*"/gm)[0]
    .replace(/csrf-token" content="/, "")
    .replace(/"/, "");

  cookies = response.getAllHeaders()["Set-Cookie"];
  let expandedCookie = "";
  for (let i = 0; i < cookies.length; i++) {
    expandedCookie += cookies[i].split(";")[0] + ";";
  }

  // Execute login
  response = UrlFetchApp.fetch(loginURL, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      Accept: applicationType,
      "user-agent": UserAgent,
      cookie: expandedCookie,
    },
    payload: {
      authenticity_token: cfs_token,
      email: cls_json.freeeId,
      password: cls_json.freeePW,
      hash: "",
      fp: Math.floor(new Date()),
      commit: "ログイン",
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "[Execute login]retCode : " + retCode);

  if (retCode !== 302) {
    console.log(suffix + "[ERROR]Failed to login.");
    return -1;
  }

  cookies = response.getAllHeaders()["Set-Cookie"];
  for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].split(";")[0];
  }

  const _auth_session_id = cookies[0];
  const _n_auth_session_id = cookies[1];

  expandedCookie = "";
  for (let i = 0; i < cookies.length; i++) {
    expandedCookie += cookies[i] + ";";
  }

  // redirect
  response = UrlFetchApp.fetch(response.getAllHeaders().Location, {
    method: "GET",
    headers: {
      "Content-Type": contentType,
      Accept: applicationType,
      "user-agent": UserAgent,
      cookie: _p_session_id + ";" + expandedCookie,
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "[Login redirect]retCode : " + retCode);

  if (retCode !== 302) {
    console.log(suffix + "Could not redirect.");
    return -2;
  }

  cookies = response.getAllHeaders()["Set-Cookie"];
  for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].split(";")[0];
  }

  // Pass authentication
  response = UrlFetchApp.fetch(response.getAllHeaders().Location, {
    method: "GET",
    headers: {
      "Content-Type": contentType,
      Accept: applicationType,
      "user-agent": UserAgent,
      cookie: _p_session_id + ";" + cookies + ";" + _n_auth_session_id + ";" + _auth_session_id,
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "[Access to p.secure.freee]retCode : " + retCode);

  if (retCode !== 200) {
    console.log(suffix + "Failed to access to 'p.secure.freee'");
    return -3;
  }

  cookies = response.getAllHeaders()["Set-Cookie"];
  expandedCookie = "";
  for (let i = 0; i < cookies.length; i++) {
    expandedCookie += cookies[i].split(";")[0] + ";";
  }

  headers = {
    cookie: expandedCookie + ";" + _auth_session_id + ";" + _n_auth_session_id,
    "user-agent": UserAgent,
  };

  // @ts-ignore
  options = {
    method: "GET",
    headers: headers,
    followRedirects: false,
  };

  // Get Json response
  response = UrlFetchApp.fetch("https://p.secure.freee.co.jp/api/p/185469/" + nowYYYYMM + "/payroll_statements/1301719", {
    method: "GET",
    headers: {
      cookie: expandedCookie + ";" + _auth_session_id + ";" + _n_auth_session_id,
      "user-agent": UserAgent,
      Accept: applicationType,
      "Content-Type": contentType,
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "[Get JSON]retCode : " + retCode);

  cookies = response.getAllHeaders()["Set-Cookie"];
  for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].split(";")[0];
  }

  __savePaymentPDF(nowYYYYMM, {
    cookie: _p_session_id + ";" + cookies + ";" + _n_auth_session_id + ";" + _auth_session_id,
    "user-agent": UserAgent,
  });

  const paymentStr = JSON.parse(response.getContentText("UTF-8")).employee_payroll_statement.total_amount;
  console.log(suffix + " Salary : " + paymentStr);

  return parseInt(paymentStr);
}

/**
 * get PDF file and save to Google Drive
 * @param {nowYYYYMM}: Date Format: YYYY/MM
 * @param {headers} : object
 * @returns nothing
 */
function __savePaymentPDF(nowYYYYMM, headers) {
  const response = UrlFetchApp.fetch("https://p.secure.freee.co.jp/pdf/payroll_statements/" + nowYYYYMM + "/employees/1301719.pdf", {
    contentType: "application/pdf",
    method: "GET",
    headers: headers,
    followRedirects: false,
  });

  const retCode = response.getResponseCode();
  console.log("[Save pdf file] Save pdf response. retCode : " + retCode);

  if (retCode !== 200) {
    console.log("[Save Salary PDF]Failed to access pdf page");
    return;
  }

  const pdfFile = DriveApp.getFolderById(cls_json.SalaryPDFDriveId).createFile(response);

  pdfFile.setName(Utilities.formatDate(new Date(), "Asia/Tokyo", "YYYYMMdd") + "_" + "給与.pdf");
}
