# LLM Integration & Diagram Generation

## Project: Smart Diagram — Backend

This README explains the backend layer of **Smart Diagram**, focusing on how **AI models (OpenAI & DeepSeek)** are used to generate, transcribe, and manage Mermaid-based diagrams.  
It provides a clear, structured overview without code examples.

---

## 1. Overview

The backend is the **AI-powered engine** of Smart Diagram.  
It processes user inputs (text, audio, or existing Mermaid code), communicates with AI models, and outputs validated MermaidJS code for frontend visualization.

Responsibilities include:

- Input processing (text, audio, Mermaid code)  
- AI diagram generation and validation  
- Data storage and management  
- API communication with the frontend  
- Diagram lifecycle management (CRUD operations)  

---

## 2. Key Objectives

- Convert natural language or audio inputs into MermaidJS diagrams using AI.  
- Provide validated and consistent Mermaid code to the frontend.  
- Support multiple AI models: **OpenAI GPT-4** and **DeepSeek Chat**.  
- Ensure accurate transcription for audio input via **OpenAI Whisper**.  
- Enable full CRUD operations for diagrams.

---

## 3. Role of the Backend

The backend serves as the **intelligent intermediary** between the frontend and AI systems.  

It:

- Accepts user inputs (text, voice, or Mermaid code)  
- Uses AI models to interpret or generate diagrams  
- Cleans and validates Mermaid syntax  
- Stores diagrams and metadata in the database  
- Provides RESTful APIs for frontend integration  

The backend ensures every AI-generated diagram is **accurate, consistent, and ready for visualization**.

---

## 4. AI Workflow and Logic

The backend follows a structured pipeline:

1. **Input Reception** – Receive text, audio, or Mermaid code.  
2. **Transcription (if audio)** – Convert speech to text using OpenAI Whisper.  
3. **Prompt Construction** – Build system prompts with strict Mermaid syntax rules.  
4. **AI Processing** – Generate diagrams using OpenAI GPT-4 or DeepSeek Chat.  
5. **Validation** – Clean and verify MermaidJS code.  
6. **Storage** – Save final diagrams with metadata in MongoDB.

---

## 5. Mermaid Code Validation

- **Cleaning** – Removes Markdown wrappers and unwanted formatting.  
- **Syntax Correction** – Ensures proper Mermaid directives (`flowchart TD`, `sequenceDiagram`, etc.).  
- **Fallbacks** – Generates a default diagram structure if AI output is invalid.

---

## 6. CRUD Operations

The backend supports full diagram lifecycle management:

- **Create** – Generate and store new diagrams.  
- **Read** – Retrieve stored diagrams for display or editing.  
- **Update** – Modify existing diagrams.  
- **Delete** – Remove diagrams permanently.

All operations are RESTful and integrate seamlessly with the frontend.

---

## 7. Data Management

Diagrams are stored in **MongoDB** with a structured data model (`FlowChart`), including:

- Title and diagram type  
- Input method (text, audio, Mermaid code)  
- Selected AI model (OpenAI or DeepSeek)  
- Transcribed text for audio input  
- Generated Mermaid code  
- User ID and metadata  

This ensures secure, organized, and accessible diagram storage.

---

## 8. Integration with Frontend

1. Frontend sends user input to the backend.  
2. Backend transcribes (if needed), generates, and validates Mermaid code.  
3. Cleaned Mermaid code is returned to the frontend.  
4. Frontend visualizes diagrams using **React Flow**.  
5. User edits are synced back to the backend via APIs.

---

## 9. Technology Stack (Backend)

- **Framework**: Node.js + Express.js  
- **Database**: MongoDB with Mongoose  
- **AI Models**: OpenAI GPT-4, DeepSeek Chat  
- **Audio Processing**: OpenAI Whisper  
- **API Communication**: Axios  
- **File Handling**: Multer  
- **Environment Management**: dotenv  

---

## 10. Security and Environment

- Sensitive credentials stored in environment variables (`.env`).  
- All AI communications are HTTPS with authorized Bearer tokens.  
- Ensures data privacy and secure integration with AI services.

---

## 11. Conclusion

The backend is the **intelligent core** of Smart Diagram, transforming text or audio inputs into structured MermaidJS diagrams.  
It combines AI transcription, generation, syntax validation, and database storage to deliver **reliable, interactive diagrams** for the frontend.

---

