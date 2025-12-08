# FED Chatbot 🤖

> An intelligent AI-powered chatbot for the Federation of Entrepreneurship Development (FED) at KIIT University, built with React and Google Gemini AI.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF.svg)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5--flash-orange.svg)](https://ai.google.dev/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Folder Structure](#folder-structure)
- [How It Works](#how-it-works)
- [Message Flow](#message-flow)
- [APIs Used](#apis-used)
- [Development Guide](#development-guide)
- [Common Issues](#common-issues)

---

## 🎯 Overview

The FED Chatbot is a modern, responsive web application that serves as an intelligent assistant for FED KIIT. It provides real-time information about:
- Team members and their roles
- Upcoming and past events
- Registration links for live events
- General information about FED

**Key Capabilities:**
- 🧠 AI-powered responses using Google Gemini 2.5 Flash
- 📊 Live data from FED backend API
- 💬 Natural language understanding
- 🎤 Voice input support
- 🔗 Clickable links for social media and registrations
- ⚡ Intelligent caching for performance

---

## ✨ Features

### For Users
- **Smart Conversations**: Ask questions in natural language
- **Voice Input**: Speak your queries instead of typing
- **Quick Actions**: Pre-defined prompts for common questions
- **Professional Links**: Clean, clickable links (no messy URLs)
- **Real-time Data**: Always up-to-date team and event information

### For Developers
- **Modular Architecture**: Clean separation of concerns
- **Environment-Based Config**: Easy to configure and deploy
- **Intelligent Caching**: Reduces API calls, improves performance
- **Error Handling**: Robust retry logic with exponential backoff
- **Type Documentation**: Comprehensive JSDoc comments

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.3.1 |
| **Vite** | Build Tool | 6.0.5 |
| **SCSS** | Styling | - |
| **Axios** | HTTP Client | 1.7.9 |
| **Google Gemini AI** | AI Responses | 2.5-flash-preview |
| **Web Speech API** | Voice Input | Browser Native |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

**Check your versions:**
```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation

### Step 1: Clone the Repository
```bash
cd path/to/your/workspace
git clone <repository-url>
cd FED-Chatbot
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your API keys
# (See Environment Setup section below)
```

### Step 4: Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## 📁 Folder Structure

```
FED-Chatbot/
├── public/                      # Static assets
│   └── index.html              # HTML template
│
├── src/                         # Source code
│   ├── components/             # React components
│   │   └── Chatbot/           # Main chatbot component
│   │       ├── Chatbot.jsx    # Chatbot UI and logic
│   │       └── Chatbot.module.scss  # Chatbot styles
│   │
│   ├── services/              # Business logic services
│   │   ├── chatbotAPI.js     # Main orchestration service
│   │   ├── geminiAPI.js      # Google Gemini AI integration
│   │   ├── teamAPI.js        # FED team API calls
│   │   ├── teamDataManager.js     # Team data caching
│   │   └── eventsDataManager.js   # Events data caching
│   │
│   ├── config/                # Configuration
│   │   └── constants.js       # All app constants
│   │
│   ├── styles/                # Global styles
│   │   ├── global.scss        # Global CSS
│   │   └── variables.scss     # SCSS variables
│   │
│   ├── App.jsx                # Root component
│   ├── main.jsx              # Entry point
│   └── ...
│
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

### 📂 Key Directories Explained

#### `src/components/Chatbot/`
Contains the main chatbot UI component:
- **Chatbot.jsx**: Message display, input handling, voice recognition
- **Chatbot.module.scss**: All styling for the chatbot interface

#### `src/services/`
Core business logic, separated by responsibility:

1. **chatbotAPI.js** - Main orchestrator
   - Coordinates all other services
   - Handles error messages
   - Provides health checks

2. **geminiAPI.js** - AI Integration
   - Sends queries to Google Gemini
   - Injects team/event context
   - Handles retry logic

3. **teamDataManager.js** - Team Data
   - Fetches team members from FED API
   - Implements 2-minute cache
   - Provides filtering/sorting utilities

4. **eventsDataManager.js** - Events Data
   - Fetches events from FED API
   - Separates upcoming vs past events
   - Implements caching and search

5. **teamAPI.js** - HTTP Client
   - Raw API calls to FED backend
   - Error handling
   - Timeout management

#### `src/config/`
Centralized configuration:
- **constants.js**: All environment variables, API URLs, cache settings, error messages

---

## 🔄 How It Works

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           User Interface (React)            │
│  • Message input & display                  │
│  • Voice recognition                        │
│  • Quick action buttons                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         chatbotAPI.js (Orchestrator)        │
│  • Coordinates all services                 │
│  • Error handling                           │
└────────┬────────────────────────────────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌───────────────┐ ┌──────────┐ ┌─────────────┐
│ geminiAPI.js  │ │ teamData │ │ eventsData  │
│ (AI Service)  │ │ Manager  │ │  Manager    │
└───────┬───────┘ └────┬─────┘ └──────┬──────┘
        │              │               │
        │              ▼               ▼
        │         ┌────────────────────────┐
        │         │   FED Backend API      │
        │         │ api.fedkiit.com        │
        │         └────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│  Google Gemini AI API    │
│  generativelanguage...   │
└──────────────────────────┘
```

---

## 💬 Message Flow (Step-by-Step)

### What Happens When You Send "Who is the president?"

#### **Step 1: User Input** (Chatbot.jsx)
```javascript
User types → "Who is the president?"
         ↓
Chatbot.jsx captures input in handleSend()
         ↓
Adds message to UI (shows user's message)
         ↓
Calls chatbotAPI.sendMessage(query)
```

#### **Step 2: Service Orchestration** (chatbotAPI.js)
```javascript
chatbotAPI.sendMessage("Who is the president?")
         ↓
Validates input (not empty)
         ↓
Calls teamDataManager.fetchAndCacheTeamData()
         ↓
Calls eventsDataManager.fetchAndCacheEvents()
```

#### **Step 3: Data Fetching** (Parallel)

**3a. Team Data Manager**
```javascript
teamDataManager.fetchAndCacheTeamData()
         ↓
Check cache: Is data < 2 minutes old?
   YES → Return cached data ✅
   NO  → Continue ↓
         ↓
Call teamAPI.fetchTeam()
         ↓
HTTP GET to: https://api.fedkiit.com/api/user/fetchTeam
         ↓
Response: { success: true, data: [...team members] }
         ↓
Filter out null names
         ↓
Sort by: year DESC, then name ASC
         ↓
Cache for 2 minutes
         ↓
Return team data
```

**3b. Events Data Manager**
```javascript
eventsDataManager.fetchAndCacheEvents()
         ↓
Check cache: Is data < 2 minutes old?
   YES → Return cached data ✅
   NO  → Continue ↓
         ↓
HTTP GET to: https://api.fedkiit.com/api/form/getAllForms
         ↓
Response: { success: true, events: [...] }
         ↓
Filter: upcoming events (isEventPast: false)
         ↓
Sort past events: by date DESC
         ↓
Take top 5 past events
         ↓
Cache for 2 minutes
         ↓
Return { upcomingEvents: [...], pastEvents: [...] }
```

#### **Step 4: AI Processing** (geminiAPI.js)
```javascript
geminiAPI.generateAIResponse(query, teamMembers, events)
         ↓
Build context injection:
   ### LIVE TEAM DATA START ###
   [Full JSON of team members]
   ### LIVE TEAM DATA END ###
   
   ### LIVE EVENT DATA START ###
   [Full JSON of events]
   ### LIVE EVENT DATA END ###
         ↓
Construct final prompt:
   System Prompt (from .env)
   + Team Context
   + Event Context  
   + User Query: "Who is the president?"
         ↓
HTTP POST to: 
   https://generativelanguage.googleapis.com/v1beta/models/
   gemini-2.5-flash-preview-09-2025:generateContent
   ?key=YOUR_API_KEY
         ↓
Request Body:
   {
     contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
     systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
   }
         ↓
Response (after 1-3 seconds):
   {
     candidates: [{
       content: {
         parts: [{ 
           text: "The current president of FED is [Name]..." 
         }]
       }
     }]
   }
         ↓
Extract text from response
         ↓
Return AI response to chatbotAPI
```

#### **Step 5: Response Rendering** (Chatbot.jsx)
```javascript
chatbotAPI.sendMessage() returns AI response
         ↓
Chatbot.jsx receives response
         ↓
Add bot message to UI
         ↓
Process markdown in message.text:
   1. Convert @fedkiit → Instagram link
   2. Convert **bold** → <strong>bold</strong>
   3. Convert [text](url) → <a href> clickable link
   4. Convert plain URLs → clickable links
   5. Convert \n → <br/>
         ↓
Render HTML using dangerouslySetInnerHTML
         ↓
User sees: "The current president of FED is John Doe. 
            Connect on LinkedIn" (LinkedIn is clickable)
```

### Timing Breakdown

| Step | Time (First Call) | Time (Cached) |
|------|-------------------|---------------|
| 1. User Input | ~0ms | ~0ms |
| 2. Orchestration | ~1ms | ~1ms |
| 3. Team API | ~1.15s | ~0ms ✅ |
| 3. Events API | ~1.33s | ~0ms ✅ |
| 4. Gemini AI | ~1-3s | ~1-3s |
| 5. Rendering | ~10ms | ~10ms |
| **Total** | **~3.5-5.5s** | **~1-3s** |

**Cache saves ~2.5s on subsequent requests!**

---

## 🌐 APIs Used

### 1. **FED Backend API** (Team Data)
**Endpoint:** `GET https://api.fedkiit.com/api/user/fetchTeam`

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "access": "PRESIDENT",
      "year": 2025,
      "extra": {
        "designation": "President",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe"
      }
    }
  ]
}
```

**Used For:**
- Team member listings
- Role information
- Social media links

---

### 2. **FED Backend API** (Events Data)
**Endpoint:** `GET https://api.fedkiit.com/api/form/getAllForms`

**Response Structure:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event_456",
      "info": {
        "eventTitle": "Startup Workshop",
        "eventDate": "2025-01-15",
        "isEventPast": false,
        "registrationLink": "https://forms.gle/xyz123"
      },
      "sections": [...]
    }
  ]
}
```

**Used For:**
- Upcoming events
- Past events (last 5)
- Registration links

---

### 3. **Google Gemini AI API**
**Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent`

**Request Structure:**
```json
{
  "contents": [{
    "role": "user",
    "parts": [{ "text": "CONTEXT + USER QUERY" }]
  }],
  "systemInstruction": {
    "parts": [{ "text": "SYSTEM PROMPT FROM .ENV" }]
  }
}
```

**Response Structure:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{ "text": "AI generated response..." }]
    }
  }]
}
```

**Used For:**
- Natural language understanding
- Generating intelligent responses
- Context-aware answers

**Rate Limits:**
- Free tier: 60 requests/minute, 1,500/day
- Enable billing for higher quotas

---

## 👨‍💻 Development Guide

### Running the Project

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Making Changes

#### 1. **Adding a New Service**

Create `src/services/myNewService.js`:
```javascript
/**
 * @fileoverview My new service description
 * @module services/myNewService
 */

