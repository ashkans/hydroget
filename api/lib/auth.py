import os
import jwt
import dotenv

dotenv.load_dotenv('.env.local')

def user_id_from_token(token: str):
    public_key = os.getenv('JWT_PUBLIC_KEY')
    if not public_key:
        raise Exception('JWT_PUBLIC_KEY is not set')
    try:
        res = jwt.decode(token, public_key, algorithms="RS256")
    except jwt.exceptions.InvalidSignatureError:
        raise Exception('Invalid token signature')
    except jwt.exceptions.InvalidTokenError:
        raise Exception('Invalid token')
    return res['sub']