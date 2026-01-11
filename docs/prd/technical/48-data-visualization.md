# PRD: Data Visualization

## Overview
Implement comprehensive data visualization capabilities using Chart.js and Recharts, enabling rich analytics dashboards, real-time metrics displays, and performance monitoring throughout Bottleneck-Bots. This system provides users with actionable insights through intuitive visual representations of bot performance, workflow analytics, and system health.

## Problem Statement
Raw data and tables are insufficient for understanding trends, patterns, and anomalies. Users need visual representations to:
- Quickly assess bot and workflow performance
- Identify trends and patterns over time
- Compare metrics across different entities
- Monitor real-time system health
- Make data-driven decisions about automation optimization

Without proper visualization, users struggle to extract value from the data Bottleneck-Bots generates.

## Goals & Objectives
- **Primary Goals**
  - Provide interactive, responsive charts for all key metrics
  - Enable real-time data updates without page refresh
  - Support multiple chart types for different data patterns
  - Ensure accessibility for all visualization components
  - Create reusable chart components for consistent data display

- **Success Metrics**
  - Dashboard load time < 2 seconds with 10+ charts
  - 90% of key metrics have visual representation
  - Real-time updates with < 1 second latency
  - 100% chart accessibility compliance

## User Stories
- As a user, I want to see bot performance trends so that I can identify issues quickly
- As a user, I want to compare metrics across bots so that I can optimize my automation
- As a user, I want real-time charts so that I can monitor active workflows
- As an admin, I want system health dashboards so that I can ensure platform stability
- As a developer, I want reusable chart components so that I can add visualizations efficiently
- As a user, I want to export chart data so that I can share insights with my team
- As a user with visual impairments, I want accessible charts so that I can understand the data

## Functional Requirements

### Must Have (P0)
- **Line Charts**: Time-series data for trends (bot runs, errors, response times)
- **Bar Charts**: Categorical comparisons (bot performance, task completion)
- **Pie/Donut Charts**: Distribution display (success/failure ratios, resource usage)
- **Area Charts**: Cumulative data visualization (API usage over time)
- **Responsive Design**: Charts adapt to container size and viewport
- **Tooltips**: Interactive data point details on hover
- **Legends**: Toggleable series legends for multi-line charts
- **Loading States**: Skeleton placeholders while data loads
- **Empty States**: Meaningful display when no data is available

### Should Have (P1)
- **Real-Time Updates**: Live data streaming to charts
- **Date Range Selector**: Filter chart data by time period
- **Zoom/Pan**: Interactive exploration of dense data
- **Data Export**: Download chart data as CSV/JSON
- **Chart Export**: Save charts as PNG/SVG images
- **Annotations**: Highlight events/incidents on timeline charts
- **Comparison Mode**: Overlay multiple time periods
- **Threshold Lines**: Visual indicators for limits/goals
- **Sparklines**: Compact inline charts for tables/cards

### Nice to Have (P2)
- **Heatmaps**: Activity density visualization
- **Sankey Diagrams**: Workflow path visualization
- **Gauges**: Real-time metric displays
- **Geographical Maps**: Location-based data visualization
- **Custom Chart Builder**: User-defined chart configurations
- **Anomaly Detection**: Visual highlighting of unusual patterns
- **Predictive Trends**: ML-based trend forecasting visualization
- **Embeddable Charts**: Share charts via embed codes

## Non-Functional Requirements

### Performance
- Initial chart render < 500ms
- Real-time update latency < 1 second
- Support 10,000+ data points per chart
- Dashboard with 10+ charts loads < 2 seconds
- Smooth 60fps interactions (zoom, pan, hover)

### Accessibility
- Charts have text alternatives (data tables)
- Color schemes consider color blindness
- Keyboard navigation for interactive elements
- Screen reader descriptions for chart summaries
- High contrast mode support

### Scalability
- Handle 100+ distinct chart instances
- Efficient memory management for large datasets
- Support real-time streams for 50+ concurrent users

