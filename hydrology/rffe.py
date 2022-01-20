import requests
from bs4 import BeautifulSoup
from pathlib import Path

RFFE_URL = 'https://rffe.arr-software.org/'
METRIC_JSON_URL = 'https://rffe.arr-software.org/download-json'
DEFAULT_HEADER = {
'authority': 'rffe.arr-software.org',
'pragma':'no-cache',
'cache-control': 'no-cache',
'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
'sec-ch-ua-mobile':'?0',
'sec-ch-ua-platform': '"Windows"',
'upgrade-insecure-requests':'1',
'origin': 'https://rffe.arr-software.org',
'content-type': 'application/x-www-form-urlencoded',
'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
'sec-fetch-site': 'same-origin',
'sec-fetch-mode':'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'referer': 'https://rffe.arr-software.org/',
'accept-language': 'en-US,en;q=0.9,fa;q=0.8',
}
SUBMIT_DATA_RAW_TEMP = 'catchment_name={catchment_name}&lato={lato}&lono={lono}&latc={latc}&lonc={lonc}&area={area}&region={region}&i2_6h={i2_6h}&i50_6h={i50_6h}'
JSON_DATA_RAW_TEMP = 'fpath=%2Fvar%2Fwww%2Freef%2Freef%2Fout%2F{type}%2F{code}.{type}'
COMPPRESED=True


def get_html(lato = -33.8783,
            lono = 150.7683,
            latc = -33.9607,
            lonc = 149.752,
            area = 88,
            region = 0,
            i2_6h = 0,
            i50_6h = 0,
            catchment_name='Catchment1'
            ):
    """A function to submit information to rffe website and recieve the html. This will be used to find the hash code to download the json/txt file later.

    Args:
        lato (float, optional): [latitude of the catchment outlet]. Defaults to -33.8783.
        lono (float, optional): [longitude of the catchment outlet]. Defaults to 150.7683.
        latc (float, optional): [latitude of the catchment centeriod]. Defaults to -33.9607.
        lonc (float, optional): [longitude of the catchment centriod]. Defaults to 149.752.
        area (int, optional): [catchment area]. Defaults to 88.
        region (int, optional): [????]. Defaults to 0.
        i2_6h (int, optional): [????]. Defaults to 0.
        i50_6h (int, optional): [????]. Defaults to 0.
        catchment_name (str, optional): [Catchment name]. Defaults to 'Catchment1'.

    Returns:
        [string]: [The html response of rffe website.]
    """    

    f = dict(lato = lato,
    lono = lono,
    latc = latc,
    lonc = lonc,
    area = area,
    region = region,
    i2_6h = i2_6h,
    i50_6h = i50_6h,
    catchment_name = catchment_name)

    #TODO: a sanity check on f should be done here!
    region = int(region) # region should be integer

    raw_data = SUBMIT_DATA_RAW_TEMP.format(**f)
    
    html = requests.post(RFFE_URL, data = raw_data, headers=DEFAULT_HEADER).text.replace('--!>', '-->')
    return html


def find_code(html):
    """Gets the html response of the rffe website and find the hash code within that. This code then will be used to download the json/txt formated information of a catchment.

    Args:
        html (string): this is the output of get_html function.

    Returns:
        string: the hash code which will be used to download the json/txt file.
    """    
    soup = BeautifulSoup(html, 'html.parser')
    for btn in soup.find_all('button'):
        btn_value = btn.get("value")
        btn_name = btn.get("name")
        if btn_value:
            if '/var/www/reef/reef/out/' in btn_value and btn_name == "fpath":
                code = Path(btn_value).stem
                return code       

def html_to_metric(code, type='json'):
    """[summary]

    Args:
        code ([type]): [description]
        type (str, optional): [description]. Defaults to 'json'.

    Returns:
        [type]: [description]
    """    
    f = dict(code=code, type=type)
    response = requests.post(METRIC_JSON_URL, data = JSON_DATA_RAW_TEMP.format(**f), headers=DEFAULT_HEADER)
    
    if type == 'json':
        return response.json()
    if type == 'text':
        return response.text

def get_metric(type='json', **get_html_kwargs):
    """[summary]

    Args:
        type (str, optional): [description]. Defaults to 'json'.

    Returns:
        [type]: [description]
    """    
    html = get_html(**get_html_kwargs)
    code = find_code(html)
    return html_to_metric(code)

  



if __name__ == '__main__':
    d = dict(lato = -33.8783,
            lono = 150.7683,
            latc = -33.9607,
            lonc = 149.752,
            area = 88,
            region = 0,
            i2_6h = 0,
            i50_6h = 0,
            catchment_name='Catchment1')    
    metric = get_metric(d)
    print(metric)

            
