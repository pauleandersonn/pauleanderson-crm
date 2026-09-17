
import React, { useState } from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, CalendarCheck } from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onToggleTask, onAddTask }) => {
  const [newTitle, setNewTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddTask(newTitle);
      setNewTitle('');
    }
  };

  const pending = tasks.filter(t => t.status === 'pending');
  const done = tasks.filter(t => t.status === 'done');

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Checklist de Cuidado</h2>
          <p className="text-xs text-slate-500">Organize as tarefas diárias do cuidador</p>
        </div>
        <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
          <CalendarCheck className="w-6 h-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <input 
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Adicionar nova tarefa..."
          className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
        />
        <button 
          type="submit"
          className="absolute right-2 top-2 p-1.5 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-6">
        {/* Pending */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Pendentes <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">{pending.length}</span>
          </h3>
          <div className="space-y-2">
            {pending.map(task => (
              <TaskItem key={task.id} task={task} onToggle={() => onToggleTask(task.id)} />
            ))}
            {pending.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm italic">Tudo pronto! Nenhuma tarefa pendente.</p>
            )}
          </div>
        </div>

        {/* Done */}
        {done.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Concluídas <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">{done.length}</span>
            </h3>
            <div className="space-y-2 opacity-60">
              {done.map(task => (
                <TaskItem key={task.id} task={task} onToggle={() => onToggleTask(task.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task; onToggle: () => void }> = ({ task, onToggle }) => (
  <button 
    onClick={onToggle}
    className="w-full flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl text-left hover:border-emerald-200 transition-all shadow-sm active:scale-[0.98]"
  >
    {task.status === 'done' ? (
      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
    ) : (
      <Circle className="w-6 h-6 text-slate-300" />
    )}
    <span className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
      {task.title}
    </span>
  </button>
);

export default TasksView;
