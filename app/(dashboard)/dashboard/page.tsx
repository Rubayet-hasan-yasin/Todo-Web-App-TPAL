'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api-service';
import { Todo, CreateTodoRequest, TodoFilters } from '@/lib/types';
import TodoCard from '@/components/todo-card';
import TaskModal from '@/components/task-modal';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { LuArrowUpDown } from 'react-icons/lu';
import moment from 'moment';
import Swal from 'sweetalert2';



const sortOptions = [
  { id: "today", label: "Deadline Today" },
  { id: "5days", label: "Expires in 5 days" },
  { id: "10days", label: "Expires in 10 days" },
  { id: "30days", label: "Expires in 30 days" },
];

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);

  const [task, setTask] = useState<Todo>({
    id: undefined,
    title: '',
    description: '',
    todo_date: '',
    priority: 'moderate'
  });

  const { user } = useAuth();




  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadTodos = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const filters: TodoFilters = {
        search: searchTerm || undefined,
      };
      const response = await apiService.getTodos(filters);
      setTodos(response.results || []);
    } catch {
      toast.error('Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, [user, searchTerm]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateOrUpdateTask = async (newTask: Todo) => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    console.log(newTask);

    try {
      setIsCreating(true);
      if (newTask.id) {
        // Update existing task
        await apiService.updateTodo(newTask.id, {
          title: newTask.title,
          description: newTask.description || '',
          todo_date: newTask.todo_date || '',
          priority: newTask.priority,
        });
        toast.success('Task updated successfully!');
      } else {
        // Create new task
        const taskData: CreateTodoRequest = {
          title: newTask.title,
          description: newTask.description || '',
          todo_date: newTask.todo_date || '',
          priority: newTask.priority,
        };

        await apiService.createTodo(taskData);
        toast.success('Task created successfully!');

      }
    } catch (error) {
      console.error('Error creating/updating task:', error);
      toast.error('Failed to create/update task');
    } finally {
      setIsCreating(false);
      setIsModalOpen(false);
      loadTodos();
    }
  };

  // const handleToggleComplete = async (todo: Todo) => {
  //   try {
  //     if (!todo.id) throw new Error('Todo ID is missing');
  //     await apiService.updateTodo(todo.id, {
  //       is_completed: !todo.is_completed,
  //     });
  //     toast.success(todo.is_completed ? 'Task marked as incomplete' : 'Task completed!');
  //     loadTodos();
  //   } catch {
  //     toast.error('Failed to update task');
  //   }
  // };

  const handleDeleteTask = async (taskId: string) => {
    const result = await Swal.fire({
      title: 'Delete Task?',
      text: 'Are you sure you want to delete this task? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2 font-medium',
        cancelButton: 'rounded-lg px-4 py-2 font-medium'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.deleteTodo(Number(taskId));
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Task has been deleted successfully.',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-xl'
        }
      });
      
      loadTodos();
    } catch {
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete task. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-xl',
          confirmButton: 'rounded-lg px-4 py-2 font-medium'
        }
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      
      const oldIndex = todos.findIndex((item) => item.id!.toString() === active.id);
      const newIndex = todos.findIndex((item) => item.id!.toString() === over?.id);

      const draggedTodo = todos[oldIndex];
      const targetTodo = todos[newIndex];


      setTodos((items) => {
        return arrayMove(items, oldIndex, newIndex);
      });

      try {
        await apiService.updateTodo(draggedTodo.id!, {
          position: targetTodo.position
        });
        await apiService.updateTodo(targetTodo.id!, {
          position: draggedTodo.position
        });

      } catch (error) {
        setTodos((items) => {
          return arrayMove(items, newIndex, oldIndex);
        });
        toast.error('Failed to update task order');
        console.error('Error updating todo positions:', error);
      }


    }
  };


  const getDateFilterRange = () => {
    switch (selectedSort) {
      case "today":
        return 0;
      case "5days":
        return 5;
      case "10days":
        return 10;
      case "30days":
        return 30;
      default:
        return null;
    }
  };


  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (todo.description &&
        todo.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const days = getDateFilterRange();

    
    if (days === null) return matchesSearch;

    const today = moment().startOf("day");
    const todoDate = moment(todo.todo_date).startOf("day");

    const diffDays = todoDate.diff(today, "days");

    // Date filter logic
    let matchesDate = false;

    if (days === 0) {
      matchesDate = diffDays === 0; // Today
    } else {
      matchesDate = diffDays >= 0 && diffDays <= days;
    }

    return matchesSearch && matchesDate;
  });

  const updateTaskDetails = (item: Todo) => {
    setIsModalOpen(true);
    console.log(item);
    setTask({
      id: item.id,
      title: item.title,
      description: item.description,
      todo_date: item.todo_date,
      priority: item.priority
    });
  }

  return (
    <div className="md:p-6 p-3 md:pt-4">
      <div className="space-y-4">
        <div className='flex justify-between'>
          <p className='text-3xl font-bold border-b-2 border-blue-500 w-fit'>Todos</p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Task
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center ">
          <div className="flex flex-row md:gap-4 gap-2 items-start sm:items-center flex-1 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search your task here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-[#D1D5DB] rounded-xl focus:ring focus:ring-blue-500 focus:bg-white transition-all focus:outline-0"
              />
              <button className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>

            <div className='relative'>
              <button
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="md:ml-12 w-full sm:w-38 cursor-default rounded-xl bg-gray-50 py-2 pl-4 pr-10 text-left border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
                <span className="block truncate text-gray-700">Sort by</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <LuArrowUpDown className="h-5 w-5 text-gray-400" />
                </span>
              </button>

              <div className={`absolute right-0 border border-gray-300 rounded p-2 w-full mt-2 bg-white shadow-sm ${isSelectOpen ? '' : 'hidden'}`}>
                <p className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-300">Date</p>

                <div className="space-y-2">
                  {sortOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSort === opt.id}
                        onChange={() =>
                          setSelectedSort(selectedSort === opt.id ? null : opt.id)
                        }
                        className="h-4 w-4 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>


        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Tasks</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredTodos.length === 0 ? (
        searchTerm ? (
          <div className='text-center'>
            <div className="text-gray-400 text-xl mb-3">No tasks found</div>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className='relative mx-auto w-fit'>
              <Image
                src={'/images/icon-no projects.svg'}
                alt="No Todos"
                width={250}
                height={250}
                className=''
              />
              <div
                title='Add Todo'
                className='size-14 absolute bottom-0 right-0 cursor-pointer'
                onClick={() => setIsModalOpen(true)}
              ></div>
            </div>
            <div className="text-gray-400 text-2xl mb-3">No todos yet</div>
          </div>
        )
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTodos.map(todo => todo.id!.toString())}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  updateTaskDetails={updateTaskDetails}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        isCreating={isCreating}
        task={task}
        setTask={setTask}
      />
    </div>
  );
}