"""
SimulationDB Class - Database operations for RORB simulations

Functions:
    Database Connection:
        - get_db_connection() -> psycopg2.connection: Get database connection
        - init_db(): Initialize database tables
        - reset_db(): Reset database to initial state

    Single Simulation Operations:
        - add_simulation_to_local_queue(storm_data, catg_data, kc, m, initial_loss, continuous_loss, user_id=None, task_id=None) -> str: Add single simulation
        - get_simulation(simulation_id) -> dict: Get simulation details
        - get_simulation_by_task_id(task_id) -> dict: Get simulation by task ID
        - get_simulation_by_user_id(user_id) -> list: Get simulations by user ID


    Bulk Operations:
        - insert_simulations(simulations_data) -> list: Bulk insert multiple simulations
        - queue_simulation(storm_data, catg_data, kc, m, initial_loss, continuous_loss, user_id=None, task_id=None): Queue simulation for bulk insert
        - commit_local_simulations() -> list: Commit all queued simulations
        - queue_update(simulation_id, status, result=None): Queue simulation update
        - commit_local_updates(): Commit all queued updates

    Queue Management:
        - get_pending_simulations(chunk_size=None) -> list: Get pending simulation IDs
        - clean_expired_tasks(): Clean up expired simulations
"""

import uuid
import os
import psycopg2
import json
from datetime import datetime, timedelta, timezone

import dotenv
dotenv.load_dotenv('.env.development.local')

EXPIRATION_TIME = timedelta(minutes=1)

