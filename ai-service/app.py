# ai-service/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import gradio as gr
from transformers import pipeline

# Model: Çok dilli duygu analizi (neg/neu/pos)
# İstersen "cardiffnlp/twitter-xlm-roberta-base-sentiment" da kullanılabilir.
MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

sentiment_pipeline = pipeline("sentiment-analysis", model=MODEL_NAME)

app = FastAPI(title="Sentiment API")

class PredictIn(BaseModel):
    text: str

class PredictOut(BaseModel):
    label: str
    score: float

def normalize(label: str) -> str:
    l = label.lower()
    if l.startswith("pos"): return "positive"
    if l.startswith("neg"): return "negative"
    if l.startswith("neu"): return "neutral"
    return "unknown"

@app.post("/predict", response_model=PredictOut)
def predict(inp: PredictIn):
    res = sentiment_pipeline(inp.text)[0]
    label = normalize(res["label"])
    score = float(res["score"])
    return {"label": label, "score": score}

# Opsiyonel Gradio arayüzü (Space üzerinde canlı demo için)
def gradio_predict(text):
    out = predict(PredictIn(text=text))
    return f"{out.label} ({out.score:.2f})"

demo = gr.Interface(
    fn=gradio_predict,
    inputs=gr.Textbox(label="Metin"),
    outputs=gr.Textbox(label="Duygu (label, score)"),
    title="Duygu Analizi (Multilingual)"
)

# Gradio'yu FastAPI altına mount et (ana sayfa olarak)
app = gr.mount_gradio_app(app, demo, path="/")
