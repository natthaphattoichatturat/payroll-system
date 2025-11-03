# AI Chatbot Feature Documentation

## Overview

This Payroll System now includes an advanced AI chatbot feature powered by OpenAI's GPT-4o-mini. The chatbot provides intelligent assistance for data queries, how-to guidance, and general questions about the payroll system.

## Features

### 🤖 Multi-LLM Workflow

The AI chatbot uses a sophisticated multi-stage LLM workflow:

1. **Input Normalization (LLM 1)**
   - Fixes typos in Thai and English
   - Completes incomplete sentences
   - Corrects grammar errors
   - Preserves original meaning

2. **Query Classification (LLM 2)**
   - Classifies input into 3 types:
     - `data_query`: Questions requiring database information
     - `how_to`: Questions about system usage
     - `general`: General questions and greetings

3. **Specialized Response Generation**
   - **Data Query Path**: Generates SQL → Executes query → Formats results
   - **How-To Path**: Uses comprehensive system guide to answer
   - **General Path**: Friendly conversational responses

### 🧠 Memory Management

- **Conversation Context**: Automatically detects if new input is continuation or new topic
- **Context Compression**: Summarizes long conversations to maintain relevant context
- **Short-term Memory**: Keeps last 10 messages with intelligent compression

### 🎨 User Interface

- **Floating Chat Button**: Available on all pages (bottom-right corner)
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Markdown Rendering**: Beautiful formatted responses with tables, lists, and code blocks
- **Expandable View**: Click maximize button to open full AI features page

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Install Dependencies

Dependencies are already installed. If needed:

```bash
npm install
```

Required packages:
- `openai`: OpenAI API client
- `langchain`: Memory management (future use)
- `@langchain/openai`: LangChain OpenAI integration
- `react-markdown`: Markdown rendering
- `remark-gfm`: GitHub Flavored Markdown support

### 3. Run the Application

```bash
npm run dev
```

Visit: http://localhost:3000

## Usage

### Accessing the Chat

1. **Floating Button**: Click the AI button in bottom-right corner on any page
2. **Full Page**: Navigate to `/ai-features` via the navbar menu

### Example Queries

#### Data Queries (ต้องใช้ข้อมูล)
- "พนักงานคนไหนทำ OT มากที่สุด 5 อันดับแรก?"
- "แผนก Production มีค่าใช้จ่ายเงินเดือนรวมเท่าไหร่?"
- "พนักงานที่ลางานมากที่สุดในเดือนนี้คือใคร?"
- "มีพนักงานกี่คนในบริษัท?"

#### How-To Queries (วิธีการใช้งาน)
- "วิธีการ import ข้อมูลเวลาเข้างานทำอย่างไร?"
- "อธิบายการคำนวณ OT ในระบบหน่อย"
- "วิธีเพิ่มพนักงานใหม่?"
- "การคำนวณภาษีทำงานอย่างไร?"

#### General Queries (คำถามทั่วไป)
- "สวัสดี"
- "ขอบคุณ"
- "คุณช่วยอะไรได้บ้าง?"

## Architecture

### File Structure

```
app/
├── ai-features/
│   └── page.tsx                    # AI Features main page
├── api/
│   └── ai/
│       ├── chat/route.ts          # Main orchestrator
│       ├── normalize/route.ts     # Input normalization
│       ├── classify/route.ts      # Query classification
│       ├── data-query/route.ts    # SQL generation & execution
│       ├── how-to/route.ts        # System guide responses
│       └── general/route.ts       # General conversation

components/
└── ai/
    ├── chat-interface.tsx         # Chat UI component
    └── chat-button.tsx            # Floating button

lib/
├── openai.ts                      # OpenAI client
├── memory-manager.ts              # Conversation memory
└── database-schema.ts             # Schema for SQL generation
```

### API Workflow

