/** Get PiTaPa payment info.
 * @param {string} : String date formatted 'YYYYMM'
 * @returns {number} : PiTaPa payment or error code
 */
 function GetPiTaPaPayment(targetYYYYMM) {
  const suffix = "[Get PiTaPa payment]";
  const payload = {
    id: cls_json.PiTaPaId,
    password: cls_json.PiTaPaPW,
  };

  // Login
  let response = UrlFetchApp.fetch("https://www2.pitapa.com/member/login.do", {
    method: "POST",
    payload: payload,
    followRedirects: false,
  });
  let retCode = response.getResponseCode();
  console.log(suffix + "Login Response Code: " + retCode);

  if (retCode !== 302) {
    console.log(suffix + "[ERROR]Failed to login");
    return -1;
  }

  // show top page after login
  let cookies = response.getAllHeaders()["Set-Cookie"];
  for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].split(";")[0];
  }

  response = UrlFetchApp.fetch("https://www2.pitapa.com/member/top.do", {
    method: "GET",
    headers: {
      cookie: cookies[0] + ";" + cookies[1],
      "user-agent": UserAgent,
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "Show top page Response Code: " + retCode);

  if (retCode !== 200) {
    console.log(suffix + "[ERROR]Failed to access to top page");
    return -1;
  }

  response = UrlFetchApp.fetch("https://www2.pitapa.com/member/K120100.do", {
    method: "GET",
    headers: {
    cookie: response.getHeaders()["Set-Cookie"],
    "user-agent": UserAgent,
  },
    payload: payload,
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "Show Payment list page Response Code: " + retCode);

  if (retCode !== 200) {
    console.log(suffix + "[ERROR]Failed to access to payment list page");
    return -1;
  }

  response = UrlFetchApp.fetch("https://www2.pitapa.com/member/K120110.do", {
    method: "GET",
    headers: {
      cookie: response.getHeaders()["Set-Cookie"],
      "user-agent": UserAgent,
    },
    payload: {
      sn: response
        .getContentText()
        .match(/name="sn".*value="[A-Za-z0-9]+/)[0]
        .replace('name="sn" value="', ""),
      claimYM: targetYYYYMM,
      shokaibutton: "表示する",
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "Show payment page Response Code: " + retCode);

  if (retCode !== 200) {
    console.log(suffix + "[ERROR]Failed to access to payment page");
    return -1;
  }

  // output payment info
  let paymentInfo = response.getContentText().match(/<span class="s4">[0-9,]+<\/span>/);
  if (paymentInfo === null) {
    console.log(suffix + "There is no payment.");
    return 0;
  }
  paymentInfo = paymentInfo.replace('<span class="s4">', "");
  paymentInfo = paymentInfo.replace(",", "");
  paymentInfo = paymentInfo.replace("</span>", "");
  console.log(suffix + "payment : " + paymentInfo);

  return parseInt(paymentInfo);
}
