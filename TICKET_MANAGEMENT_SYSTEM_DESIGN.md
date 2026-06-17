# Ticket Management System - Complete Design Document

## 1. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (ReactJS)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │  Login   │  │ Dashboard│  │  Tickets │  │  Ticket Detail  │ │
│  │  Page    │  │  Page    │  │  List    │  │    (Chat)       │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER (Go)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  Auth      │  │  Tickets   │  │  Comments  │  │ Attachments│ │
│  │  Handler   │  │  Handler   │  │  Handler   │  │  Handler  │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE (PostgreSQL)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │  Users   │  │  Tickets │  │ Comments │  │  Attachments    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Role-Based Access Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │  Employee   │     │  Support    │
│   User      │     │             │     │    Desk     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Layer                       │
│                    (JWT Token + Middleware)                   │
└─────────────────────────────────────────────────────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Create  │     │  Assign  │     │  Monitor │
│  Ticket  │     │  Ticket  │     │  All     │
│          │     │  Status  │     │  Tickets │
└──────────┘     └──────────┘     └──────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  View    │     │  Update  │     │  View    │
│  Own     │     │  Status  │     │  Dashboard│
│  Tickets │     │  Close   │     │  Metrics │
│  Chat    │     │  Ticket  │     │  Reports │
└──────────┘     └──────────┘     └──────────┘
```

---

## 6. File/Attachment Handling

### Storage Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    Attachment Storage Strategy               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Option 1: Cloud Storage (Recommended for Production)       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AWS S3 / Google Cloud Storage / Azure Blob         │    │
│  │  - Scalable and cost-effective                      │    │
│  │  - Built-in CDN for fast downloads                  │    │
│  │  - Automatic backup and redundancy                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Option 2: Local Storage (Development/Small Scale)          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  /uploads/attachments/                              │    │
│  │  - Organized by ticket_id                           │    │
│  │  - File metadata stored in database                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### API Flow for Upload/Download

```
┌─────────────────────────────────────────────────────────────────┐
│                    UPLOAD FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

Client                          Backend                          Storage
   │                               │                               │
   │  POST /api/attachments        │                               │
   │  { ticket_id, files[] }      │                               │
   │──────────────────────────────►│                               │
   │                               │  Validate & Sanitize          │
   │                               │──────────────────────────────►│
   │                               │  Generate Presigned URL       │
   │                               │◄──────────────────────────────│
   │                               │                               │
   │                               │  Return Presigned URL         │
   │◄──────────────────────────────│                               │
   │                               │                               │
   │  PUT to Presigned URL         │                               │
   │  (Direct to Storage)          │                               │
   │──────────────────────────────►│                               │
   │                               │                               │
   │                               │  Record Metadata in DB        │
   │                               │  INSERT INTO attachments      │
   │                               │                               │
   │◄──────────────────────────────│                               │
   │  { attachment_id, url }       │                               │
   │                               │                               │


┌─────────────────────────────────────────────────────────────────┐
│                    DOWNLOAD FLOW                                 │
└────────���────────────────────────────────────────────────────────┘

Client                          Backend                          Storage
   │                               │                               │
   │  GET /api/attachments/:id     │                               │
   │──────────────────────────────►│                               │
   │                               │  Verify User Permissions      │
   │                               │                               │
   │                               │  Fetch from DB                │
   │                               │  SELECT * FROM attachments    │
   │                               │                               │
   │                               │  Generate Download URL        │
   │                               │                               │
   │◄──────────────────────────────│                               │
   │  { url, filename, size }      │                               │
   │                               │                               │
   │  Download from URL            │                               │
   │──────────────────────────────►│                               │
   │                               │                               │
