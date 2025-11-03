import { NextRequest, NextResponse } from 'next/server';
import { Client, WebhookEvent, TextMessage } from '@line/bot-sdk';
import crypto from 'crypto';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

const client = new Client({
  channelAccessToken,
  channelSecret,
});

// Verify LINE signature
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 401 });
    }

    // Verify signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const events: WebhookEvent[] = data.events;

    // Process each event
    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          const userMessage = event.message.text;
          const replyToken = event.replyToken;

          try {
            // Use 4-step AI flow (same as web chatbot)
            const aiResponse = await processMessageWith4StepFlow(userMessage, req);

            // Reply to user
            const message: TextMessage = {
              type: 'text',
              text: aiResponse,
            };

            await client.replyMessage(replyToken, message);
          } catch (error) {
            console.error('Error processing message:', error);

            // Send error message to user
            const errorMessage: TextMessage = {
              type: 'text',
              text: 'ขอโทษครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
            };

            await client.replyMessage(replyToken, errorMessage);
          }
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 4-Step AI Flow (same as web chatbot)
async function processMessageWith4StepFlow(message: string, req: NextRequest): Promise<string> {
  const baseUrl = req.nextUrl.origin;

  try {
    // Step 1: Normalize input
    console.log('[LINE] Step 1: Normalizing input...');
    const normalizeResponse = await fetch(`${baseUrl}/api/ai/normalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!normalizeResponse.ok) {
      throw new Error('Failed to normalize message');
    }

    const { normalizedMessage } = await normalizeResponse.json();
    console.log('[LINE] Normalized message:', normalizedMessage);

    // Step 2: Classify the query type
    console.log('[LINE] Step 2: Classifying query type...');
    const classifyResponse = await fetch(`${baseUrl}/api/ai/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: normalizedMessage }),
    });

    if (!classifyResponse.ok) {
      throw new Error('Failed to classify message');
    }

    const { queryType } = await classifyResponse.json();
    console.log('[LINE] Query type:', queryType);

    // Step 3 & 4: Route to appropriate handler based on query type
    let response: string;

    if (queryType === 'data_query') {
      console.log('[LINE] Step 3-4: Processing data query...');
      const dataQueryResponse = await fetch(`${baseUrl}/api/ai/data-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: normalizedMessage }),
      });

      if (!dataQueryResponse.ok) {
        const errorData = await dataQueryResponse.json();
        console.error('[LINE] Data query error:', errorData);
        response = `ขอโทษครับ เกิดข้อผิดพลาดในการค้นหาข้อมูล\n\nกรุณาลองถามคำถามใหม่ในรูปแบบที่ชัดเจนขึ้น`;
      } else {
        const data = await dataQueryResponse.json();
        response = data.response;
      }
    } else if (queryType === 'how_to') {
      console.log('[LINE] Step 3-4: Processing how-to query...');
      const howToResponse = await fetch(`${baseUrl}/api/ai/how-to`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: normalizedMessage }),
      });

      if (!howToResponse.ok) {
        throw new Error('Failed to process how-to query');
      }

      const data = await howToResponse.json();
      response = data.response;
    } else {
      // general
      console.log('[LINE] Step 3-4: Processing general query...');
      const generalResponse = await fetch(`${baseUrl}/api/ai/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: normalizedMessage }),
      });

      if (!generalResponse.ok) {
        throw new Error('Failed to process general query');
      }

      const data = await generalResponse.json();
      response = data.response;
    }

    return response;
  } catch (error) {
    console.error('[LINE] Error in 4-step flow:', error);
    throw error;
  }
}

// Handle GET request (for verification)
export async function GET() {
  return NextResponse.json({ message: 'LINE Webhook endpoint is working (4-step flow)' });
}

