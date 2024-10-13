from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks

from fastapi.responses import JSONResponse
from typing import List, Optional
from api.lib.calibrate_kc import calibrate_kc
import os

import uuid

from api.lib.db import CALIBRATION_TASKS
def generate_task_id():
    return str(uuid.uuid4())

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


#@app.post("/api/py/start_calibration")

def start_calibration_task(
    catg_content, 
    storms_content, 
    kc, 
    m, 
    initialLoss, 
    continuousLoss, 
    background_tasks: BackgroundTasks
):
    task_id = generate_task_id()
    CALIBRATION_TASKS[task_id] = {"status": "pending"}
    background_tasks.add_task(calibrate_kc, catg_content, storms_content, kc, m, initialLoss, continuousLoss, task_id=task_id)
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
    
    # Read the content of the uploaded file
    catg_content = await catg.read() if catg else None
    storms_content = [await storm.read() for storm in storms] if storms else []

    catg_content = catg_content.decode('ISO-8859-1') if catg_content else None
    storms_content = [storm.decode('ISO-8859-1') for storm in storms_content] if storms_content else []

    task_id = start_calibration_task(
        catg_content, 
        storms_content, 
        kc, 
        m, 
        initialLoss, 
        continuousLoss, 
        background_tasks
    )
    
    return JSONResponse(content={"message": "Calibration started", "task_id": task_id})


@app.get("/api/py/get_calibration_status/{task_id}")
def get_calibration_status(task_id: str):
    print(CALIBRATION_TASKS.keys())
    if task_id not in CALIBRATION_TASKS:
        return JSONResponse(content={"message": "Task ID not found", "task_id": task_id}, status_code=404)
    else:
        return JSONResponse(content={"message": "Calibration status", "task_id": task_id, 'result':CALIBRATION_TASKS.get(task_id)})
