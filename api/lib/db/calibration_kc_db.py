import uuid
import os
import psycopg2
import json


import dotenv
dotenv.load_dotenv('.env.development.local')

# Ensure the database is initialized before performing any operations

def get_db_connection():
    return psycopg2.connect(os.environ['POSTGRES_URL'])


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create tasks table if it doesn't exist
    cur.execute("""
        CREATE TABLE IF NOT EXISTS calibration_tasks (
            task_id UUID PRIMARY KEY,
            task_data TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            user_id VARCHAR(255),
            successful_simulation_count INT DEFAULT 0
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()


def generate_task_id():
    return str(uuid.uuid4())


def new_task(user_id=None):
    task_id = generate_task_id()
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO calibration_tasks (task_id, task_data, status, user_id, successful_simulation_count) VALUES (%s, %s, %s, %s, %s)",
        (task_id, json.dumps({}), 'pending', user_id, 0)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    return task_id

def get_task(task_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT task_data, status, user_id FROM calibration_tasks WHERE task_id = %s",
        (task_id,)
    )
    result = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if result:
        task_data = json.loads(result[0]) if result[0] else {}
        task_data['status'] = result[1]
        task_data['user_id'] = result[2]
        return task_data
    return None


def get_all_tasks(user_id=None):
    conn = get_db_connection()
    cur = conn.cursor()
    
    if user_id:
        cur.execute("SELECT task_id FROM calibration_tasks WHERE user_id = %s", (user_id,))
    else:
        cur.execute("SELECT task_id FROM calibration_tasks")
    tasks = [str(row[0]) for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    return tasks


def update_task(task_id, task_data):
    conn = get_db_connection()
    cur = conn.cursor()
    
    status = task_data.pop('status', 'pending')
    user_id = task_data.pop('user_id', None)
    successful_simulation_count = task_data.pop('successful_simulation_count', 0)
    
    cur.execute(
        "UPDATE calibration_tasks SET task_data = %s, status = %s, user_id = %s, successful_simulation_count = %s WHERE task_id = %s",
        (json.dumps(task_data), status, user_id, successful_simulation_count, task_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()



def reset_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS calibration_tasks")
    conn.commit()
    cur.close()
    conn.close()
    init_db()

if __name__ == "__main__":
    reset_db()
    
    all_tasks = get_all_tasks()
    print(all_tasks)

    if all_tasks:
        print(get_task(all_tasks[0]))
