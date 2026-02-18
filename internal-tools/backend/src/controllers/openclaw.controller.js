import Anthropic from '@anthropic-ai/sdk';
import getPrisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOLS = [
  { name: 'search_clients', description: 'Search CCI clients by name, deal stage, risk level, or event type.', input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Partial client name (optional)' }, dealStage: { type: 'string', description: 'Prospect, Negotiation, Closed Won, Closed Lost, On Hold' }, riskLevel: { type: 'string', description: 'Low, Medium, High' }, eventType: { type: 'string', description: 'Filter by event type (partial match)' } }, required: [] } },
  { name: 'get_client_detail', description: 'Get full detail of a specific client including all notes, tasks, and MoU drafts.', input_schema: { type: 'object', properties: { clientId: { type: 'string', description: 'The client ID' } }, required: ['clientId'] } },
  { name: 'list_tasks', description: 'List TechSprint tasks with optional filters.', input_schema: { type: 'object', properties: { assignedTo: { type: 'string', description: 'Filter by assignee name' }, status: { type: 'string', description: 'TODO, IN_PROGRESS, DONE, BLOCKED' }, clientId: { type: 'string', description: 'Filter by client ID' }, week: { type: 'string', description: 'YYYY-WNN format' } }, required: [] } },
  { name: 'get_workload_summary', description: 'Get per-person task count summary.', input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_flagged_tech_notes', description: 'Get all clients with unresolved tech_requirement notes.', input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'update_client_field', description: 'Update a field on a CCI client record. WRITE action - requires user confirmation.', input_schema: { type: 'object', properties: { clientId: { type: 'string', description: 'The client ID to update' }, field: { type: 'string', description: 'clientName, eventName, eventType, expectedVolume, dealStage, riskLevel, platformFee, timeline, negotiationStatus, customDevRequired, mouStatus' }, value: { description: 'New value for the field' } }, required: ['clientId', 'field', 'value'] } },
  { name: 'add_client_note', description: 'Add a note to a client. WRITE action - requires user confirmation.', input_schema: { type: 'object', properties: { clientId: { type: 'string', description: 'The client ID' }, content: { type: 'string', description: 'Note content' }, category: { type: 'string', description: 'tech_requirement, negotiation, legal, general' } }, required: ['clientId', 'content', 'category'] } },
  { name: 'create_task', description: 'Create a new TechSprint task. WRITE action - requires user confirmation.', input_schema: { type: 'object', properties: { title: { type: 'string', description: 'Task title' }, description: { type: 'string', description: 'Task description (optional)' }, assignedTo: { type: 'string', description: 'Person to assign to (optional)' }, deadline: { type: 'string', description: 'Deadline in ISO format (optional)' }, clientId: { type: 'string', description: 'Related client ID (optional)' }, status: { type: 'string', description: 'Initial status: TODO, IN_PROGRESS, DONE, BLOCKED. Defaults to TODO.' } }, required: ['title'] } },
  { name: 'update_task', description: 'Update a TechSprint task. WRITE action - requires user confirmation.', input_schema: { type: 'object', properties: { taskId: { type: 'string', description: 'The task ID to update' }, status: { type: 'string', description: 'New status: TODO, IN_PROGRESS, DONE, BLOCKED' }, assignedTo: { type: 'string', description: 'New assignee' }, deadline: { type: 'string', description: 'New deadline in ISO format' }, title: { type: 'string', description: 'New title' } }, required: ['taskId'] } }
];

const WRITE_TOOLS = new Set(['update_client_field', 'add_client_note', 'create_task', 'update_task']);

async function executeReadTool(toolName, toolArgs) {
  const prisma = getPrisma();
  switch (toolName) {
    case 'search_clients': {
      const where = {};
      if (toolArgs.dealStage) where.dealStage = toolArgs.dealStage;
      if (toolArgs.riskLevel) where.riskLevel = toolArgs.riskLevel;
      if (toolArgs.query) where.clientName = { contains: toolArgs.query, mode: 'insensitive' };
      if (toolArgs.eventType) where.eventType = { contains: toolArgs.eventType, mode: 'insensitive' };
      const clients = await prisma.client.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 20 });
      return clients.map(c => ({ id: c.id, clientName: c.clientName, eventName: c.eventName, dealStage: c.dealStage, riskLevel: c.riskLevel, eventType: c.eventType, expectedVolume: c.expectedVolume }));
    }
    case 'get_client_detail': {
      const c = await prisma.client.findUnique({ where: { id: toolArgs.clientId }, include: { tasks: true, mouDrafts: { select: { id: true, title: true, status: true } } } });
      return c;
    }
    case 'list_tasks': {
      const where = { parentId: null };
      if (toolArgs.assignedTo) where.assignedTo = { contains: toolArgs.assignedTo, mode: 'insensitive' };
      if (toolArgs.status) where.status = toolArgs.status;
      if (toolArgs.clientId) where.clientId = toolArgs.clientId;
      const tasks = await prisma.task.findMany({ where, include: { client: { select: { clientName: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
      return tasks;
    }
    case 'get_workload_summary': {
      const tasks = await prisma.task.findMany({ select: { assignedTo: true, status: true } });
      const workload = {};
      for (const t of tasks) {
        const p = t.assignedTo || 'Unassigned';
        if (!workload[p]) workload[p] = { TODO: 0, IN_PROGRESS: 0, DONE: 0, BLOCKED: 0 };
        workload[p][t.status]++;
      }
      return workload;
    }
    case 'get_flagged_tech_notes': {
      const clients = await prisma.client.findMany({ orderBy: { updatedAt: 'desc' } });
      return clients.filter(c => {
        const notes = Array.isArray(c.notes) ? c.notes : [];
        return notes.some(n => n.category === 'tech_requirement' && !n.resolved);
      }).map(c => ({ id: c.id, clientName: c.clientName, techNotes: (Array.isArray(c.notes) ? c.notes : []).filter(n => n.category === 'tech_requirement' && !n.resolved) }));
    }
    default: return { error: 'Unknown tool' };
  }
}

async function executeWriteTool(toolName, toolArgs) {
  const prisma = getPrisma();
  switch (toolName) {
    case 'update_client_field': {
      const data = { [toolArgs.field]: toolArgs.value };
      return await prisma.client.update({ where: { id: toolArgs.clientId }, data });
    }
    case 'add_client_note': {
      const c = await prisma.client.findUnique({ where: { id: toolArgs.clientId } });
      const notes = Array.isArray(c.notes) ? c.notes : [];
      const newNote = { id: uuidv4(), content: toolArgs.content, category: toolArgs.category || 'general', resolved: false, createdAt: new Date().toISOString() };
      notes.push(newNote);
      await prisma.client.update({ where: { id: toolArgs.clientId }, data: { notes } });
      return newNote;
    }
    case 'create_task': {
      const data = { ...toolArgs };
      if (data.deadline) data.deadline = new Date(data.deadline);
      if (!data.status) data.status = 'TODO';
      return await prisma.task.create({ data, include: { client: { select: { clientName: true } } } });
    }
    case 'update_task': {
      const { taskId, ...data } = toolArgs;
      if (data.deadline) data.deadline = new Date(data.deadline);
      return await prisma.task.update({ where: { id: taskId }, data, include: { client: { select: { clientName: true } } } });
    }
    default: return { error: 'Unknown write tool' };
  }
}

function buildConfirmationPreview(toolName, toolArgs) {
  switch (toolName) {
    case 'update_client_field': return { action: 'Update client field', field: toolArgs.field, newValue: toolArgs.value, clientId: toolArgs.clientId };
    case 'add_client_note': return { action: 'Add note to client', content: toolArgs.content, category: toolArgs.category, clientId: toolArgs.clientId };
    case 'create_task': return { action: 'Create task', title: toolArgs.title, assignedTo: toolArgs.assignedTo, deadline: toolArgs.deadline, clientId: toolArgs.clientId };
    case 'update_task': return { action: 'Update task', taskId: toolArgs.taskId, changes: Object.fromEntries(Object.entries(toolArgs).filter(([k]) => k !== 'taskId')) };
    default: return { action: toolName, args: toolArgs };
  }
}


const SYSTEM_PROMPT = "You are OpenClaw, an internal AI assistant for Roetix (a ticketing technology company). You help the founder and team manage client relationships (CCI), tasks (TechSprint), and MoU documents.\n\nYou have access to tools to read and write data. For READ operations, use them freely. For WRITE operations, you will propose the action and the user will confirm before it executes.\n\nKey context:\n- CCI: client database with notes, deal stages, risk levels\n- TechSprint: lightweight task tracker (TODO, IN_PROGRESS, DONE, BLOCKED)\n- MoU Maker: memorandum of understanding drafts\n\nWhen classifying note categories:\n- tech_requirement: custom features, technical needs, integrations, dev work\n- negotiation: pricing, terms, discounts, fees\n- legal: contracts, compliance, liability\n- general: everything else\n\nBe concise and helpful. When proposing write actions, briefly explain what you will do.";

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const messages = [...conversationHistory, { role: 'user', content: message }];
    const response = await client.messages.create({ model: 'claude-sonnet-4-5-20250929', max_tokens: 2048, system: SYSTEM_PROMPT, tools: TOOLS, messages });

    if (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find(b => b.type === 'tool_use');
      const { name: toolName, input: toolArgs, id: toolUseId } = toolUseBlock;
      if (WRITE_TOOLS.has(toolName)) {
        const textBlock = response.content.find(b => b.type === 'text');
        return res.json({
          requiresConfirmation: true,
          reply: textBlock?.text || 'I will ' + toolName.replace(/_/g, ' ') + ' for you. Please confirm:',
          toolName, toolArgs, toolUseId,
          confirmationPreview: buildConfirmationPreview(toolName, toolArgs),
          assistantMessage: response.content
        });
      }
      const toolResult = await executeReadTool(toolName, toolArgs);
      const followUpMessages = [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUseId, content: JSON.stringify(toolResult) }] }
      ];
      const followUp = await client.messages.create({ model: 'claude-sonnet-4-5-20250929', max_tokens: 2048, system: SYSTEM_PROMPT, tools: TOOLS, messages: followUpMessages });
      const replyText = followUp.content.find(b => b.type === 'text')?.text || 'Done.';
      return res.json({
        requiresConfirmation: false,
        reply: replyText,
        updatedHistory: [
          ...messages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUseId, content: JSON.stringify(toolResult) }] },
          { role: 'assistant', content: followUp.content }
        ]
      });
    }

    const replyText = response.content.find(b => b.type === 'text')?.text || 'I am not sure how to help with that.';
    return res.json({ requiresConfirmation: false, reply: replyText, updatedHistory: [...messages, { role: 'assistant', content: response.content }] });
  } catch (err) {
    console.error('OpenClaw error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const confirm = async (req, res) => {
  try {
    const { toolName, toolArgs, toolUseId, assistantMessage, confirmed, conversationHistory = [], userMessage } = req.body;
    if (!confirmed) return res.json({ reply: 'Action cancelled. Let me know if you need anything else.' });
    const result = await executeWriteTool(toolName, toolArgs);
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage || 'Please proceed.' },
      { role: 'assistant', content: assistantMessage },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUseId, content: JSON.stringify(result) }] }
    ];
    const followUp = await client.messages.create({ model: 'claude-sonnet-4-5-20250929', max_tokens: 1024, system: SYSTEM_PROMPT, tools: TOOLS, messages });
    const replyText = followUp.content.find(b => b.type === 'text')?.text || 'Done! Action completed successfully.';
    return res.json({ reply: replyText, result, updatedHistory: messages.concat([{ role: 'assistant', content: followUp.content }]) });
  } catch (err) {
    console.error('OpenClaw confirm error:', err);
    res.status(500).json({ error: err.message });
  }
};
