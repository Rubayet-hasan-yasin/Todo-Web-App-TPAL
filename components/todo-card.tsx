'use client';

import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '@/lib/types';
import { FaEdit } from 'react-icons/fa';

const priorities = {
    extreme: { label: 'High', bg: 'bg-red-100', text: 'text-red-600' },
    moderate: { label: 'Medium', bg: 'bg-green-100', text: 'text-green-600' },
    low: { label: 'Low', bg: 'bg-amber-100', text: 'text-amber-600' },
};

interface TodoCardProps {
    todo: Todo;
    updateTaskDetails: (todo: Todo) => void;
    onDelete: (id: string) => void;
}

export default function TodoCard({ todo, updateTaskDetails, onDelete }: TodoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: todo.id!.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priority = priorities[todo.priority as keyof typeof priorities] || priorities.moderate;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-xl p-5 flex flex-col hover:shadow-lg transition-all duration-200 border border-[#FEE2E2] ${todo.is_completed ? 'opacity-75' : ''
                } ${isDragging ? 'shadow-2xl z-50 rotate-2' : 'shadow-sm'}`}
        >
            <div className="flex items-center justify-between mb-2">

                <h3 className={`font-semibold text-gray-900 text-lg ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.title}
                </h3>

                <div className="flex items-center">
                    <div className={`px-2 py-1 rounded-md text-sm font-medium ${priority.bg} ${priority.text}`}>
                        {priority.label}
                    </div>
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {todo.description && (
                <p className={`text-gray-600 leading-relaxed ${todo.is_completed ? 'line-through text-gray-400' : ''
                    }`}>
                    {todo.description}
                </p>
            )}



            <div className="flex items-center justify-between mt-auto">
                {/* <button
                    onClick={() => onToggleComplete(todo)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${todo.is_completed
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <CheckCircle className="h-4 w-4" />
                    <span>{todo.is_completed ? 'Completed' : 'Mark Complete'}</span>
                </button> */}

                {todo.todo_date && (
                    <div className="">
                        <span className="text-sm text-gray-500">
                            Due {formatDate(todo.todo_date)}
                        </span>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <button
                    onClick={() => updateTaskDetails(todo)}
                     className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaEdit/>
                    </button>
                    <button
                        onClick={() => onDelete(String(todo.id))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}