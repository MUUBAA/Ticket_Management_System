# Component Usage Guide

## Overview
This guide provides comprehensive examples for using all the modern SaaS dashboard components.

---

## 1. StatCard Component

### Import
```typescript
import StatCard from '../../components/common/StatCard/StatCard';
import { TicketIcon } from '@heroicons/react/24/outline';
```

### Basic Usage
```typescript
<StatCard
  title="Total Tickets"
  value={42}
  icon={<TicketIcon className="w-6 h-6" />}
  bgColor="bg-indigo-100"
  textColor="text-indigo-600"
/>
```

### With Trend
```typescript
<StatCard
  title="Open Tickets"
  value={15}
  icon={<ExclamationIcon className="w-6 h-6" />}
  bgColor="bg-red-100"
  textColor="text-red-600"
  trend={{
    value: 12,
    isPositive: false, // Shows ↑ for positive, ↓ for negative
  }}
/>
```

### Color Combinations
```typescript
// Total Tickets
bgColor="bg-indigo-100" textColor="text-indigo-600"

// Open
bgColor="bg-blue-100" textColor="text-blue-600"

// In Progress
bgColor="bg-yellow-100" textColor="text-yellow-600"

// Resolved
bgColor="bg-green-100" textColor="text-green-600"

// High Priority
bgColor="bg-red-100" textColor="text-red-600"
```

### Available Icons (Heroicons)
```typescript
import {
  TicketIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
  ArrowPathIcon,
  BellIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
```

---

## 2. TicketTable Component

### Import
```typescript
import { TicketTable } from '../../components/common/Table';
```

### Basic Usage
```typescript
<TicketTable
  tickets={tickets}
  onRowClick={(ticketId) => navigate(`/tickets/${ticketId}`)}
  isLoading={loading}
/>
```

### Data Structure
```typescript
interface TicketTableRow {
  id: number;
  title: string;
  status: string;  // 'open', 'in_progress', 'resolved', 'closed', 'Assigned'
  priority: string; // 'low', 'medium', 'high', 'urgent'
  created_at: string; // ISO 8601 date string
}
```

### Full Example with Redux
```typescript
const Dashboard: React.FC = () => {
  const { tickets, loading } = useTicket();
  const navigate = useNavigate();

  return (
    <TicketTable
      tickets={tickets}
      onRowClick={(ticketId) => {
        navigate(`/tickets/${ticketId}`);
      }}
      isLoading={loading}
    />
  );
};
```

### Status Values
```
'open', 'Open',
'in_progress', 'InProgress',
'resolved', 'Resolved',
'closed', 'Closed',
'Assigned'
```

### Priority Values
```
'low', 'medium', 'high', 'urgent'
```

---

## 3. Button Component

### Import
```typescript
import Button from '../../components/common/Button/Button';
import { PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
```

### Variants

#### Primary (Default)
```typescript
<Button
  variant="primary"
  onClick={() => navigate('/tickets/new')}
>
  Create Ticket
</Button>
```

#### Secondary
```typescript
<Button variant="secondary">
  Cancel
</Button>
```

#### Ghost
```typescript
<Button variant="ghost">
  Learn More
</Button>
```

#### Danger
```typescript
<Button
  variant="danger"
  onClick={handleDelete}
>
  Delete
</Button>
```

### Sizes

```typescript
// Small
<Button size="sm">Save</Button>

// Medium (Default)
<Button size="md">Create</Button>

// Large
<Button size="lg">Get Started</Button>
```

### With Icons

```typescript
// Icon on left (default)
<Button icon={<PlusIcon className="w-5 h-5" />}>
  New Ticket
</Button>

// Icon on right
<Button icon={<ArrowRightIcon className="w-5 h-5" />} iconPosition="right">
  Continue
</Button>
```

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitForm();
  } finally {
    setIsLoading(false);
  }
};

<Button isLoading={isLoading} onClick={handleSubmit}>
  Save Changes
</Button>
```

### Full Width
```typescript
<Button fullWidth variant="primary">
  Sign In
</Button>
```

### Disabled State
```typescript
<Button disabled>
  Not Available
</Button>
```

### Combining Props
```typescript
<Button
  variant="primary"
  size="lg"
  fullWidth
  icon={<PlusIcon className="w-5 h-5" />}
  onClick={() => handleCreateTicket()}
>
  Create New Ticket
