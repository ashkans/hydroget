from dotenv import load_dotenv
from pyrorb.tools import kc_calibration
import os

load_dotenv()

# Import the calibration_tasks dictionary
from api.lib.db import CALIBRATION_TASKS


def calibrate_kc(catg_data, storms_data, kc, m, initial_loss, continuous_loss, task_id):
    '''
    Calibrates the kc value based on provided data and updates the CALIBRATION_TASKS dictionary.

    Parameters:
    - catg_data (DataFrame): Data related to the category.
    - storms_data (DataFrame): Data related to the storms.
    - kc (float): The initial kc value to be calibrated.
    - m (float): The initial m value to be calibrated.
    - initial_loss (float): The initial loss value to be calibrated.
    - continuous_loss (float): The continuous loss value to be calibrated.
    - task_id (str): The unique identifier for this calibration task.

    Returns:
    - None: The function updates the calibration_tasks dictionary directly.
    '''

    # Update the calibration_tasks dictionary to show that the task is in progress
    CALIBRATION_TASKS[task_id] = {"status": "in_progress"}

    try:
        kc_q_mapping = kc_calibration.kc_calibration(catg_data, storms_data, [0.8,1,1.2,1.4,2], m, initial_loss, continuous_loss)

        # Update the calibration_tasks dictionary with the results
        CALIBRATION_TASKS[task_id] = {
            "status": "completed",
            "rorb_kc_qmax_mapping": kc_q_mapping
        }
    except Exception as e:
        # If an error occurs, update the calibration_tasks dictionary with the error
        CALIBRATION_TASKS[task_id] = {
            "status": "error",
            "error_message": str(e)
        }
