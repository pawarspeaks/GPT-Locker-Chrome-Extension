from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import datetime
import openpyxl
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()  # Load environment variables from .env file

def log_device_info_to_excel(device_info, file_path):
    workbook = None
    try:
        workbook = openpyxl.load_workbook(file_path)
    except FileNotFoundError:
        workbook = openpyxl.Workbook()
        workbook.active.append(["IP", "User Agent", "Timestamp"])
    
    sheet = workbook.active
    sheet.append([device_info['ip'], device_info['user_agent'], device_info['timestamp']])
    
    workbook.save(file_path)

class PromptCheckRequest(BaseModel):
    prompt: str

@app.post("/check_prompt")
async def check_prompt(request: PromptCheckRequest, background_tasks: BackgroundTasks):
    sensitive_data = ['confidential', 'password', 'secret', 'proprietary']  # Example sensitive data
    for word in sensitive_data:
        if word in request.prompt.lower():
            background_tasks.add_task(log_device_info_to_excel, device_info={'ip': '192.168.1.1', 'user_agent': 'Chrome/100.0.0', 'timestamp': datetime.datetime.now().isoformat()}, file_path='device_log.xlsx')
            return {"alert": "Sensitive data detected! Please be cautious."}
    return {"alert": None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
