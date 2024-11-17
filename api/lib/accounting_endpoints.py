from api.lib.db import accounting
from fastapi import Depends
from api.lib.security import security
from api.lib import auth
from fastapi.security import HTTPAuthorizationCredentials
from typing import Annotated

def get_accounting(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    token = credentials.credentials
    user_id = auth.user_id_from_token(token)
    return accounting.get_user_accounting(user_id)

