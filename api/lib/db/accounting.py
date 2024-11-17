import os
import psycopg2
import json
import dotenv

dotenv.load_dotenv('.env.development.local')

DEFAULT_SIMULATION_LIMIT = 1_000_000 # number of simulations per user

def get_db_connection():
    return psycopg2.connect(os.environ['POSTGRES_URL'])

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create user accounting table if it doesn't exist
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS user_accounting (
            user_id VARCHAR(255) PRIMARY KEY,
            total_simulations INT DEFAULT 0,
            simulation_limit INT DEFAULT {DEFAULT_SIMULATION_LIMIT},
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()

def get_user_accounting(user_id):
    conn = get_db_connection()
    cur = conn.cursor()    
    cur.execute(
        "SELECT total_simulations, simulation_limit FROM user_accounting WHERE user_id = %s",
        (user_id,)
    )

    result = cur.fetchone()

    if not result:
        create_user_accounting(user_id)
        result = cur.fetchone()
    cur.close()
    conn.close()


    return {
        'total_simulations': result[0],
        'simulation_limit': result[1],
        'remaining_simulations': result[1] - result[0]
    }

def create_user_accounting(user_id, simulation_limit=DEFAULT_SIMULATION_LIMIT):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO user_accounting (user_id, simulation_limit) VALUES (%s, %s) ON CONFLICT DO NOTHING",
        (user_id, simulation_limit)
    )
    
    conn.commit()
    cur.close()
    conn.close()

def update_simulation_count(user_id, simulation_count):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        """
        INSERT INTO user_accounting (user_id, total_simulations) 
        VALUES (%s, %s)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            total_simulations = user_accounting.total_simulations + %s,
            last_updated = CURRENT_TIMESTAMP
        """,
        (user_id, simulation_count, simulation_count)
    )
    
    conn.commit()
    cur.close()
    conn.close()

def update_simulation_limit(user_id, new_limit):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE user_accounting SET simulation_limit = %s WHERE user_id = %s",
        (new_limit, user_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()

def reset_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS user_accounting")
    conn.commit()
    cur.close()
    conn.close()
    init_db()

if __name__ == "__main__":
    reset_db()
