# Swarm Coordination View

A comprehensive React component for real-time swarm coordination visualization and control.

## Components

### SwarmView.tsx

Main component providing:

#### Visual Features
- **Swarm Overview Card**: Real-time status, progress tracking, and key metrics
- **Agent Visualization**: Visual representation of all agents with health indicators
- **Task Queue Display**: Prioritized task list with status badges
- **Health Monitoring**: System-wide health metrics and resource usage
- **Performance Metrics**: Throughput, latency, efficiency, and utilization
- **Communication Flow**: Visual representation of agent-to-agent communication
- **Queue Status**: Real-time task queue statistics

#### Interactive Controls
- **Start/Stop Swarm**: Control swarm execution
- **Pause/Resume Monitoring**: Toggle auto-refresh
- **Refresh Data**: Manual data refresh
- **Add Agent**: Spawn new agents (placeholder)
- **Redistribute Tasks**: Rebalance task distribution (placeholder)
- **Swarm Selector**: Switch between multiple active swarms

#### Real-time Updates
- Auto-refresh with configurable interval (default: 2000ms)
- Pause/resume capability for monitoring
- tRPC subscription integration
- Optimistic UI updates

#### Metrics Displayed

**Agent Metrics:**
- Active/Idle/Error status counts
- Health percentage
- Current workload
- Tasks completed
- Agent type and capabilities

**Task Metrics:**
- Priority distribution (Critical/High/Normal/Low/Background)
- Status distribution (Running/Queued/Completed/Failed/etc.)
- Task descriptions and requirements
- Execution progress

**System Metrics:**
- Overall health score
- CPU/Memory/Disk usage
- Throughput (tasks/min)
- Average latency
- Success rate
- Efficiency percentage
- Agent utilization

**Queue Metrics:**
- Total tasks in queue
- Pending tasks
- Processing tasks
- Completed/Failed counts

## Usage

```tsx
import { SwarmView } from '@/components/swarm/SwarmView';

// Basic usage - auto-selects first active swarm
<SwarmView />

// With specific swarm ID
<SwarmView swarmId="my-swarm-id" />

// With custom refresh interval (5 seconds)
<SwarmView refreshInterval={5000} />

// Disable auto-refresh
<SwarmView autoRefresh={false} />

// With custom styling
<SwarmView className="my-custom-class" />
```

## tRPC Integration

The component uses the following tRPC endpoints:

- `swarm.listActive` - Get all active swarms
- `swarm.getStatus` - Get detailed swarm status
- `swarm.getHealth` - Get system health metrics
- `swarm.getMetrics` - Get performance metrics
- `swarm.getQueueStatus` - Get task queue status
- `swarm.stop` - Stop a swarm
- `swarm.start` - Start a swarm

## Component Architecture

### Main Components

- **SwarmView**: Main container component
- **StatusBadge**: Displays swarm status with appropriate icon
- **MetricCard**: Reusable metric display card
- **AgentCard**: Individual agent status card
- **TaskCard**: Individual task status card
- **PriorityBadge**: Task priority indicator
- **HealthMetric**: Health metric with progress bar

### Layout

3-column responsive grid:
- **Left 2 columns**: Overview, controls, agent list, task queue
- **Right column**: Health monitoring, performance metrics, queue status, communication flow

### Styling

- Uses shadcn/ui components (Card, Badge, Button, Progress, etc.)
- Tailwind CSS for styling
- Responsive design with mobile-first approach
- Accessible with proper ARIA labels and semantic HTML
- Smooth animations and transitions

## Testing

Comprehensive test suite in `SwarmView.test.tsx`:

### Test Coverage

- **Rendering**: Component display and layout
- **Agent Visualization**: Agent status, health, workload
- **Task Queue**: Task display, priorities, status
- **Health Monitoring**: System health and resources
- **Performance Metrics**: All metric calculations
- **User Interactions**: Start/stop, pause/resume, refresh
- **Auto-refresh**: Interval configuration and pausing
- **Edge Cases**: No agents/tasks, loading states
- **Accessibility**: ARIA labels, semantic structure
- **Custom Props**: swarmId, className, intervals

### Running Tests

```bash
# Run all tests
npm test

# Run swarm tests only
npm test SwarmView

# Run with coverage
npm test -- --coverage
```

## Future Enhancements

Potential improvements:

1. **Real-time Communication Graph**: Visual network diagram of agent communication
2. **Agent Performance Comparison**: Side-by-side agent metrics
3. **Task Dependency Visualization**: Graph view of task dependencies
4. **Historical Metrics**: Charts showing metrics over time
5. **Alert System**: Notifications for critical events
6. **Agent Spawning**: UI for configuring and spawning new agents
7. **Task Creation**: Form for creating new tasks
8. **Filtering & Search**: Filter agents/tasks by type, status, etc.
9. **Export Functionality**: Export metrics and reports
10. **WebSocket Integration**: Real-time push updates instead of polling

## Accessibility

- Keyboard navigation support
- ARIA labels for interactive elements
- Semantic HTML structure
- Color contrast compliance
- Screen reader friendly
- Focus management

## Performance

- Optimized re-renders with React.useMemo
- Efficient data transformations
- Configurable refresh intervals
- Pause capability to reduce load
- Lazy loading for large lists (ScrollArea)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Dependencies

- React 18+
- tRPC
- Radix UI primitives
- Tailwind CSS
- Lucide React (icons)
- class-variance-authority
