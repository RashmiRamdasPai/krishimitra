# main.py
from fastapi import FastAPI, HTTPException, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId, Binary
from dotenv import load_dotenv
import os, bcrypt, datetime, pytesseract, requests, certifi, traceback
from PIL import Image
import io
from typing import Optional, Any
from google import generativeai as genai
import pathlib
import logging

# -----------------------------
# Load Environment
# -----------------------------
dotenv_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠ No GEMINI_API_KEY — only fallbacks will work.")

# -----------------------------
# FastAPI + CORS
# -----------------------------
app = FastAPI(title="Agri-Comply Full Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agricomply")

# -----------------------------
# MongoDB Setup
# -----------------------------
CA = certifi.where()
client = MongoClient(MONGO_URI, tls=True, tlsCAFile=CA)
db = client["agricomply"]

users_col = db["users"]
documents_col = db["documents"]
recommendations_col = db["recommendations"]
deadlines_col = db["deadlines"]   # NEW collection for subsidy deadlines

# -----------------------------
# Helper Functions
# -----------------------------
def hash_password(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt())

def normalize_hash(stored: Any) -> bytes:
    if isinstance(stored, (bytes, bytearray)):
        return bytes(stored)
    if isinstance(stored, Binary):
        return bytes(stored)
    if isinstance(stored, str):
        return stored.encode()
    return bytes(stored)

def run_gemini(prompt: str): 
    if not GEMINI_API_KEY: 
        raise RuntimeError("Gemini missing") 
    model = genai.GenerativeModel("models/gemini-2.5-flash") 
    response = model.generate_content(prompt) 
    return response.text.strip()

def month_name():
    return datetime.datetime.utcnow().strftime("%B")

# -----------------------------
# Models
# -----------------------------
class RegisterRequest(BaseModel):
    username: str
    password: str
    preferred_language: str = "english"

class LoginRequest(BaseModel):
    username: str
    password: str

class SaveDeadlineRequest(BaseModel):
    username: str
    subsidy_name: str
    deadline: str  # ISO string

# -----------------------------
# Auth Routes
# -----------------------------
@app.post("/register")
def register(req: RegisterRequest):
    if users_col.find_one({"username": req.username}):
        raise HTTPException(400, "Username already exists")

    pw_hash = hash_password(req.password)

    users_col.insert_one({
        "username": req.username,
        "password_hash": Binary(pw_hash),
        "preferred_language": req.preferred_language,
        "created_at": datetime.datetime.utcnow()
    })

    return {"message": "User registered"}

@app.post("/login")
def login(req: LoginRequest):
    user = users_col.find_one({"username": req.username})
    if not user:
        raise HTTPException(401, "Invalid username or password")

    stored = normalize_hash(user["password_hash"])

    if not bcrypt.checkpw(req.password.encode(), stored):
        raise HTTPException(401, "Invalid username or password")

    return {"message": "Login successful", "username": req.username}

# -----------------------------
# Dashboard
# -----------------------------
@app.get("/dashboard/{username}")
def dashboard(username: str):
    user = users_col.find_one({"username": username})
    if not user:
        raise HTTPException(404, "User not found")

    # documents
    docs = []
    for d in documents_col.find({"username": username}).sort("uploaded_at", -1):
        d["_id"] = str(d["_id"])
        docs.append(d)

    # recommendations
    recs = []
    for r in recommendations_col.find({"username": username}).sort("created_at", -1):
        r["_id"] = str(r["_id"])
        recs.append(r)

    # deadlines
    ds = []
    for dl in deadlines_col.find({"username": username}).sort("deadline", 1):
        dl["_id"] = str(dl["_id"])
        if isinstance(dl.get("deadline"), datetime.datetime):
            dl["deadline"] = dl["deadline"].date().isoformat()
        ds.append(dl)

    return {
        "username": username,
        "documents": docs,
        "recommendations": recs,
        "deadlines": ds
    }

