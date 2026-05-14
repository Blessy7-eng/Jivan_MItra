import os
import requests
from fastapi import FastAPI, Form
from fastapi.responses import Response
import google.generativeai as genai
from twilio.twiml.messaging_response import MessagingResponse

app = FastAPI()

# Configure Gemini
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

MODEL_NAME = "gemini-2.0-flash"

@app.post("/api/whatsapp")
async def whatsapp_webhook(
    Body: str = Form(None),
    MediaUrl0: str = Form(None)
):
    twiml = MessagingResponse()
    
    body_text = Body.strip() if Body else ""

    try:
        if not gemini_api_key:
            print("Warning: GEMINI_API_KEY is not set.")
            twiml.message("System is not currently configured. Please try again later.")
            return Response(content=str(twiml), media_type="application/xml")

        model = genai.GenerativeModel(MODEL_NAME)
        
        reply_text = ""

        if MediaUrl0:
            # Download the image from Twilio URL
            response = requests.get(MediaUrl0)
            response.raise_for_status()
            
            image_data = response.content
            mime_type = response.headers.get("Content-Type", "image/jpeg")

            prompt = "Extract medicine names and dosages from this prescription. Simplify it for a patient in Marathi and Hindi."
            if body_text:
                prompt += f" The user also said: '{body_text}'."

            # Pass both the text prompt and the image data to Gemini
            contents = [
                prompt,
                {
                    "mime_type": mime_type,
                    "data": image_data
                }
            ]

            ai_response = model.generate_content(contents)
            reply_text = ai_response.text

        elif body_text:
            prompt = f"Act as a helpful medical assistant named 'Mitra'. A user has sent the following message: '{body_text}'. Respond concisely and helpfully. Emphasize that you are an AI and they should consult a real doctor for serious medical conditions."
            ai_response = model.generate_content(prompt)
            reply_text = ai_response.text

        else:
            reply_text = "Namaste! Welcome to Jivan-Mitra. Please send a text query or a photo of your prescription, and I will assist you."
            
        final_reply = f"{reply_text}\n\nNote: This is an AI assistant, not professional medical advice."
        twiml.message(final_reply)

    except Exception as e:
        print(f"Error handling WhatsApp webhook: {e}")
        twiml.message("Sorry, I encountered an error right now. Please try again later.\n\nNote: Please verify with your doctor or pharmacist on medical matters.")

    return Response(content=str(twiml), media_type="application/xml")