## Technical Requirements

### Architecture
```
/src/features/charts/
  ├── components/
  │   ├── line-chart.tsx           # Time series visualization
  │   ├── bar-chart.tsx            # Categorical comparison
  │   ├── pie-chart.tsx            # Distribution display
  │   ├── area-chart.tsx           # Cumulative visualization
  │   ├── sparkline.tsx            # Compact inline chart
  │   ├── chart-container.tsx      # Wrapper with loading/empty states
  │   ├── chart-legend.tsx         # Interactive legend
  │   ├── chart-tooltip.tsx        # Hover tooltip
  │   └── date-range-picker.tsx    # Time period selector
  ├── hooks/
  │   ├── use-chart-data.ts        # Data fetching/formatting
  │   ├── use-real-time-chart.ts   # WebSocket data streaming
  │   ├── use-chart-export.ts      # Export functionality
  │   └── use-responsive-chart.ts  # Container size handling
  ├── lib/
  │   ├── chart-theme.ts           # Consistent styling
  │   ├── formatters.ts            # Number/date formatting
  │   ├── colors.ts                # Color palette definitions
  │   └── chart-utils.ts           # Data transformation utilities
  └── presets/
      ├── bot-performance.tsx      # Pre-configured bot metrics
      ├── workflow-analytics.tsx   # Workflow visualizations
      └── system-health.tsx        # System monitoring charts
```

### Chart Component Pattern
```typescript
// Reusable line chart component using Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesChartProps {
  data: DataPoint[];
  series: SeriesConfig[];
  dateRange?: DateRange;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  onDataPointClick?: (point: DataPoint) => void;
}

export function TimeSeriesChart({
  data,
  series,
  height = 300,
  showLegend = true,
  showGrid = true,
  onDataPointClick,
}: TimeSeriesChartProps) {
  const theme = useChartTheme();

  return (
    <ChartContainer
      height={height}
      isEmpty={data.length === 0}
      emptyMessage="No data available for this time period"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.gridColor}
            />
          )}
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => formatDate(value, 'short')}
            stroke={theme.axisColor}
          />
          <YAxis
            tickFormatter={(value) => formatNumber(value)}
            stroke={theme.axisColor}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: theme.cursorColor }}
          />
          {showLegend && <Legend />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, onClick: onDataPointClick }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Chart container with loading/empty states
function ChartContainer({
  height,
  isEmpty,
  isLoading,
  emptyMessage,
  children
}) {
  if (isLoading) {
    return <ChartSkeleton height={height} />;
  }

  if (isEmpty) {
    return (
      <div
        className="flex items-center justify-center bg-muted/30 rounded-lg"
        style={{ height }}
      >
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <div style={{ height }}>{children}</div>;
}
```

### Real-Time Chart Hook
```typescript
// WebSocket-based real-time data streaming
function useRealTimeChart<T>(
  channel: string,
  options: {
    maxDataPoints?: number;
    updateInterval?: number;
    transform?: (raw: unknown) => T;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const { maxDataPoints = 100, transform = identity } = options;

  useEffect(() => {
    const socket = subscribeToChannel(channel);

    socket.on('data', (rawData) => {
      const point = transform(rawData);
      setData((prev) => {
        const updated = [...prev, point];
        // Keep only the most recent points
        return updated.slice(-maxDataPoints);
      });
    });

    return () => socket.disconnect();
  }, [channel, maxDataPoints, transform]);

  return { data, isConnected: socket.connected };
}

// Usage
const { data } = useRealTimeChart('bot:123:metrics', {
  maxDataPoints: 60, // Last 60 data points
  transform: (raw) => ({
    timestamp: raw.ts,
    successRate: raw.success / (raw.success + raw.failure),
    avgDuration: raw.totalDuration / raw.count,
  }),
});
```

