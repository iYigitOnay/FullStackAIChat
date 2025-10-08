# FullStack + AI Chat (Rumuzlu Çok Kullanıcılı • Canlı Duygu Analizi)

**React (Vite) Web + .NET 8 Web API + Python FastAPI (Hugging Face)**  
Kullanıcılar **rumuz** belirleyerek tek odalı bir sohbette mesajlaşır. Her mesaj, Hugging Face üzerinde çalışan **AI duygu analizi** servisine gönderilir; sonuç (**positive / neutral / negative**) anlık olarak UI’da görünür.

**Canlı Demo Linkleri (deploy sonrası doldurun)**
- Web (Vercel): `https://<vercel-project>.vercel.app`
- API (Render): `https://<render-service>.onrender.com`
- AI (Hugging Face Space): `https://<username>-<space>.hf.space`

---

## Özellikler (MVP)

- Tek odalı sohbet (çok kullanıcılı, rumuzla giriş)
- Anlık duygu skoru (1.5 sn polling ile canlı his)
- AI entegrasyonu (Hugging Face Spaces — FastAPI + Transformers)
- .NET 8 + EF Core + SQLite (kolay kurulum)
- Navy-beyaz tema, WhatsApp benzeri arka plan
- Ücretsiz deploy uyumlu: Vercel (web), Render (API), HF Spaces (AI)

---

## Mimari

React (Vercel) --(REST)--> .NET API (Render) --(REST)--> AI /predict (HF Spaces)
↑ |
└── 1.5 sn polling <-----------┘ (DB: SQLite app.db)


- İlk açılışta **rumuz** istenir → `/api/users` ile backend’e kayıt → `userId` tarayıcı **localStorage**’a yazılır.  
- Mesaj gönderimi → `/api/messages` → **AI** `/predict` → sonuç DB’ye kaydolur → frontend **polling** ile görür.

---

## 📂 Monorepo Yapısı

/frontend
/web # React + Vite + TypeScript (UI)
/backend
/ChatApi # .NET 8 Web API + EF Core + SQLite (app.db)
/ai-service # Python FastAPI + Transformers (HF Spaces uyumlu)
README.md

---

## Önkoşullar

- Node.js ≥ 18
- .NET SDK ≥ 8
- Python ≥ 3.10 + pip
- (İsteğe bağlı) Git/GitHub
- Komutlar Windows PowerShell ile verilmiştir (macOS/Linux benzer).

---

## Lokal Kurulum

### 1) AI Servisi (localhost:7860)

```powershell
cd ai-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 7860

Invoke-RestMethod -Method POST -Uri http://127.0.0.1:7860/predict -ContentType "application/json; charset=utf-8" -Body '{"text":"Bugün harika hissediyorum!"}'

!!!!!Notlar!!!!!

İlk çağrıda model indirileceği için gecikme normaldir.

Gerekirse: pip install protobuf sentencepiece safetensors

Windows symlink uyarısı sadece cache optimizasyonuyla ilgilidir; güvenle yoksayılabilir.

### 2) Backend API (localhost:5000)

cd backend/ChatApi
dotnet tool install --global dotnet-ef
dotnet restore
dotnet ef database update
$env:AI_BASE_URL = "http://127.0.0.1:7860"   # prod için HF Space URL kullanın
dotnet run --urls http://localhost:5000

### 3) Frontend Web (localhost:5173)

cd frontend/web
# .env dosyası (oluşturun):
# VITE_API_URL=http://localhost:5000
npm i
npm run dev

Tarayıcı: http://localhost:5173
İlk açılışta rumuz modalı gelir → kaydedin → mesaj atın → 1.5 sn içinde duygu rozeti görünür.

Ortam Değişkenleri

Frontend (frontend/web/.env)

VITE_API_URL → Backend’in taban URL’i (lokalde http://localhost:5000, prod’da Render URL’i)

Backend

AI_BASE_URL → AI servisinin taban URL’i (lokalde http://127.0.0.1:7860, prod’da HF Space URL’i)

Dosya Rehberi (Özet)
Frontend

src/App.tsx — Rumuz alma modalı, mesaj listesi, composer, 1.5 sn polling

src/components/MessageItem.tsx — Mesaj balonu; Rumuz • sentiment • saat meta satırı

src/lib/api.ts — API istemcisi (fetchMessages/sendMessage/createUser) ve ham → UI tipi mapping

src/types.ts — Tipler (RawMessage → Message + sentiment)

src/styles.css — Tema değişkenleri (navy-beyaz), orta panel (1/3 genişlik), WhatsApp benzeri arka plan (public/wa-bg.svg)

Backend

Models/User.cs, Models/Message.cs — EF Core veri modelleri

Data/AppDbContext.cs — DbContext

Contracts/Dto.cs — CreateUserDto, CreateMessageDto, AiRequest/Response, MessageDto

Controllers/UsersController.cs — POST /api/users (rumuz kaydı)

Controllers/MessagesController.cs — GET/POST /api/messages (AI çağrısı, join’li DTO dönüş)

Program.cs — SQLite bağlantısı, CORS, HttpClient (AI_BASE_URL), Swagger

AI Servisi

app.py — FastAPI + Transformers; POST /predict ile sentiment

requirements.txt — fastapi, uvicorn, transformers, torch, gradio…

“Kod Hâkimiyeti Kanıtı”

Elle yazılan kritik kısımlar:

Backend: EF Core modelleri, AppDbContext, Program.cs (CORS/HttpClient/Swagger), MessagesController AI çağrısı + DB kaydı, UsersController, LINQ (LEFT JOIN)

Frontend: App.tsx (durum/polling/modal), MessageItem.tsx, api.ts (mapping/hata ele alma)

AI destekli (taslak/otokod): README ve commit taslakları, ufak stil/utility önerileri, açıklayıcı yorumlar

Tüm kritik akışlar manuel kontrol/test edildi.