

## **📋 Simplified API Endpoints**

### **1. POST /api/v1/chat/search**
**Purpose**: Simple semantic similarity search for resumes
**Input**:
```json
{
  "message": "Find Python developers with 5 years experience",
  "top_k": 10,
  "filters": {}
}
```
**Output**:
```json
{
  "message": "Found 5 candidates matching your query",
  "query": "Find Python developers with 5 years experience",
  "original_message": "Find Python developers with 5 years experience",
  "matches": [
    {
      "id": "resume_123",
      "file_name": "john_doe.pdf",
      "score": 0.87,
      "extracted_info": {
        "name": "John Doe",
        "skills": ["Python", "Django", "PostgreSQL"],
        "experience": [...]
      },
      "relevant_text": "Software developer with 6 years..."
    }
  ],
  "total_results": 5,
  "success": true
}
```

---

### **2. Session Management (Optional but Available)**

#### **POST /api/v1/chat/sessions**
Create new conversation session
```json
{
  "title": "Senior Developer Search",
  "initial_message": "Find senior developers"
}
```

#### **GET /api/v1/chat/sessions**
List all sessions with pagination

#### **GET /api/v1/chat/sessions/{session_id}**
Get specific session details

#### **POST /api/v1/chat/sessions/{session_id}/search**
Search within a session (maintains conversation history)

#### **DELETE /api/v1/chat/sessions/{session_id}**
Delete a session

---

### **3. Follow-up Questions**

#### **POST /api/v1/chat/sessions/{session_id}/followup**
**Purpose**: Ask questions about previous search results
**Input**:
```json
{
  "question": "Why were these candidates selected?"
}
```
**Output**:
```json
{
  "session_id": "session_123",
  "question": "Why were these candidates selected?",
  "answer": "Selection Criteria:\n\nJohn Doe:\n- Skills: 8 technical skills\n- Experience: 3 previous roles\n- Key technologies: Python, Django, AWS\n\nJane Smith:\n- Skills: 12 technical skills\n- Experience: 4 previous roles\n- Key technologies: Python, React, Docker",
  "success": true
}
```

**Supported Follow-up Questions**:
- **"Why were these selected?"** - Explains selection criteria
- **"What are their strengths?"** - Analyzes candidate strengths  
- **"Compare these candidates"** - Shows comparison between candidates
- **"What are their experience levels?"** - Analyzes seniority levels
- **"What are their technical skills?"** - Lists technical capabilities

---