</Button>
```

---

## 4. Navbar Component

### Import
```typescript
import Navbar from '../../components/Navbar';
```

### Features Included
- ✅ Sticky positioning (z-50)
- ✅ Gradient logo badge
- ✅ Navigation links (Dashboard, Tickets)
- ✅ User profile dropdown
  - Shows user name and email
  - Profile link
  - Settings link
  - Logout button
- ✅ Mobile responsive
- ✅ Smooth animations

### Usage in App.tsx
```typescript
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar />
      <main>{/* Your routes here */}</main>
    </>
  );
}
```

### Authentication Integration
The Navbar automatically handles:
- Showing/hiding links based on `isAuthenticated`
- User information display
- Logout functionality
- Dropdown menu interactions

---

## 5. Dashboard Page

### Import
```typescript
import Dashboard from '../../pages/Dashboard/Dashboard';
```

### Features
- ✅ Gradient hero section
- ✅ 5 KPI stat cards
  - Total Tickets
  - Open
  - In Progress
  - Resolved
  - High Priority
- ✅ Recent tickets table
- ✅ Create ticket button
- ✅ Quick stats footer
  - Resolution rate
  - Active tickets count
  - Urgent priority count
- ✅ Loading states
- ✅ Empty states

### Data Flow
```
useTicket() → calculates stats → renders components
    ↓
  Redux state
    ↓
  filters & maps data
    ↓
  displays in StatCards & Table
```

---

## 6. Complete Dashboard Example

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTicket } from '../../hooks/useTicket';
import StatCard from '../../components/common/StatCard/StatCard';
import { TicketTable } from '../../components/common/Table';
import Button from '../../components/common/Button/Button';
import {
  TicketIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { tickets, loading } = useTicket();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-indigo-100 mt-2">Welcome, {user?.name}!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<TicketIcon className="w-6 h-6" />}
            bgColor="bg-indigo-100"
            textColor="text-indigo-600"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            bgColor="bg-green-100"
            textColor="text-green-600"
          />
        </div>

        {/* Section with Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Tickets</h2>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => navigate('/tickets/new')}
          >
            Create Ticket
          </Button>
        </div>

        {/* Table */}
        <TicketTable
          tickets={tickets}
          onRowClick={(id) => navigate(`/tickets/${id}`)}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 7. Styling Guidelines

### Card Container
```typescript
className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
```

### Section Title
```typescript
className="text-2xl font-bold text-gray-900"
```

### Subsection Title
```typescript
className="text-lg font-semibold text-gray-900"
```

### Description Text
```typescript
className="text-gray-500 text-sm"
```

### Container Max Width
```typescript
className="max-w-7xl mx-auto px-4"
```

### Grid Layout
```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
```

### Flex Centering
```typescript
className="flex items-center justify-center"
```

---

## 8. Common Patterns

### Loading Spinner
```typescript
{isLoading ? (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
) : (
  <YourContent />
)}
```

### Error Alert
```typescript
{error && (
  <Alert
    type="error"
    title="Error"
    message={error}
    onClose={() => setError(null)}
    dismissible
  />
)}
```

### Success Alert
```typescript
{success && (
  <Alert
    type="success"
    title="Success"
    message="Ticket created successfully!"
    onClose={() => setSuccess(false)}
  />
)}
```

### Empty State
```typescript
{tickets.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12">
    <TicketIcon className="w-12 h-12 text-gray-400 mb-3" />
    <p className="text-gray-500 font-medium">No tickets yet</p>
    <p className="text-sm text-gray-400">Create your first ticket to get started</p>
  </div>
) : (
  <TicketTable tickets={tickets} />
)}
```

---

## 9. Accessibility Tips

### Always Include:
- Proper semantic HTML (`<button>`, `<table>`, etc.)
- ARIA labels for icons: `aria-label="create ticket"`
- Role attributes: `role="alert"`, `role="status"`
- Focus management
- Keyboard navigation support

### Example:
```typescript
<button
  aria-label="Create new ticket"
  className="p-2 hover:bg-gray-100"
  onClick={handleCreate}
>
  <PlusIcon className="w-6 h-6" />
</button>
```

---

## 10. Performance Tips

1. **Use React.memo for components**
```typescript
export default React.memo(StatCard);
```

2. **Lazy load routes**
```typescript
const Dashboard = lazy(() => import('./Dashboard'));
```

3. **Optimize re-renders**
```typescript
const memoizedTickets = useMemo(() => tickets.slice(0, 10), [tickets]);
```

4. **Use useCallback for handlers**
```typescript
const handleRowClick = useCallback((id) => {
  navigate(`/tickets/${id}`);
}, [navigate]);
```

---

## 11. Troubleshooting

### Tailwind classes not applied
- Ensure all files are in `content` array in `tailwind.config.ts`
- Run `npm run dev` to rebuild
- Clear browser cache

### Icons not showing
- Verify Heroicons import path
- Check icon name spelling
- Ensure class names are correct (`w-6 h-6`)

### Responsive layout broken
- Test with `md:` and `lg:` prefixes
- Use responsive grid classes
- Check viewport width breakpoints

---

## Next Steps

1. **Integrate More Icons** - Explore Heroicons library
2. **Add Dark Mode** - Use Tailwind dark: prefix
3. **Create Animations** - Use Tailwind animations or Framer Motion
4. **Build Charts** - Integrate Recharts or Chart.js
5. **Add More Components** - Modal, Tooltip, Pagination

Enjoy your modern SaaS dashboard! 🚀
