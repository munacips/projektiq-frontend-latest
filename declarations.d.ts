declare module 'react-frappe-gantt' {
    import * as React from 'react';
  
    export interface Task {
      id: string;
      name: string;
      start: string;
      end: string;
      progress: number;
      dependencies?: string;
      custom_class?: string;
    }
  
    export interface GanttProps {
      tasks: Task[];
      viewMode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
      onClick?: (task: Task) => void;
      onDateChange?: (task: Task, start: Date, end: Date) => void;
      onProgressChange?: (task: Task, progress: number) => void;
      onViewChange?: (mode: string) => void;
    }
  
    export const Gantt: React.FC<GanttProps>;
  }
  