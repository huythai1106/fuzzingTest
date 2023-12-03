import json
import time
from zapv2 import ZAPv2
import os.path

def spidering(zap, target):
    spider = zap.spider.scan(target)
    while int(zap.spider.status(spider)) < 100:
        print('Spider progress %: {}'.format(zap.spider.status(spider)))
        time.sleep(1)
    print('Spider has completed!')

    results = zap.spider.results()
    urls = []
    for url in results:
        urls.append(url)

    txt_file = os.path.join('./src/fuzzing/resources' , 'spiderUrl.txt')
    with open(txt_file, 'w') as f:
        for url in urls:
            f.write(url + "\n")