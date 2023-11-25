#!/usr/bin/env python
import json
import time
from zapv2 import ZAPv2
import os.path

def writeRequests(results, txt_file):
    requests = []
    for item in results:
        request = {
            'requestHeader': item['requestHeader'],
            'requestBody': item.get('requestBody', '')
        }
        requests.append(request)

    with open(txt_file, 'w') as f:
        for request in requests:
            if request['requestBody'] == '':
                f.write(f"{request['requestHeader']}~~~\n")
            else:
                f.write(f"{request['requestHeader']}{request['requestBody']}\n~~~\n")


# The URL of the application to be tested
target = 'https://www.w3schools.com/python/python_conditions.asp'
# Change to match the API key set in ZAP, or use None if the API key is disabled
apiKey = None

# By default ZAP API client will connect to port 8080
zap = ZAPv2(apikey=apiKey)
# Use the line below if ZAP is not listening on port 8080, for example, if listening on port 8090

setNumBrow = zap.ajaxSpider.set_option_number_of_browsers(1)
setPath = zap.selenium.set_option_firefox_binary_path("C:/Program Files/Mozilla Firefox/firefox.exe")
print('Ajax Spider target {}'.format(target))
scanID = zap.ajaxSpider.scan(target)

timeout = time.time() + 30   # 2 minutes from now
# Loop until the ajax spider has finished or the timeout has exceeded
while zap.ajaxSpider.status == 'running':
    if time.time() > timeout:
        # zap.ajaxSpider.stop(apikey=apiKey);
        zap.core.shutdown(apikey=apiKey)

        break
    print('Ajax Spider status' + zap.ajaxSpider.status)
    time.sleep(2)

print('Ajax Spider completed')
ajaxResults = zap.ajaxSpider.results(start=0, count=zap.ajaxSpider.number_of_results)
print(zap.ajaxSpider.number_of_results)
txt_file = os.path.join('../fuzzing/resources' , 'rawRequests.txt')
writeRequests(ajaxResults, txt_file)
# If required perform additional operations with the Ajax Spider results


# TODO: Start scanning the application to find vulnerabilities