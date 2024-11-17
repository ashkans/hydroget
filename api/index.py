from fastapi import FastAPI
from api.lib.calibrate_kc import start_calibration, get_calibration_status
from api.lib.accounting_endpoints import get_accounting
### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")


app.add_api_route("/api/py/start_calibration", start_calibration, methods=["POST"])
app.add_api_route("/api/py/get_calibration_status/{task_id}", get_calibration_status, methods=["GET"])
app.add_api_route("/api/py/get_accounting", get_accounting, methods=["GET"])