# Roetix Internal Automation Blueprint (With CCI, MoU Maker, TechSprint)

---

# 1. Current Business Model

## Business Type
Roetix operates as a transaction-based event infrastructure platform (vertical SaaS for event organizers).

## Revenue Model
- Platform fee: 4%
  - 2% charged to attendees (markup)
  - 2% deducted from organizer payout
- Revenue scales with GMV (ticket price × volume)
- Primarily take-rate model (not subscription-based)

## Target Market
- University events
- Student competitions
- Community-scale events
- Mid-sized organizers

## Operating Characteristics
- Semi-managed SaaS (not fully self-serve)
- Manual onboarding
- Negotiation-based pricing
- Custom deal structure per client
- Management layer heavily involved in every deal

---

# 2. Current State of Business Process, Team & Bottleneck

## Organizational Structure (3-Layer Model)

### 1. Entrepreneur Layer (Growth)
- Sales team (building phase)
- CRM-based outreach
- Conduct online meetings
- Produce MoM
- Pass potential deal to management layer

### 2. Management Layer (Overloaded)
Handled by Founder + Bob

Responsibilities:
- Read MoM
- Interpret client requirements
- Compare request vs existing features
- Decide feasibility
- Negotiate pricing
- Draft proposal
- Draft MoU manually
- Break down scope into tech tasks
- Set deadlines
- Align client expectation with tech reality

### 3. Technician Layer
- Yijak (Lead)
- Bian (Front-End)
- Grandiv (Back-End)

Responsibilities:
- Build and maintain product
- Execute approved scope only

---

## Core Bottleneck

The management layer is overwhelmed due to:

- Repetitive cognitive work
- Context-heavy decision making
- Manual MoU drafting
- Manual scope-to-task translation
- Manual deadline tracking
- Context switching between sales, legal, and tech

The system knowledge currently lives inside the founder’s brain.

---

# 3. System to Build Using OpenClaw

You want to build a lightweight internal operating system consisting of 3 tools:

1. CCI (Client Context Integration)
2. MoU Maker
3. TechSprint

OpenClaw will act as the unified conversational control layer across all three.

Human approval remains mandatory.

---

## A. CCI — Client Context Integration

### Purpose
Single source of truth.
One master database containing all structured client information.

### Function
- Store client data
- Store negotiation status
- Store fee structure
- Store scope decisions
- Store MoU status
- Store event timeline
- Link client to TechSprint tasks

Schema is evolving and will be refined over time.

### OpenClaw Role
You want to:
- Add new client data
- Update client information
- Query client status
- Summarize risk exposure
- Filter clients by stage

OpenClaw must:
- Read and write to CCI database
- Maintain structured integrity
- Return structured summaries

---

## B. MoU Maker

### Purpose
Automate MoU drafting via Google Docs using:

- 5 real MoU samples (for pattern extraction)
- Data from CCI

### Phase 1: Template Pattern Extraction
From 5 MoUs:
- Identify static clauses
- Identify variable sections
- Detect recurring patterns
- Create structured template schema

### Phase 2: Automated MoU Generation
Workflow:
1. Fetch client data from CCI
2. Map data into template variables
3. Generate Google Docs draft
4. Output review checklist

Human edits final draft.

---

## C. TechSprint

### Purpose
Lightweight replacement for Jira.

Minimal required features:
- Calendar view of deadlines
- Task & subtask
- Description
- Assigned person
- Status
- Linked client reference

No unnecessary enterprise complexity.

### OpenClaw Role
You want to:
- Create tasks via chat
- Modify deadlines
- View weekly workload
- Check individual workload
- Reassign tasks

---

## Integrated Architecture

CCI (Data Layer)
↓
MoU Maker (Legal Layer)
↓
TechSprint (Execution Layer)

OpenClaw sits on top as:
- Query interface
- Automation engine
- Context bridge

---

# 4. What Must Be Prepared Before Using OpenClaw

OpenClaw should never receive messy, undefined input.

You must prepare:

---

## A. Structured CCI Schema

Initial columns may include:

- ClientName
- EventName
- EventType
- ExpectedVolume
- TicketCategories
- PlatformFee
- CustomDevRequired (Yes/No)
- NegotiationStatus
- DealStage
- Timeline
- RiskLevel
- MoUStatus
- LinkedTechSprintID

Schema can evolve iteratively.

---

## B. 5 Real MoU Documents

Used to:
- Extract template structure
- Identify variable placeholders
- Define clause hierarchy

Output must be:
A clean variable-based MoU template.

---

## C. Feature Library (Optional but Recommended)

Structured feature database:

- FeatureName
- Category (Core / Configurable / CustomDev / NotPossible)
- EstimatedDevDays
- RiskLevel

This helps automate scope classification later.

---

## D. Basic Task Structure for TechSprint

Define:

- Task format
- Subtask format
- Estimation logic
- Status types
- Assignment rules

---

# 5. Expected Output From OpenClaw

OpenClaw should produce structured outputs for each tool.

---

## A. From CCI

- Structured client summary
- Risk overview
- Negotiation stage report
- Data update confirmation
- Filtered client lists

---

## B. From MoU Maker

- Google Docs draft link
- Auto-filled template
- Extracted key clauses
- Highlighted review checklist
- Regeneration capability if data changes

---

## C. From TechSprint

- Created task confirmation
- Updated deadline summary
- Weekly calendar overview
- Individual workload report
- Linked task-to-client mapping

---

# Governance Rules

- AI never auto-approves deals.
- Human reviews MoU before sending.
- Margin-sensitive decisions flagged.
- Schema evolves but must stay structured.
- No duplicate data across tools.
- CCI remains single source of truth.

---

# Final System Philosophy

You are building a Founder Operating System.

Objective:
- Reduce cognitive overload
- Standardize decision-making
- Automate repetitive management work
- Maintain human control
- Enable scalable growth without chaos

OpenClaw is the assistant.
CCI is the brain.
MoU Maker is the legal automation layer.
TechSprint is the execution tracker.
Human remains final authority.
