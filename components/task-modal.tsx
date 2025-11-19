'use client';

import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Todo } from '../lib/types';
import { FiTrash } from 'react-icons/fi';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Todo, 'id' | 'is_completed'>) => void;
  isCreating: boolean;
  task: Todo;
  setTask: React.Dispatch<React.SetStateAction<Todo>>;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  task,
  setTask
}: TaskModalProps) {

console.log(task);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(task);
    setTask({
      title: '',
      description: '',
      todo_date: '',
      priority: 'moderate'
    });
  };


  const handleGoBack = () => {
    onClose();
    setTask({
      title: '',
      description: '',
      todo_date: '',
      priority: 'moderate'
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                    {task.id ? 'Edit Task' : 'Add New Task'}
                    <hr className='text-blue-500 w-8/12' />
                  </DialogTitle>
                  <button
                    onClick={handleGoBack}
                    className="text-gray-800 hover:text-gray-600 text-sm font-semibold border-b"
                  >
                    Go Back
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => setTask({ ...task, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder=""
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={task.todo_date}
                        onChange={(e) => setTask({ ...task, todo_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                        style={{
                          colorScheme: 'light',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                        onClick={(e) => {
                          e.currentTarget?.showPicker?.();
                        }}
                      // onFocus={(e) => {
                      //   e.currentTarget.showPicker?.();
                      // }}
                      />

                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Priority
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="priority"
                          value="extreme"
                          checked={task.priority === 'extreme'}
                          onChange={(e) => setTask({ ...task, priority: e.target.value as 'extreme' | 'moderate' | 'low' })}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          Extreme
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="priority"
                          value="moderate"
                          checked={task.priority === 'moderate'}
                          onChange={(e) => setTask({ ...task, priority: e.target.value as 'extreme' | 'moderate' | 'low' })}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Moderate
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="priority"
                          value="low"
                          checked={task.priority === 'low'}
                          onChange={(e) => setTask({ ...task, priority: e.target.value as 'extreme' | 'moderate' | 'low' })}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          Low
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Task Description
                    </label>
                    <textarea
                      value={task.description}
                      onChange={(e) => setTask({ ...task, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder:text-sm"
                      placeholder="Start writing here..."
                      rows={4}
                    />
                  </div>





                  <div className="flex justify-between pt-6">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border-0 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {isCreating ? 'Creating...' : task.id ? 'Update Task' : 'Done'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="w-8 h-8 flex items-center justify-center text-white bg-red-500 border-0 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      <FiTrash />

                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}