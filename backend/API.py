import os
from dotenv import load_dotenv
from openai import OpenAI
import base64

# Load environment variables from .env file
load_dotenv()

ai_model = "openai/gpt-4.1"

#------------------------------------------------------------------------------------
#                   SETTING UP API CLIENT/KEY
#------------------------------------------------------------------------------------

# Get API key from environment variable
api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise ValueError("OPENROUTER_API_KEY not found in .env file or environment variables.")

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=api_key,
)

#------------------------------------------------------------------------------------
#                   STATSPLAINER FEATURE IMPLEMENTATIONS
#------------------------------------------------------------------------------------

# Gives a response to a user's question/query.
def user_query(query):
  completion = client.chat.completions.create(
    model=ai_model,
    messages=[
      {
        "role": "system",
        "content": "Please format your response using Markdown."
      },
      {
        "role": "user",
        "content": query
      }
    ]
  )
  print(completion.choices[0].message.content)
  return completion.choices[0].message.content

#------------------------------------------------------------------------------------
#                   API WRAPPERS
#------------------------------------------------------------------------------------

def API_text_input(messages, dev_msg, image_base64=None, temperature=0.7):
  """
  Returns generated text from LLM with text argument
  Arguments:
    text - a section of text, must be a string
    prompt - developer message to LLM, must be a string
  Return:
    string representing the explanation
  """

  system_intro = {"role": "system", "content": """
                  Please format your response using Markdown.
                  
                  Ensure that for answering to user queries:
                  1. The user query is related to the pdf, if it isnt related to the pdf (such as random text or off topic requests) ask the user politely to ask a question related to the pdf.
                  
                  2. If the off topic question relates to anything dangerous or inflicts self harm tell the user politely to refrain from such requests and to seek help.
                  
                  3. If the question is off topic do not state a summary
                  End of user query preferences for the response
                  
                  """}
  
  chat_history_hint = {
        "role": "system",
        "content": (
            "The conversation history contains previously highlighted texts and user queries marked as '(Highlighted Text / user query)', "
            "and your earlier replies marked as '(Explanation)'. When the user asks follow-up questions, "
            "refer back to those highlights and your responses as needed."
        )
  }
  
  final_messages = [system_intro]
  
  if dev_msg:
        final_messages.append({
            "role": "system",
            "content": dev_msg
        })
        
  final_messages.append(chat_history_hint)
  final_messages.extend(messages)

  completion = client.chat.completions.create(
      model=ai_model,
      messages=final_messages,
      temperature=temperature
  )
    
  return completion.choices[0].message.content