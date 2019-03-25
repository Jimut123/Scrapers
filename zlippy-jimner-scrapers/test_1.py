# custom made scraper to scrap http://patorjk.com/software/taag/#p=testall&h=0&v=0&f=Old%20Banner&t=%3F

from selenium import webdriver
from bs4 import BeautifulSoup
import json

profile = webdriver.FirefoxProfile()
profile.set_preference("general.useragent.override", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0")
driver = webdriver.Firefox(profile)
url= "http://patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20"
driver.maximize_window()
driver.get(url)

content = driver.page_source.encode('utf-8').strip()
soup = BeautifulSoup(content,"html.parser")
price=soup.find("select",{"id":"fontList"})
options = price.find_all("option")
options1=[y.text for y in options]
values = [o.get("value") for o in options]

get_values = {}
try:
    for x in range(657):
        get_values[str(options1[x])] = str(values[x])
        print (options1[x], values[x])
        #print(get_values)
except:
    print(get_values)
    #parsed = json.loads(str(get_values))
    with open('data.json', 'w') as outfile:
        json.dump(get_values, outfile,indent=4,sort_keys=True)

driver.quit()