### Chart Theme System
```typescript
// Consistent theming across all charts
const chartTheme = {
  colors: {
    primary: ['#3b82f6', '#60a5fa', '#93c5fd'], // Blues
    success: ['#22c55e', '#4ade80', '#86efac'], // Greens
    warning: ['#f59e0b', '#fbbf24', '#fcd34d'], // Ambers
    error: ['#ef4444', '#f87171', '#fca5a5'],   // Reds
    neutral: ['#6b7280', '#9ca3af', '#d1d5db'], // Grays
  },

  // Color-blind friendly palette
  accessibleColors: [
    '#0077b6', // Blue
    '#e63946', // Red
    '#2a9d8f', // Teal
    '#e9c46a', // Yellow
    '#9b5de5', // Purple
  ],

  light: {
    background: '#ffffff',
    gridColor: '#e5e7eb',
    axisColor: '#6b7280',
    textColor: '#1f2937',
    cursorColor: '#3b82f6',
  },

  dark: {
    background: '#1f2937',
    gridColor: '#374151',
    axisColor: '#9ca3af',
    textColor: '#f3f4f6',
    cursorColor: '#60a5fa',
  },
};

// Theme-aware hook
function useChartTheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? chartTheme.dark : chartTheme.light;
}
```

### Pre-built Dashboard Charts
```typescript
// Bot performance dashboard preset
export function BotPerformanceChart({ botId, dateRange }: Props) {
  const { data, isLoading } = api.analytics.botMetrics.useQuery({
    botId,
    startDate: dateRange.start,
    endDate: dateRange.end,
    granularity: 'hour',
  });

  const series = [
    { key: 'successRate', label: 'Success Rate', color: '#22c55e' },
    { key: 'avgDuration', label: 'Avg Duration (ms)', color: '#3b82f6' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Performance</CardTitle>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </CardHeader>
      <CardContent>
        <TimeSeriesChart
          data={data ?? []}
          series={series}
          isLoading={isLoading}
          height={300}
        />
      </CardContent>
    </Card>
  );
}
```

### Dependencies
- `recharts` (v2) - Primary charting library (React-native, composable)
- `chart.js` + `react-chartjs-2` - Alternative for specific chart types
- `date-fns` - Date formatting
- `d3-scale` - Scale utilities (if needed for custom charts)
- WebSocket client for real-time data

### APIs & Integrations
```typescript
// tRPC analytics endpoints
export const analyticsRouter = router({
  botMetrics: protectedProcedure
    .input(z.object({
      botId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      granularity: z.enum(['minute', 'hour', 'day']),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.db.query.botRuns.findMany({
        where: and(
          eq(botRuns.botId, input.botId),
          between(botRuns.startedAt, input.startDate, input.endDate)
        ),
        // Aggregate by granularity...
      });
    }),

  systemHealth: protectedProcedure
    .query(async ({ ctx }) => {
      // Return system metrics for dashboard
    }),
});
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Chart render time | < 500ms | Performance monitoring |
| Dashboard load time | < 2s with 10+ charts | User timing API |
| Real-time latency | < 1s | WebSocket event timing |
| Accessibility compliance | 100% | Automated + manual testing |
| Chart component reuse | 80%+ coverage | Component usage analysis |

## Dependencies
- Analytics data pipeline (metrics collection)
- WebSocket infrastructure (real-time updates)
- Theme system (chart colors)
- Date/time utilities

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Large dataset performance | High - Slow/frozen UI | Data aggregation; virtualization; sampling |
| Real-time memory leaks | High - Browser crash | Proper cleanup; data window limits |
| Accessibility compliance | High - Exclusion | Data tables as alternatives; ARIA labels |
| Chart library bundle size | Medium - Slow load | Tree-shaking; code splitting by chart type |
| Inconsistent styling across chart libs | Medium - Visual mismatch | Unified theme system; wrapper components |
| Mobile responsiveness issues | Medium - Poor mobile UX | Responsive containers; touch-friendly tooltips |
