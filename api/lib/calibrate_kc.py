import asyncio
import logging
from datetime import datetime
from typing import Annotated, List, Optional

from fastapi import BackgroundTasks, Depends, File, Form, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials
from pyrorb.tools import kc_calibration

from api.lib import auth
from api.lib.db import calibration_kc_db, accounting
from api.lib.security import security


# Helper functions
def arange(start, stop, step):
    """Generate a list of numbers from start to stop with given step size."""
    current = start
    result = []
    while current <= stop:
        result.append(current)
        current += step
    return result


async def read_content(catg, storms):
    """Read content from catchment and storm files concurrently."""
    print(f"Starting concurrent reads at {datetime.now()}")
    
    # Use asyncio.gather() to perform concurrent I/O operations
    catg_task = catg.read() if catg else None
    storm_tasks = [storm.read() for storm in storms]
    
    # Gather all tasks (catg_task only if catg exists)
    all_results = await asyncio.gather(catg_task, *storm_tasks)
    
    # Split results into catg_content and storms_content
    catg_content = all_results[0] if catg_task else None
    storms_content = all_results[1:] if catg_task else all_results    
    print(f"Finished reading all contents at {datetime.now()}")    
    return catg_content, storms_content


# Core calibration functions
def calibrate_kc(catg_data, storms_data, kc_min, kc_max, kc_step, m, initial_loss, continuous_loss, task_id, user_id=None):
    """
    Calibrates the kc value based on provided data and updates the CALIBRATION_TASKS dictionary.

    Parameters:
    - catg_data (bytes): Raw catchment file data in bytes format, will be decoded to ISO-8859-1
    - storms_data (list[bytes]): List of raw storm file data in bytes format, will be decoded to ISO-8859-1
    - kc_min (float): Minimum kc value to test in calibration
    - kc_max (float): Maximum kc value to test in calibration  
    - kc_step (float): Step size between kc values to test
    - m (float): The m parameter value for RORB model
    - initial_loss (float): The initial loss parameter for RORB model
    - continuous_loss (float): The continuous loss parameter for RORB model
    - task_id (str): Unique identifier for tracking this calibration task

    Returns:
    - None: Updates task status and results in database:
        - Sets status to "in_progress" when starting
        - Sets status to "completed" with rorb_kc_qmax_mapping results on success
        - Sets status to "error" with error message on failure
    """
    

    catg_data = catg_data.decode('ISO-8859-1') if catg_data else None
    storms_data = [storm.decode('ISO-8859-1') for storm in storms_data] if storms_data else []
    kc_list = arange(kc_min, kc_max, kc_step)

    simulation_count = len(storms_data)*len(kc_list)

    calibration_kc_db.update_task(task_id, {"status": "in_progress", "user_id": user_id})

    try:
        kc_q_mapping = kc_calibration.kc_calibration(catg_data, storms_data, kc_list, m, initial_loss, continuous_loss)
        calibration_kc_db.update_task(task_id, {"status": "completed", "rorb_kc_qmax_mapping": kc_q_mapping, "user_id": user_id, "successful_simulation_count": simulation_count})
        accounting.update_simulation_count(user_id, simulation_count)
    except Exception as e:
        calibration_kc_db.update_task(task_id, {"status": "error", "error_message": str(e), "user_id": user_id, "successful_simulation_count": 0})


# API endpoints
def start_calibration(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    catg: UploadFile|None = None,
    storms: Optional[List[UploadFile]] = File(None),
    kcMin: float = Form(...),
    kcMax: float = Form(...),
    kcStep: float = Form(...),
    m: float = Form(...),
    initialLoss: float = Form(...),
    continuousLoss: float = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    token = credentials.credentials
    user_id = auth.user_id_from_token(token)

    catg_content, storms_content = asyncio.run(read_content(catg, storms))
    task_id = calibration_kc_db.new_task(user_id=user_id)
    
    background_tasks.add_task(
        calibrate_kc, 
        catg_content, 
        storms_content, 
        kcMin, 
        kcMax, 
        kcStep, 
        m, 
        initialLoss, 
        continuousLoss, 
        task_id=task_id, 
        user_id=user_id
    )
    return JSONResponse(content={"message": "Calibration started", "task_id": task_id, "time": str(datetime.now())})


def get_calibration_status(task_id: str):
    """Get the status of a calibration task."""
    print(f"Checking calibration status for task: {task_id}")
    print(f"Available tasks: {calibration_kc_db.get_all_tasks()}")
    
    task = calibration_kc_db.get_task(task_id)
    if task is None:
        logging.warning(f"Task ID {task_id} not found")
        return JSONResponse(content={"message": "Task ID not found", "task_id": task_id}, status_code=404)
    
    result = task
    print(f"Retrieved status for task {task_id}: {result}")
    result.pop('user_id', None)  # Remove user_id from response
    return JSONResponse(content={"message": "Calibration status", "task_id": task_id, 'result': result})