```
User Input
    ↓
1. POST /api/ai/normalize
    → Normalize input (fix typos, grammar)
    ↓
2. Check Memory Context
    → Determine if continuation or new topic
    ↓
3. POST /api/ai/classify
    → Classify: data_query | how_to | general
    ↓
4a. If data_query:
    POST /api/ai/data-query
    → Generate SQL
    → Execute query
    → Format results

4b. If how_to:
    POST /api/ai/how-to
    → Use system guide
    → Generate response

4c. If general:
    POST /api/ai/general
    → Conversational response
    ↓
5. Return formatted markdown response
```

## Database Schema Context

The AI has knowledge of all database tables:
- `employees`: Employee information
- `departments`: Department details
- `attendance_scans`: Time tracking data
- `shift_schedules`: Work schedules
- `leave_records`: Leave applications
- `payroll_periods`: Payroll periods
- `payroll_calculations`: Salary calculations
- `holidays`: Public holidays

## Security Features

- **SQL Injection Protection**: Dangerous keywords blocked (DROP, DELETE, UPDATE, etc.)
- **Query Validation**: All SQL queries validated before execution
- **Safe Execution**: Uses Supabase client for secure query execution
- **API Key Protection**: OpenAI key stored securely in environment variables

## Customization

### Modify System Prompts

Edit prompts in these files:
- [/app/api/ai/normalize/route.ts](/app/api/ai/normalize/route.ts) - Normalization behavior
- [/app/api/ai/classify/route.ts](/app/api/ai/classify/route.ts) - Classification logic
- [/app/api/ai/how-to/route.ts](/app/api/ai/how-to/route.ts) - System guide content
- [/app/api/ai/general/route.ts](/app/api/ai/general/route.ts) - Personality and tone

### Adjust Memory Settings

Edit [/lib/memory-manager.ts](/lib/memory-manager.ts):
```typescript
private maxMessages = 10;  // Keep last N messages
private maxTokens = 2000;  // Approximate token limit
```

### Change AI Model

Edit [/lib/openai.ts](/lib/openai.ts):
```typescript
export const MODEL = 'gpt-4o-mini';  // Change to gpt-4, etc.
```

## Troubleshooting

### Build Errors

**Error**: `OPENAI_API_KEY is not set`
- **Solution**: Add `OPENAI_API_KEY` to `.env.local`

### Runtime Errors

**Error**: "Failed to classify message"
- **Cause**: OpenAI API key invalid or quota exceeded
- **Solution**: Check API key and billing status

**Error**: "Failed to execute query"
- **Cause**: Invalid SQL or database connection issue
- **Solution**: Check Supabase credentials in `.env.local`

### Chat Not Responding

1. Check browser console for errors
2. Verify OpenAI API key is set
3. Check network tab for failed API calls
4. Ensure Supabase connection is working

## Performance Considerations

- **API Calls**: Each chat message makes 2-4 API calls (normalize, classify, response)
- **Cost**: Using GPT-4o-mini (~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens)
- **Response Time**: Typically 2-5 seconds depending on query complexity
- **Memory**: Context compression reduces token usage for long conversations

## Future Enhancements

Potential improvements:
1. **Vector Database**: Store conversation history in vector DB for better context retrieval
2. **Function Calling**: Use OpenAI function calling for more structured data queries
3. **Streaming Responses**: Real-time token streaming for faster perceived response
4. **Multi-language Support**: Add English language support
5. **Voice Input**: Speech-to-text for mobile users
6. **Analytics Dashboard**: Track common queries and AI performance
7. **Custom Training**: Fine-tune model on company-specific payroll data

## Cost Estimation

Based on GPT-4o-mini pricing (as of 2025):
- Average query: ~1,500 tokens (input + output)
- Cost per query: ~$0.001 (0.1 cents)
- 1,000 queries/month: ~$1
- 10,000 queries/month: ~$10

Monitor usage at: https://platform.openai.com/usage

## License & Credits

- **OpenAI GPT-4o-mini**: Used for all LLM operations
- **LangChain**: Memory management utilities
- **React Markdown**: Markdown rendering
- **Supabase**: Database and authentication

---

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check OpenAI API status: https://status.openai.com
4. Verify Supabase connection

Built with ❤️ using Next.js, OpenAI, and Supabase