import { CONFIG } from '../config/constants';

export const doSomething = async () => {
  // Your logic here
};
```

#### 2. **Adding New Environment Variables**

1. Add to `.env`:
```env
VITE_MY_NEW_VAR=some-value
```

2. Add to `src/config/constants.js`:
```javascript
export const CONFIG = {
  // ...existing
  MY_FEATURE: {
    SETTING: import.meta.env.VITE_MY_NEW_VAR || 'default'
  }
};
```

3. Update `.env.example` for documentation

#### 3. **Modifying the System Prompt**

Edit `.env`:
```env
VITE_SYSTEM_PROMPT="Your updated prompt here...\n\nUse \\n for line breaks"
```

Restart the dev server for changes to take effect.

#### 4. **Adding Quick Action Buttons**

Edit `src/components/Chatbot/Chatbot.jsx`:
```javascript
const suggestedPrompts = [
    "What is FED?",
    "Who is the president?",
    "Tell me about FED events",
    "How can I join FED?",
    "Your new prompt here"  // Add here
];
```

---

## 🐛 Common Issues

### Issue: "Module not found" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment variables not loading
**Solution:**
- Ensure variables start with `VITE_`
- Restart dev server after editing `.env`
- Check for typos in variable names

### Issue: 429 Rate Limit from Gemini API
**Causes:**
- Testing too frequently
- Free tier quota exceeded

**Solutions:**
1. Wait 60 seconds between tests
2. Reduce `VITE_MAX_RETRIES` to 1
3. Enable billing on Google Cloud

### Issue: Bold text showing as `**text**`
**Solution:**
- Hard refresh browser: `Ctrl + Shift + R`
- Clear cache and reload

### Issue: Links showing as HTML code
**Solution:**
- Check `Chatbot.jsx` for correct `dangerouslySetInnerHTML`
- Ensure regex patterns are processing in correct order

### Issue: Voice input not working
**Causes:**
- HTTPS required for Web Speech API
- Microphone permissions denied
- Browser compatibility (Chrome/Edge works best)

**Solutions:**
- Use `localhost` (HTTPS not required)
- Check browser console for permission errors
- Try Chrome or Edge browser

---

## 🤝 Contributing

### For New Developers

1. **Read this README** completely
2. **Set up your environment** following Installation steps
3. **Explore the code** starting from `Chatbot.jsx`
4. **Make small changes first** to understand the flow
5. **Test thoroughly** before committing

### Code Guidelines

- Write JSDoc comments for all functions
- Use descriptive variable names
- Follow existing code style
- Test with real data
- Don't commit `.env` file

---

## 📞 Support

**Need help?**
- Check [Common Issues](#common-issues) section
- Review [Claude-Chatbot.md](./Claude-Chatbot.md)
- Contact: fedkiit@gmail.com

---

## 📄 License

This project is for FED KIIT's internal use.

---

**Built with ❤️ by the FED KIIT Development Team**
