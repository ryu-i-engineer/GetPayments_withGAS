/**
 * Get Rakuten card payment.
 * @returns {number} Rakuten card payment. or Error code
 */
function GetRakutenPayment() {
  const suffix = "[Get Rakuten card payment]";

  // Execute login
  let response = UrlFetchApp.fetch("https://grp01.id.rakuten.co.jp/rms/nid/login", {
    method: "post",
    payload: {
      u: cls_json.MailAddress,
      p: cls_json.RakutenPW,
      service_id: "f425",
      pp_version: "20170213",
      param: "login",
    },
    followRedirects: false,
  });
  let retCode = response.getResponseCode();
  console.log(suffix + "Execute Login Response code: " + retCode);

  if (retCode !== 302) {
    console.log(suffix + "[ERROR]Failed to login ");
    return -1;
  }

  // Redirect after login
  response = UrlFetchApp.fetch(response.getAllHeaders().Location, {
    method: "post",
    headers: {
      cookie: response.getAllHeaders()["Set-Cookie"],
      "user-agent": UserAgent,
    },
    payload: {
      param: "login",
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "Redirect login  Response code: " + retCode);

  if (retCode !== 302) {
    console.log(suffix + "[ERROR]Failed to redirect after login ");
    return -2;
  }

  // Get JSON data
  let cookies = response.getAllHeaders()["Set-Cookie"];
  for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].split(";")[0];
  }

  response = UrlFetchApp.fetch("https://www.rakuten-card.co.jp/e-navi/ajax/statement/chargedAmount", {
    method: "get",
    headers: {
      cookie: cookies[0] + ";" + cookies[1] + ";" + cookies[2] + ";" + cookies[3],
      "user-agent": UserAgent,
    },
    followRedirects: false,
  });
  retCode = response.getResponseCode();
  console.log(suffix + "Get JSON data Response code: " + retCode);

  if (retCode !== 200) {
    console.log(suffix + "[ERROR]Failed to get JSON data: ");
    return -3;
  }

  let paymentStr = JSON.parse(response.getContentText("UTF-8")).chargedAmount;
  paymentStr = paymentStr.replace(",", "");
  console.log(suffix + "payment : " + paymentStr);

  return parseInt(paymentStr);
}
