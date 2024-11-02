from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Optional
from api.lib.calibrate_kc import calibrate_kc
import os
import uuid
import logging
from datetime import datetime
import asyncio


from api.lib.db import CALIBRATION_TASKS
def generate_task_id():
    return str(uuid.uuid4())

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    print("Hello endpoint called")
    return {"message": "Hello from FastAPI"}

async def read_content(catg, storms):
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


async def start_calibration_task(
    catg, 
    storms, 
    kc, 
    m, 
    initialLoss, 
    continuousLoss, 
    background_tasks: BackgroundTasks
):
        # Read the content of the uploaded file
 
    



    
    return task_id

@app.post("/api/py/start_calibration")
async def calibration(
    catg: UploadFile|None = None,
    storms: Optional[List[UploadFile]] = File(None),
    kc: float = Form(...),
    m: float = Form(...),
    initialLoss: float = Form(...),
    continuousLoss: float = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    
    
    parameters = {
        "kc": kc,
        "m": m,
        "initialLoss": initialLoss,
        "continuousLoss": continuousLoss
    }
    


  

    catg_content, storms_content = await read_content(catg, storms)
    task_id = generate_task_id()
    print(f"Generated task ID: {task_id}")
    CALIBRATION_TASKS[task_id] = {"status": "pending"}

    time = datetime.now()
    print(f"Starting calibration at {time}")
    background_tasks.add_task(calibrate_kc, catg_content, storms_content, kc, m, initialLoss, continuousLoss, task_id=task_id)
    print(f"Calibration task added to background tasks at {datetime.now()}")
    return JSONResponse(content={"message": "Calibration started", "task_id": task_id, "time": datetime.now()})


@app.get("/api/py/get_calibration_status/{task_id}")
def get_calibration_status(task_id: str):
    print(f"Checking calibration status for task: {task_id}")
    print(f"Available tasks: {list(CALIBRATION_TASKS.keys())}")
    
    if task_id not in CALIBRATION_TASKS:
        logging.warning(f"Task ID {task_id} not found")
        return JSONResponse(content={"message": "Task ID not found", "task_id": task_id}, status_code=404)
    else:
        result = CALIBRATION_TASKS.get(task_id)
        print(f"Retrieved status for task {task_id}: {result}")
        return JSONResponse(content={"message": "Calibration status", "task_id": task_id, 'result': result})
