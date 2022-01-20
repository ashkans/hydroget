from pathlib import Path
from os import environ

if 'BASEPATH' in environ:
    BASEPATH = Path(environ['environ'])
else:
    BASEPATH = Path('.')