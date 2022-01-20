from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import time
import json

# hydrology imports
from hydrology.rffe import get_metric as get_rffe_metric

FRRE_OUTPUT_TYPE = 'json'


def zip_files(files):
    in_memory_zip = BytesIO()
    with ZipFile(in_memory_zip, 'w') as zf:
        with zf.open("1/1.json", 'w') as json_file:
            data = {'key': 1}
            data_bytes = json.dumps(data, ensure_ascii=False, indent=4).encode('utf-8')
            json_file.write(data_bytes)    

def rffe_info(**kwargs):

    if 'catchment_name' in kwargs:
        catchment_name = kwargs['catchment_name']
    else:
        catchment_name = ''

    download_name = f"rffe_{catchment_name}.{FRRE_OUTPUT_TYPE}"
    
    response_header = {'Content-Disposition': f'attachment; filename={download_name}'}
    response = get_rffe_metric(type='json', **kwargs)
    return response, 200, response_header



