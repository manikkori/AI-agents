# 🤖 Autonomous AI Agent Development (Node.js)

Welcome to my AI Agent Development repository! This project is a progressive journey of building **Autonomous AI Agents** from scratch using Node.js. 

Unlike standard "Chatbots" that only generate text, the agents built here possess **Agency**—the ability to reason, make decisions, and interact with external APIs and the local computer's file system using the **ReAct (Reasoning + Acting)** architecture.

---

## 🛠️ Tech Stack & Technologies Used
* **Backend:** Node.js, JavaScript
* **AI Engine:** Groq SDK (Llama 3, openai/gpt-oss-120b / Fast Inference Models)
* **Real-World APIs:** GitHub REST API, OpenWeatherMap API
* **Core Modules:** fs (File System), path, readline
* **Environment Management:** dotenv

---

## 🚀 Setup & Installation

If you want to run these agents on your local machine, follow these steps:

1. Clone the repository:
   git clone [https://github.com/manikkori/AI-agents](https://github.com/manikkori/AI-agents.git)
   cd AIAgent-Basics

2. Install dependencies:
   npm install groq-sdk dotenv

3. Environment Variables setup:
   Create a .env file in the root directory and add your API keys:
   GROQ_API_KEY=your_groq_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here

4. Run any agent file:
   node file_name.js

---

## 📂 Project Progression (Files 01 to 11)

This repository follows a step-by-step evolution of AI agents, starting from basic API calls to building a fully autonomous local developer agent.

### Phase 1: The Foundation (Files 01 - 07)
* **API Connection & Roles:** Connecting to the Groq API and understanding System, User, and Assistant roles.
* **Structured JSON Outputs:** Forcing the LLM to respond in strictly formatted JSON schemas for reliable backend parsing.
* **Interactive Terminal:** Building a continuous command-line chat loop using Node.js readline.
* **Basic Tool Calling:** Giving the AI its first isolated "Tool" to fetch static backend database values instead of relying on pre-trained memory.

### Phase 2: The Core Agentic Engine
* **08_multi_tools.js (The ReAct Loop):** Implemented a dynamic while loop that allows the AI to autonomously route between multiple tools. The agent thinks, acts, gets data, and formulates a final response.

### Phase 3: Real-World Integrations & Agency
* **09_github_Agent.js:** An agent connected to the real internet. It fetches real-time public profile data, repositories, and activity from the GitHub REST API based on the user's natural language prompt.
* **10_weather_agent.js:** A travel and weather assistant utilizing the OpenWeatherMap API. It autonomously decides whether to call the temperature tool, the weather condition tool, or both simultaneously based on context.
* **11_fs_agent.js (Local Dev-Agent):** This is where the AI becomes a "Builder". Connected to the Node.js fs module, this agent can autonomously read directories, write code, create new files, and modify existing files directly on the local hard drive based on conversational commands.
### Phase 4: The Self-Healing Developer Agent
* **`12_self_healing_agent.js`:** This is a breakthrough in Agentic workflows. This agent doesn't just write code; it actively tests and debugs it in a real local environment. It acts as a fully autonomous Junior Developer.
**Key Features & Capabilities:**
1. **OS-Level Execution:** Utilizes Node.js `child_process` (`exec`) and `util.promisify` to autonomously open background terminals and run commands (e.g., `node script.js`, `python -m http.server`, or `start index.html`).
2. **Autonomous Debugging Loop (Self-Healing):** * The Agent writes a file using the `create_file` tool.
   * It attempts to run the file using the `execute_command` tool.
   * If the code crashes (throws a fatal exception or syntax error), the `catch` block intercepts the crash and extracts the `error.message` (containing the `stderr`).
   * Instead of breaking the loop, the error is fed *back* to the AI.
   * The AI reads the terminal error, rewrites the corrected code, and re-runs it until it successfully executes (Exit Code 0).
3. **File Deletion:** Added the `delete_file` tool using `fs.unlink` to completely manage the lifecycle of local files.

**How it works under the hood:**
The ReAct engine dynamically routes between reading, writing, deleting, and executing. It understands the context of the files it creates—knowing to spin up a local server for HTML/CSS or directly run Node/Python scripts.
---

*Note: This repository is actively being updated. Future updates will include Self-Healing Code Agents, LangChain framework integrations, and RAG (Retrieval-Augmented Generation) systems.*