# -----------------------------
# OCR Upload
# -----------------------------
@app.post("/upload")
async def upload(file: UploadFile = File(...), username: Optional[str] = None):
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(image)

        doc = {
            "username": username or "anonymous",
            "filename": file.filename,
            "extracted_text": text.strip(),
            "uploaded_at": datetime.datetime.utcnow(),
            "summary": None
        }

        inserted = documents_col.insert_one(doc)
        return {
            "document_id": str(inserted.inserted_id),
            "extracted_text": text.strip()
        }
    except Exception as e:
        raise HTTPException(500, f"OCR failure: {str(e)}")

# -----------------------------
# Summarization
# -----------------------------
@app.post("/summarize")
async def summarize(request: Request):
    body = await request.json()
    text = body.get("text", "")
    lang = body.get("language", "english")

    if not text.strip():
        raise HTTPException(400, "Empty text")

    lang_map = {
        "kannada": "Kannada",
        "hindi": "Hindi",
        "english": "English"
    }
    lang_full = lang_map.get(lang.lower(), "English")

    script_rule = {
        "Kannada": "Write ONLY in Kannada script (ಕನ್ನಡ). No transliteration.",
        "Hindi": "Write ONLY in Hindi Devanagari (हिन्दी). No transliteration.",
        "English": "Write ONLY in simple English."
    }[lang_full]

    prompt = f"""
Summarize the following text.
Language: {lang_full}
Rule: {script_rule}

Text:
{text}

Write final answer only in {lang_full}.
"""

    #try:
    summary = run_gemini(prompt)
    #except:
        #summary = "AI unavailable — basic summary only."

    return {"summary": summary}

# -----------------------------
# Weather
# -----------------------------
@app.get("/weather")
def weather(lat: float, lon: float):
    if not OPENWEATHER_KEY:
        raise HTTPException(500, "Weather API key missing")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"appid": OPENWEATHER_KEY, "lat": lat, "lon": lon, "units": "metric"}

    try:
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        raise HTTPException(502, f"Weather error: {str(e)}")

# -----------------------------
# Crop Advisor
# -----------------------------
@app.post("/crop-advisor")
async def crop_advisor(request: Request):
    body = await request.json()
    soil_text = body.get("soil_report", "")
    location = body.get("location", "India")
    lang = body.get("language", "english")
    weather = body.get("weather")

    if not soil_text.strip():
        raise HTTPException(400, "No soil report text")

    weather_block = ""
    if weather:
        weather_block = f"""
Temperature: {weather.get("temp")}
Humidity: {weather.get("humidity")}
Wind: {weather.get("wind")}
Rain: {weather.get("rain")}
Condition: {weather.get("desc")}
"""

    lang_key = lang.lower()
    lang_full = "English"
    if lang_key.startswith("kan"):
        lang_full = "Kannada"
    elif lang_key.startswith("hin"):
        lang_full = "Hindi"

    prompt = f"""
You are an agriculture expert.

Language: {lang_full}

Soil Report:
{soil_text}

Weather:
{weather_block}

Recommend ONE best crop for the farmer.
Explain why, and give 4-6 simple steps.
"""

    try:
        text = run_gemini(prompt)
    except:
        text = "Fallback crop suggestion: Rice or Groundnut."

    return {"recommendation": text}

