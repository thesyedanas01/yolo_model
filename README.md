# Safety Object Detection (YOLO + Flask + Next.js)

A full-stack project for detecting safety equipment (Fire Extinguisher, Oxygen Tank, First Aid Box, etc.) using a YOLO model backend and a Next.js frontend.

---

## 🚀 Project Structure
```
/ (repo root)
  ├── app.py          # Flask backend API (YOLO inference)
  ├── requirements.txt
  ├── fonts/
  ├── models/         # Put your YOLO model (best.pt) here
  └── frontend/       # Next.js frontend app
```

---

# 🔧 Backend Setup (Flask + YOLO)

### 1. Create virtual environment
```bash
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Add your model file
Place your YOLO model here:
```
models/best.pt
```

### 4. Run backend locally
```bash
python app.py
```

Backend runs on:
```
http://localhost:5000
```

### 5. Health check
```bash
curl http://localhost:5000/health
```

---

# 🎨 Frontend Setup (Next.js)

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Run development server
```bash
npm run dev
```

Frontend runs on:
```
http://localhost:3000
```

---

# 🔀 API Proxy (Fixes CORS Automatically)

This project uses a rewrite in `next.config.ts` so the frontend can call the backend without CORS issues.

```ts
async rewrites() {
  return [
    {
      source: "/api/detect",
      destination: "http://localhost:5000/api/detect", // or Render URL
    },
  ];
}
```

So frontend fetch calls:
```ts
fetch("/api/detect", {
  method: "POST",
  body: formData,
});
```

---

# 🧪 Test YOLO Detection

### From frontend UI
Upload an image → results appear with bounding boxes.

### From terminal
```bash
curl -X POST http://localhost:5000/api/detect \
  -F "images=@your_image.png"
```

---

# ☁️ Deployment

## Backend (Render)
Set environment variables:
```
MODEL_PATH=models/best.pt
ALLOWED_ORIGINS=http://localhost:3000
PORT=<Render default>
```

Deploy with:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app -b 0.0.0.0:$PORT --workers 1`

## Frontend (Vercel/Netlify)
Update rewrite destination to:
```
https://<your-render-backend>.onrender.com/api/detect
```

---

# 👍 Done
You now have a complete YOLO + Flask + Next.js detection system running locally and ready for deployment.