class SimulationDB:
    def __init__(self):
        self.pending_simulations = []
        self.pending_updates = []
        
    def get_db_connection(self):
        return psycopg2.connect(os.environ['POSTGRES_URL'])

    def reset_db(self):
        conn = self.get_db_connection()
        cur = conn.cursor()
        cur.execute("DROP TABLE IF EXISTS simulations_queue")
        conn.commit()
        cur.close()
        conn.close()
        self.init_db()


    def __repr__(self):
        return f"SimulationDB(pending_simulations={len(self.pending_simulations)}, pending_updates={len(self.pending_updates)})"

    def init_db(self):
        conn = self.get_db_connection()
        cur = conn.cursor()
        
        # Create simulations table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS simulations_queue (
                id UUID PRIMARY KEY,
                storm_data TEXT,
                catg_data TEXT,
                kc FLOAT,
                initial_loss FLOAT,
                m FLOAT,
                continuous_loss FLOAT,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                user_id VARCHAR(255),
                task_id VARCHAR(255),
                result TEXT,
                submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMPTZ NOT NULL
            )
        """)
        
        conn.commit()
        cur.close()
        conn.close()

    def _get_simulation_dict(self, result):
        """Helper function to convert DB result to simulation dict"""
        if not result:
            return None
        return {
            'storm_data': result[0],
            'catg_data': result[1],
            'kc': result[2],
            'initial_loss': result[3],
            'm': result[4],
            'continuous_loss': result[5],
            'status': result[6],
            'user_id': result[7],
            'task_id': result[8],
            'result': result[9],
            'submitted_at': result[10],
            'expires_at': result[11]
        }
    
    def _execute_query(self, query, params, single_result=False):
        """Helper function to execute a query and return simulation data."""
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            cur.execute(query, params)
            if single_result:
                result = cur.fetchone()
                return self._get_simulation_dict(result)
            else:
                results = cur.fetchall()
                return [self._get_simulation_dict(row) for row in results]
        except Exception as e:
            print(f"Error executing query: {e}")
        finally:
            cur.close()
            conn.close()
        return None if single_result else []

    # Retrieval functions
    def get_simulation_by_id(self, simulation_id):
        """Get simulation by ID using the unified query function."""
        query = """SELECT storm_data, catg_data, kc, initial_loss, m, continuous_loss,
                status, user_id, task_id, result, submitted_at, expires_at 
                FROM simulations_queue WHERE id = %s"""
        return self._execute_query(query, (simulation_id,), single_result=True)

    def get_simulations_by_task_id(self, task_id, status=None, chunk_size=None):
        """Get simulation by task ID using the unified query function."""
        params = [task_id]
        query = """SELECT storm_data, catg_data, kc, initial_loss, m, continuous_loss,
                status, user_id, task_id, result, submitted_at, expires_at 
                FROM simulations_queue WHERE task_id = %s"""
        if status:
            query += " AND status = %s"
            params.append(status)
        if chunk_size:
            query += " LIMIT %s"
            params.append(chunk_size)
        return self._execute_query(query, tuple(params))

    def update_simulation_status(self, simulations, status):
        """Update the status of a list of simulations"""
        for sim in simulations:
            self.queue_update(sim['id'], status)
        self.commit_local_updates()
    

    def get_simulations_by_user_id(self, user_id):
        """Get all simulations for a given user ID."""
        query = """SELECT storm_data, catg_data, kc, initial_loss, m, continuous_loss,
                status, user_id, task_id, result, submitted_at, expires_at 
                FROM simulations_queue WHERE user_id = %s"""
        return self._execute_query(query, (user_id,))

    def get_simulations_by_status(self, status, chunk_size=None):
        """Get simulations filtered by status."""
        query = """SELECT storm_data, catg_data, kc, initial_loss, m, continuous_loss,
                status, user_id, task_id, result, submitted_at, expires_at 
                FROM simulations_queue WHERE status = %s"""
        params = [status]
        if chunk_size:
            query += " LIMIT %s"
            params.append(chunk_size)
        return self._execute_query(query, tuple(params))

    def get_all_simulations(self, chunk_size=None):
        """Get all simulations"""
        query = """SELECT storm_data, catg_data, kc, initial_loss, m, continuous_loss,
                status, user_id, task_id, result, submitted_at, expires_at
                FROM simulations_queue"""
        if chunk_size:
            query += " LIMIT %s"
            return self._execute_query(query, (chunk_size,))
        return self._execute_query(query, ())
   
    # Queue functions
    def queue_simulation(self, storm_data, catg_data, kc, m, initial_loss, continuous_loss, user_id=None, task_id=None):
        """Add a simulation to the pending queue without inserting to database"""
        expires_at = (datetime.now(timezone.utc) + EXPIRATION_TIME)
        self.pending_simulations.append((storm_data, catg_data, kc, m, initial_loss, continuous_loss, user_id, task_id, expires_at))


    def commit_local_simulations(self):
        """Insert all pending simulations into database at once"""
        if not self.pending_simulations:
            return []
            
        simulation_ids = self.insert_simulations(self.pending_simulations)
        self.pending_simulations = []  # Clear the pending queue
        return simulation_ids
    

    def insert_simulations(self, simulations_data):
        """Bulk insert simulations into the database"""
        conn = self.get_db_connection()
        cur = conn.cursor()
        
        simulation_ids = []
        for simulation in simulations_data:
            simulation_id = str(uuid.uuid4())
            cur.execute(
                """INSERT INTO simulations_queue 
                (id, storm_data, catg_data, kc, m, initial_loss, continuous_loss, user_id, task_id, status, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s)""",
                (simulation_id, *simulation)
            )
            simulation_ids.append(simulation_id)
        
        conn.commit()
        cur.close()
        conn.close()
        return simulation_ids


    # Update functions
    def queue_update(self, simulation_id, status, result=None):
        """Add a simulation update to the pending queue"""
        self.pending_updates.append((simulation_id, status, result))

    def commit_local_updates(self):
        """Commit all pending updates to database at once"""
        if not self.pending_updates:
            return
            
        conn = self.get_db_connection()
        cur = conn.cursor()
        
        cur.executemany(
            "UPDATE simulations_queue SET status = %s, result = %s WHERE id = %s",
            [(status, result, sim_id) for sim_id, status, result in self.pending_updates]
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        self.pending_updates = []  # Clear the pending updates


    # Cleanup functions
    def mark_expired_tasks(self):
        """Mark expired pending tasks as 'expired'"""
        conn = self.get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            """UPDATE simulations_queue 
               SET status = 'expired' 
               WHERE expires_at <= CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"""
        )
        
        conn.commit()
        cur.close()
        conn.close()

    def clean_expired_tasks(self):
        """Remove tasks that have expired from the queue"""
        conn = self.get_db_connection()
        cur = conn.cursor()
        
        # Delete all expired tasks regardless of status
        cur.execute(
            """DELETE FROM simulations_queue 
            WHERE expires_at <= CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"""
        )
        
        conn.commit()
        cur.close()
        conn.close()

if __name__ == "__main__":
    db = SimulationDB()
    print("\n=== Testing SimulationDB Operations ===")
    
    print("\n1. Adding simulations to queue...")
    db.queue_simulation('storm_data', 'catg_data', 1.0, 1.0, 1.0, 1.0, 'user_id', 'task_id')
    db.queue_simulation('storm_data2', 'catg_data2', 2.0, 2.0, 2.0, 2.0, 'user_id2', 'task_id2')
    print(f"Queue status after adding: {db}")

    print("\n2. Committing simulations to database...")
    simulation_ids = db.commit_local_simulations()
    print(f"Queue status after commit: {db}")
    print(f"Created simulation IDs: {simulation_ids}")

    print("\n3. Testing simulation status update...")
    print("Updating first simulation status to 'completed'")
    db.queue_update(simulation_ids[0], 'completed', 'result')
    db.commit_local_updates()
    print(f"Queue status after update commit: {db}")

    print("\n4. Testing cleanup and retrieval operations...")
    print("Cleaning expired tasks...")
    db.clean_expired_tasks()
    print(f"Database status after cleanup: {db}")

    print("\n5. Retrieving simulation details:")
    simulation = db.get_simulation_by_id(simulation_ids[0])
    # Convert datetime objects to strings before JSON serialization
    def format_simulation_dates(sim):
        if sim:
            sim['submitted_at'] = sim['submitted_at'].isoformat() if sim['submitted_at'] else None
            sim['expires_at'] = sim['expires_at'].isoformat() if sim['expires_at'] else None
        return sim

    format_simulation_dates(simulation)
    print(f"First simulation details: {json.dumps(simulation, indent=2)}")

    print("\n6. Retrieving simulations by status:")
    pending_sims = [format_simulation_dates(sim) for sim in db.get_simulations_by_status('pending', chunk_size=1)]
    print(f"Pending simulations (limit 1): {json.dumps(pending_sims, indent=2)}")
    
    completed_sims = [format_simulation_dates(sim) for sim in db.get_simulations_by_status('completed', chunk_size=1)]
    print(f"Completed simulations (limit 1): {json.dumps(completed_sims, indent=2)}")

    print("\n7. Retrieving all simulations:")
    all_sims = [format_simulation_dates(sim) for sim in db.get_all_simulations(chunk_size=10)]
    print(f"All simulations (limit 10): {json.dumps(all_sims, indent=2)}")