```

### File Type & Size Validation

```typescript
// File validation constants
const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  MAX_FILES_PER_TICKET: 10,
};
```

---

## 7. Dashboard Design (Support Desk)

### Metrics Display

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPPORT DESK DASHBOARD                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  QUICK METRICS (Top Row)                                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │ TOTAL       │ │ OPEN        │ │ IN PROGRESS │ │ RESOLVED    ││
│  │ 1,234       │ │ 234         │ │ 156         │ │ 844         ││
│  │ ─────────── │ │ ─────────── │ │ ─────────── │ │ ─────────── ││
│  │ ↑ 12%       │ │ ↑ 5%        │ │ ↓ 3%        │ │ ↑ 8%        ││
│  │ vs last     │ │ vs last     │ │ vs last     │ │ vs last     ││
│  │ month       │ │ month       │ │ month       │ │ month       ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PRIORITY BREAKDOWN                                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Urgent    ████████████████████████████  45 (15%)         │  │
│  │  High      ████████████████████████████████████████  120  │  │
│  │  Medium    ████████████████████████████████████████████  200│  │
│  │  Low       ██████████████████████████████████████████████  350│  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SLA METRICS                                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  First Response Time: 2.3 hours (Target: 4h)              │  │
│  │  ███████████████████████████████████████████████████████  │  │
│  │                                                           │  │
│  │  Resolution Time: 24.5 hours (Target: 48h)                │  │
│  │  ███████████████████████████████████████████████████████  │  │
│  │                                                           │  │
│  │  SLA Compliance: 94.2% (Target: 95%)                      │  │
│  │  ███████████████████████████████████████████████████████  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  RECENT TICKETS                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ID    │ Customer    │ Subject              │ Status  │ Prio│  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ #1001 │ John Doe    │ Login Issue          │ Open    │ High│  │
│  │ #1002 │ Jane Smith  │ Payment Failed       │ Assigned│ Urgent│  │
│  │ #1003 │ Bob Wilson  │ Feature Request      │ In Prog │ Low   │  │
│  │ #1004 │ Alice Brown │ Account Access       │ Resolved│ Med   │  │
│  │ #1005 │ Charlie Lee │ Data Export          │ Open    │ Med   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  EMPLOYEE WORKLOAD                                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Employee        │ Assigned │ In Progress │ Resolved │ Avg │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ Sarah Johnson   │ 12       │ 8           │ 45       │ 2h  │  │
│  │ Mike Davis      │ 8        │ 5           │ 38       │ 1.5h│  │
│  │ Emily Chen      │ 15       │ 10          │ 52       │ 2.5h│  │
│  │ Tom Wilson      │ 6        │ 4           │ 30       │ 1h  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Suggested Queries

```sql
-- Total ticket count by status
SELECT 
    status, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM tickets
GROUP BY status
ORDER BY count DESC;

-- SLA compliance metrics
SELECT 
    COUNT(*) FILTER (WHERE resolution_time <= 48) as within_sla,
    COUNT(*) FILTER (WHERE resolution_time > 48) as over_sla,
    ROUND(
        COUNT(*) FILTER (WHERE resolution_time <= 48) * 100.0 / COUNT(*), 
        2
    ) as compliance_percentage
FROM tickets
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- First response time average
SELECT 
    AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 3600) as avg_hours
FROM tickets
WHERE first_response_at IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Tickets by priority
SELECT 
    priority,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE status = 'open') as open_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
FROM tickets
GROUP BY priority
ORDER BY 
    CASE priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END;

-- Employee workload
SELECT 
    e.name as employee_name,
    COUNT(t.id) FILTER (WHERE t.status IN ('open', 'assigned')) as assigned,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress,
    COUNT(t.id) FILTER (WHERE t.status = 'resolved') as resolved,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600), 1) as avg_resolution_hours
FROM employees e
LEFT JOIN tickets t ON t.assigned_to = e.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY e.id, e.name
ORDER BY assigned DESC;

-- Recent tickets (last 7 days)
SELECT 
    t.id,
    t.subject,
    c.name as customer_name,
    t.status,
    t.priority,
    t.created_at,
    e.name as assigned_to_name
FROM tickets t
JOIN customers c ON t.customer_id = c.id
LEFT JOIN employees e ON t.assigned_to = e.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY t.created_at DESC
LIMIT 10;
```

---

## 8. Workflow & State Transitions

### Ticket Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    TICKET LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │   CREATED   │
                    │  (Open)     │
                    └──────┬──────┘
                           │
                           │ Client submits ticket
                           ▼
                    ┌─────────────┐
                    │   OPEN      │
                    │  (New)      │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  ASSIGNED   │ │  IN PROGRESS│ │  RESOLVED   │
    │             │ │             │ │             │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  IN PROGRESS│ │  RESOLVED   │ │  CLOSED     │
    │             │ │             │ │             │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  CLOSED     │
                    │  (Final)    │
                    └─────────────┘
```

### State Transition Diagram

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         │
    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │  OPEN   │───►│ASSIGNED │───►│IN PROGRESS│───►│RESOLVED │
    └────┬────┘    └────┬────┘    └────┬─────┘    └────┬────┘
         │             │               │                │
         │             │               │                │
         ▼             ▼               ▼                ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │  OPEN   │◄───│  OPEN   │◄───│  OPEN   │◄───│  OPEN   │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘
         │             │               │                │
         │             │               │                │
         └─────────────┴───────────────┴────────────────┘
                                    │
                                    ▼
                            ┌─────────────┐
                            │  CLOSED     │
                            └─────────────┘
