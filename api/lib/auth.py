import os
import jwt
import dotenv

dotenv.load_dotenv('.env.local')

def user_id_from_token(token: str):
    res = jwt.decode(token, os.getenv('JWT_PUBLIC_KEY'), algorithms="RS256")
    return res['sub']