// ============================================
// DEPRECATED: Old function calling approach 
// Now using 4-step flow instead
// ============================================
/*
async function getTopOTEmployees_DEPRECATED(limit: number = 5) {
  const { data: periods } = await supabase
    .from('payroll_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(1);

  if (!periods || periods.length === 0) {
    return { error: 'ไม่พบข้อมูลรอบเงินเดือน' };
  }

  const period = periods[0];

  const { data: payrollData } = await supabase
    .from('payroll')
    .select(`
      *,
      employees:employee_id (
        employee_id,
        first_name,
        last_name,
        department
      )
    `)
    .eq('period_id', period.id)
    .order('ot_hours', { ascending: false })
    .limit(limit);

  return {
    period: `${period.period_name} (${period.start_date} - ${period.end_date})`,
    employees: payrollData?.map((p: any) => ({
      name: `${p.employees.first_name} ${p.employees.last_name}`,
      department: p.employees.department,
      ot_hours: p.ot_hours,
      ot_amount: p.ot_amount,
    })),
  };
}

async function getDepartmentSummary(department?: string) {
  const { data: periods } = await supabase
    .from('payroll_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(1);

  if (!periods || periods.length === 0) {
    return { error: 'ไม่พบข้อมูลรอบเงินเดือน' };
  }

  const period = periods[0];

  let query = supabase
    .from('payroll')
    .select(`
      *,
      employees:employee_id (
        employee_id,
        first_name,
        last_name,
        department
      )
    `)
    .eq('period_id', period.id);

  if (department) {
    query = query.eq('employees.department', department);
  }

  const { data: payrollData } = await query;

  const summary = {
    period: `${period.period_name}`,
    total_employees: payrollData?.length || 0,
    total_base_salary: payrollData?.reduce((sum: number, p: any) => sum + parseFloat(p.base_salary || 0), 0) || 0,
    total_ot_amount: payrollData?.reduce((sum: number, p: any) => sum + parseFloat(p.ot_amount || 0), 0) || 0,
    total_gross: payrollData?.reduce((sum: number, p: any) => sum + parseFloat(p.gross_salary || 0), 0) || 0,
    total_net: payrollData?.reduce((sum: number, p: any) => sum + parseFloat(p.net_salary || 0), 0) || 0,
  };

  if (department) {
    return { department, ...summary };
  }

  return summary;
}

async function getEmployeeInfo(searchTerm: string) {
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`)
    .limit(5);

  return employees?.map((e: any) => ({
    id: e.employee_id,
    name: `${e.first_name} ${e.last_name}`,
    department: e.department,
    base_salary: e.base_salary,
    ot_rate: e.ot_hourly_rate,
  }));
}

async function getEmployeeOTDetail(searchTerm: string) {
  // Get latest period
  const { data: periods } = await supabase
    .from('payroll_periods')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(1);

  if (!periods || periods.length === 0) {
    return { error: 'ไม่พบข้อมูลรอบเงินเดือน' };
  }

  const period = periods[0];

  // Search for employee and get OT details from both payroll and daily_attendance
  const { data: payrollData } = await supabase
    .from('payroll')
    .select(`
      *,
      employees:employee_id (
        employee_id,
        first_name,
        last_name,
        department
      )
    `)
    .eq('period_id', period.id)
    .or(`employees.first_name.ilike.%${searchTerm}%,employees.last_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`)
    .limit(1);

  if (!payrollData || payrollData.length === 0) {
    return { error: `ไม่พบพนักงานที่ชื่อ "${searchTerm}" ในรอบเงินเดือนนี้` };
  }

  const employee = payrollData[0];
  const employeeId = employee.employee_id;

  // Get detailed OT from daily_attendance
  const { data: dailyData } = await supabase
    .from('daily_attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('period_id', period.id)
    .limit(1);

  const dailyAttendance = dailyData?.[0];

  return {
    period: `${period.period_name} (${period.start_date} - ${period.end_date})`,
    employee: {
      id: employee.employees.employee_id,
      name: `${employee.employees.first_name} ${employee.employees.last_name}`,
      department: employee.employees.department,
    },
    ot_summary: {
      // From payroll table (this is the correct total)
      total_ot_hours_from_payroll: parseFloat(employee.ot_hours || 0),
      ot_amount: parseFloat(employee.ot_amount || 0),
      
      // From daily_attendance (breakdown)
      regular_ot_hours: dailyAttendance ? parseFloat(dailyAttendance.regular_ot_hours || 0) : 0,
      sunday_ot_actual_hours: dailyAttendance ? parseFloat(dailyAttendance.sunday_ot_hours || 0) : 0,
      sunday_ot_calculated_hours: dailyAttendance ? parseFloat(dailyAttendance.sunday_ot_calculated || 0) : 0,
      total_ot_hours_from_daily: dailyAttendance ? parseFloat(dailyAttendance.total_ot_hours || 0) : 0,
      total_work_days: dailyAttendance ? dailyAttendance.total_work_days : 0,
    },
    note: 'ชั่วโมง OT ที่แสดงคือจาก payroll table ซึ่งเป็นข้อมูลที่ใช้คำนวณเงินเดือนจริง',
  };
}

async function getLeaveStats(limit: number = 5) {
  const { data: leaveData } = await supabase
    .from('leave_records')
    .select(`
      *,
      employees:employee_id (
        employee_id,
        first_name,
        last_name,
        department
      )
    `)
    .order('leave_date', { ascending: false })
    .limit(100);

  // Group by employee and count
  const leaveCounts: Record<string, any> = {};
  leaveData?.forEach((leave: any) => {
    const empId = leave.employee_id;
    if (!leaveCounts[empId]) {
      leaveCounts[empId] = {
        name: `${leave.employees.first_name} ${leave.employees.last_name}`,
        department: leave.employees.department,
        count: 0,
      };
    }
    leaveCounts[empId].count++;
  });

  const sorted = Object.values(leaveCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, limit);

  return sorted;
}

// Call OpenAI API with Function Calling
async function getAIResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const messages: any[] = [
    {
      role: 'system',
      content: `คุณเป็น AI Assistant สำหรับระบบ Payroll ที่สามารถตอบคำถามและดึงข้อมูลจากฐานข้อมูลได้

คุณสามารถ:
- ดูข้อมูลพนักงานที่ทำ OT มากที่สุด (get_top_ot_employees)
- ดูรายละเอียด OT ของพนักงานคนใดคนหนึ่ง (get_employee_ot_detail) - ใช้เมื่อถามชื่อพนักงานเฉพาะ
- ดูสรุปเงินเดือนของแผนกต่างๆ (get_department_summary)
- ค้นหาข้อมูลพนักงาน (search_employee)
- ดูสถิติการลางาน (get_leave_stats)
- ตอบคำถามเกี่ยวกับระบบ Payroll

**สำคัญ:**
- เมื่อผู้ใช้ถามเกี่ยวกับ OT ของพนักงานคนใดคนหนึ่ง ให้ใช้ get_employee_ot_detail
- ข้อมูล OT ที่แสดงจาก payroll.ot_hours คือข้อมูลที่ใช้คำนวณเงินเดือนจริง
- ถ้ามีความแตกต่างระหว่าง payroll.ot_hours และ daily_attendance.total_ot_hours ให้ใช้จาก payroll.ot_hours เป็นหลัก

ตอบคำถามเป็นภาษาไทย กระชับ ชัดเจน และเป็นมิตร`,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_top_ot_employees',
        description: 'ดึงข้อมูลพนักงานที่ทำ OT มากที่สุดในรอบเงินเดือนล่าสุด',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'จำนวนพนักงานที่ต้องการดู (default: 5)',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_department_summary',
        description: 'ดึงสรุปข้อมูลเงินเดือนของแผนก',
        parameters: {
          type: 'object',
          properties: {
            department: {
              type: 'string',
              description: 'ชื่อแผนก เช่น Production, Office (ถ้าไม่ระบุจะดูทุกแผนก)',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_employee',
        description: 'ค้นหาข้อมูลพนักงานด้วยชื่อหรือรหัส',
        parameters: {
          type: 'object',
          properties: {
            search_term: {
              type: 'string',
              description: 'คำค้นหา (ชื่อหรือรหัสพนักงาน)',
            },
          },
          required: ['search_term'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_leave_stats',
        description: 'ดูสถิติการลางานของพนักงาน',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'จำนวนพนักงานที่ต้องการดู (default: 5)',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_employee_ot_detail',
        description: 'ดูรายละเอียด OT ของพนักงานคนใดคนหนึ่งโดยเฉพาะ (ใช้เมื่อผู้ใช้ถามชื่อพนักงานเฉพาะ)',
        parameters: {
          type: 'object',
          properties: {
            search_term: {
              type: 'string',
              description: 'ชื่อหรือรหัสพนักงานที่ต้องการดู OT',
            },
          },
          required: ['search_term'],
        },
      },
    },
  ];

  // First API call
  let response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  let data = await response.json();
  let assistantMessage = data.choices[0]?.message;

  // Check if AI wants to call a function
  if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
    messages.push(assistantMessage);

    // Execute each function call
    for (const toolCall of assistantMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let functionResult;

      try {
        switch (functionName) {
          case 'get_top_ot_employees':
            functionResult = await getTopOTEmployees(functionArgs.limit);
            break;
          case 'get_department_summary':
            functionResult = await getDepartmentSummary(functionArgs.department);
            break;
          case 'search_employee':
            functionResult = await getEmployeeInfo(functionArgs.search_term);
            break;
          case 'get_leave_stats':
            functionResult = await getLeaveStats(functionArgs.limit);
            break;
          case 'get_employee_ot_detail':
            functionResult = await getEmployeeOTDetail(functionArgs.search_term);
            break;
          default:
            functionResult = { error: 'Unknown function' };
        }
      } catch (error) {
        functionResult = { error: String(error) };
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(functionResult),
      });
    }

    // Second API call with function results
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    data = await response.json();
  }

  return data.choices[0]?.message?.content || 'ขอโทษครับ ไม่สามารถตอบคำถามได้ในขณะนี้';
}
*/