```

### Role Permissions Matrix

| Action | Client User | Employee | Support Desk |
|--------|-------------|----------|--------------|
| **Create Ticket** | ✅ | ❌ | ❌ |
| **View Own Tickets** | ✅ | ❌ | ❌ |
| **View All Tickets** | ❌ | ❌ | ✅ |
| **View Ticket Details** | ✅ (own) | ✅ (assigned) | ✅ (all) |
| **Add Comment/Chat** | ✅ | ✅ | ✅ |
| **Add Attachments** | ✅ | ✅ | ✅ |
| **Assign Ticket** | ❌ | ❌ | ✅ |
| **Update Status** | ❌ | ✅ | ✅ |
| **Close Ticket** | ❌ | ✅ | ✅ |
| **View Dashboard** | ❌ | ❌ | ✅ |
| **View Reports** | ❌ | ❌ | ✅ |
| **View Analytics** | ❌ | ❌ | ✅ |

### State Transition Rules

```typescript
// State transition validation rules
const STATE_TRANSITIONS = {
  'open': {
    allowedTo: ['assigned', 'open'],
    allowedBy: ['support_desk', 'employee'],
    requiredFields: ['assigned_to'],
  },
  'assigned': {
    allowedTo: ['in_progress', 'open', 'resolved'],
    allowedBy: ['employee', 'support_desk'],
    requiredFields: [],
  },
  'in_progress': {
    allowedTo: ['resolved', 'open'],
    allowedBy: ['employee', 'support_desk'],
    requiredFields: [],
  },
  'resolved': {
    allowedTo: ['closed', 'open'],
    allowedBy: ['employee', 'support_desk'],
    requiredFields: ['resolution_notes'],
  },
  'closed': {
    allowedTo: [],
    allowedBy: ['employee', 'support_desk'],
    requiredFields: [],
    isFinal: true,
  },
};

// Permission checks
const PERMISSION_CHECKS = {
  create_ticket: ['client_user'],
  view_ticket: (ticket: Ticket, user: User) => {
    if (user.role === 'support_desk') return true;
    if (user.role === 'employee' && ticket.assigned_to === user.id) return true;
    if (user.role === 'client_user' && ticket.customer_id === user.id) return true;
    return false;
  },
  assign_ticket: ['support_desk', 'employee'],
  update_status: ['support_desk', 'employee'],
  close_ticket: ['support_desk', 'employee'],
  add_comment: ['client_user', 'employee', 'support_desk'],
  add_attachment: ['client_user', 'employee', 'support_desk'],
};
```

### SLA Rules

```typescript
const SLA_RULES = {
  urgent: {
    first_response: 1, // hours
    resolution: 4, // hours
  },
  high: {
    first_response: 2, // hours
    resolution: 8, // hours
  },
  medium: {
    first_response: 4, // hours
    resolution: 24, // hours
  },
  low: {
    first_response: 8, // hours
    resolution: 48, // hours
  },
};

// SLA violation check
const checkSLAViolation = (ticket: Ticket): boolean => {
  const sla = SLA_RULES[ticket.priority];
  const hoursSinceCreated = (Date.now() - ticket.created_at) / 3600000;
  
  if (hoursSinceCreated > sla.resolution) {
    return true;
  }
  
  if (!ticket.first_response_at && hoursSinceCreated > sla.first_response) {
    return true;
  }
  
  return false;
};
```

---

## UI Component Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── StatCard/
│   │   │   ├── EmptyState/
│   │   │   ├── PriorityBadge/
│   │   │   ├── StatusBadge/
│   │   │   ├── Table/
│   │   │   └── Modal/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   └── Footer/
│   │   └── tickets/
│   │       ├── TicketForm/
│   │       ├── TicketTable/
│   │       ├── TicketDetail/
│   │       ├── ChatInterface/
│   │       └── AttachmentUpload/
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Tickets/
│   │   ├── CreateTicket/
│   │   └── TicketDetail/
│   ├── hooks/
│   │   ├── useAuth/
│   │   ├── useTicket/
│   │   └── useChat/
│   ├── services/
│   │   ├── authService/
│   │   ├── ticketService/
│   │   ├── commentService/
│   │   └── attachmentService/
│   ├── store/
│   │   └── index.ts
│   └── types/
│       ├── user.ts
│       ├── ticket.ts
│       └── comment.ts
```

---

## Next Steps for Implementation

1. **Complete Dashboard UI** - Add all stat cards with real data
2. **Implement Chat Interface** - Real-time messaging within tickets
3. **Add File Upload** - Implement attachment upload/download
4. **Create Reports Page** - Add analytics and reporting features
5. **Add Notifications** - Email/SMS alerts for ticket updates
6. **Implement Search & Filters** - Advanced ticket search functionality
7. **Add Export Feature** - Export tickets to CSV/PDF
