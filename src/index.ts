import HttpMessageManager from "./httpMessage/HTTPRequestManager"


const req =
`GET https://courses.uet.vnu.edu.vn/theme/yui_combo.php?3.17.2/event-mousewheel/event-mousewheel-min.js&3.17.2/event-resize/event-resize-min.js&3.17.2/event-hover/event-hover-min.js&3.17.2/event-touch/event-touch-min.js&3.17.2/event-move/event-move-min.js&3.17.2/event-flick/event-flick-min.js&3.17.2/event-valuechange/event-valuechange-min.js&3.17.2/event-tap/event-tap-min.js HTTP/1.1
host: courses.uet.vnu.edu.vn
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Referer: https://courses.uet.vnu.edu.vn/
Connection: keep-alive
Cookie: MoodleSession=2ob9k0fi6ltpqb9ubn0cmr4i1r
Sec-Fetch-Dest: script
Sec-Fetch-Mode: no-cors
Sec-Fetch-Site: same-origin


~~~
POST https://courses.uet.vnu.edu.vn/lib/ajax/service.php?sesskey=ojBBVrSB6C&info=media_videojs_get_language HTTP/1.1
host: courses.uet.vnu.edu.vn
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0
Accept: application/json, text/javascript, */*; q=0.01
Accept-Language: en-US,en;q=0.5
Referer: https://courses.uet.vnu.edu.vn/
Content-Type: application/json
X-Requested-With: XMLHttpRequest
Content-Length: 76
Origin: https://courses.uet.vnu.edu.vn
Connection: keep-alive
Cookie: MoodleSession=2ob9k0fi6ltpqb9ubn0cmr4i1r
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin

[{"index":0,"methodname":"media_videojs_get_language","args":{"lang":"en"}}]

~~~
POST /api/send-xml-data HTTP/1.1
Host: example.com
Content-Type: text/xml
Content-Length: 2048

<data>
  <item id="1">Item 1</item>
  <item id="2">Item 2</item>
</data>





~~~
`

const httpMessageManager = new HttpMessageManager(req, '~~~')
httpMessageManager.view()
console.log(httpMessageManager.getHTTPRequests().length)