# -----------------------------
# Subsidy Analyzer (AI)
# -----------------------------
@app.post("/subsidy/analyze")
async def analyze_subsidy(data: dict):
    text = data.get("text", "")
    language = data.get("language", "english")

    if not text.strip():
        return {"error": "No text received"}

    # -------------------------------
    # Extract DEADLINE using regex
    # -------------------------------
    import re
    deadline_pattern = r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}"
    match = re.search(deadline_pattern, text, re.IGNORECASE)

    deadline_iso = None
    if match:
        from datetime import datetime
        try:
            d = datetime.strptime(match.group(), "%B %d, %Y")
            deadline_iso = d.strftime("%Y-%m-%d")
        except:
            pass

    # -------------------------------
    # Extract other fields using AI
    # -------------------------------
    prompt = f"""
Extract the following fields from this subsidy form text:

Text:
{text}

Return JSON ONLY with fields:
subsidy_name
eligibility (short list)
required_documents (list)
deadline (yyyy-mm-dd if detected)

Language required: {language}
"""

    ai_response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    try:
        import json
        result = json.loads(ai_response.choices[0].message["content"])
    except:
        result = {
            "subsidy_name": "Not found",
            "eligibility": "",
            "required_documents": "",
            "deadline": deadline_iso or ""
        }

    # Override AI deadline if regex extracted
    if deadline_iso:
        result["deadline"] = deadline_iso

    return result

    # ==========================
    # DEADLINE FALLBACK (regex)
    # ==========================
    import re
    deadline_regex = r"(\b\d{1,2}\s+[A-Za-z]+\s+20\d{2}\b)"  # e.g. 31 May 2024

    found = re.search(deadline_regex, text)
    if found and not data.get("deadline"):
        # Convert to ISO YYYY-MM-DD
        try:
            import dateutil.parser
            dt = dateutil.parser.parse(found.group(1))
            data["deadline"] = dt.strftime("%Y-%m-%d")
        except:
            data["deadline"] = None

    # Ensure all required fields exist
    data.setdefault("subsidy_name", "Unknown Subsidy")
    data.setdefault("eligibility", [])
    data.setdefault("required_documents", [])
    data.setdefault("deadline", None)

    return data


# -----------------------------
# Save Deadline
# -----------------------------
@app.post("/subsidy/save-deadline")
def save_deadline(data: SaveDeadlineRequest):
    print("Received deadline save request:", data.dict())   # <---- ADD THIS

    # Convert deadline to datetime
    try:
        date = datetime.datetime.fromisoformat(data.deadline)
    except:
        import dateutil.parser
        try:
            date = dateutil.parser.parse(data.deadline)
        except:
            print("❌ Invalid date received:", data.deadline)
            raise HTTPException(400, "Invalid date")

    deadlines_col.insert_one({
        "username": data.username,
        "subsidy_name": data.subsidy_name,
        "deadline": date,
        "created_at": datetime.datetime.utcnow()
    })

    print("✅ Deadline saved to MongoDB!")  # <---- ADD THIS

    return {"message": "Deadline saved"}



# -----------------------------
# Fetch deadlines
# -----------------------------
@app.get("/subsidy/deadlines/{username}")
def get_deadlines(username: str):
    ds = []
    for d in deadlines_col.find({"username": username}).sort("deadline", 1):
        d["_id"] = str(d["_id"])
        d["deadline"] = d["deadline"].date().isoformat()
        ds.append(d)
    return {"deadlines": ds}
def clean_json(text: str) -> str:
    """
    Remove markdown, backticks, explanation text, and extract the first JSON object found.
    """
    import re

    # Remove ```json  ``` wrappers
    text = text.replace("```json", "").replace("```", "").strip()

    # Find first {...} JSON block
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return match.group(0)

    return text.strip()
# -----------------------------
# DELETE a deadline
# -----------------------------
@app.post("/subsidy/delete-deadline")
def delete_deadline(payload: dict):
    username = payload.get("username")
    subsidy_name = payload.get("subsidy_name")
    deadline = payload.get("deadline")

    if not username or not subsidy_name or not deadline:
        raise HTTPException(400, "Missing fields")

    result = deadlines_col.delete_one({
        "username": username,
        "subsidy_name": subsidy_name,
        "deadline": datetime.datetime.fromisoformat(deadline)
    })

    if result.deleted_count == 0:
        return {"message": "No deadline found to delete"}

    return {"message": "Deadline deleted"}
# -----------------------------
# Delete a deadline by ID
# -----------------------------
@app.delete("/subsidy/delete/{deadline_id}")
def delete_deadline(deadline_id: str):
    try:
        deadlines_col.delete_one({"_id": ObjectId(deadline_id)})
        return {"message": "Deadline deleted"}
    except:
        raise HTTPException(400, "Invalid ID")
