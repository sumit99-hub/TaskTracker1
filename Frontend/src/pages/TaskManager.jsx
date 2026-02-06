import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api, API_BASE_URL } from '../lib/api';

const socket = io.connect(API_BASE_URL);

const columns = ['To do', 'In progress', 'Closed'];

const TaskManager = ({ tasks, setTasks, transparency = 1 }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentsByTask, setCommentsByTask] = useState(() => {
    const stored = localStorage.getItem('task:comments');
    return stored ? JSON.parse(stored) : {};
  });
  const [commentAuthor, setCommentAuthor] = useState('Admin');

  useEffect(() => {
    const handleRemoteMove = (updatedTasks) => {
      if (Array.isArray(updatedTasks)) {
        setTasks(updatedTasks);
      }
    };

    socket.on('receive_task_move', handleRemoteMove);

    return () => {
      socket.off('receive_task_move', handleRemoteMove);
    };
  }, [setTasks]);

  useEffect(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setCommentAuthor(parsed.name || parsed.accessLevel || 'Admin');
    }
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);

    reorderedItem.status = result.destination.droppableId;
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
    socket.emit('task_moved', items);

    try {
      await api.patch(`/api/tasks/${reorderedItem._id}`, {
        status: reorderedItem.status,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setCommentText('');
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
    setCommentText('');
  };

  const persistComments = (nextComments) => {
    setCommentsByTask(nextComments);
    localStorage.setItem('task:comments', JSON.stringify(nextComments));
  };

  const handleAddComment = (event) => {
    event.preventDefault();
    if (!selectedTask) return;
    const trimmed = commentText.trim();
    if (!trimmed) {
      toast.error('Please enter a comment.');
      return;
    }

    const nextEntry = {
      id: `tc-${Date.now()}`,
      author: commentAuthor || 'Admin',
      message: trimmed,
      time: new Date().toLocaleString(),
    };

    const existing = commentsByTask[selectedTask._id] || [];
    const nextComments = {
      ...commentsByTask,
      [selectedTask._id]: [nextEntry, ...existing],
    };
    persistComments(nextComments);
    setCommentText('');
    toast.success('Comment added.');
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {columns.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided) => (
              <motion.div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="w-64 bg-gray-100/90 p-4 rounded-2xl backdrop-blur"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                style={{ opacity: transparency }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">{col}</h3>
                  <span className="text-xs text-gray-500">
                    {tasks.filter((task) => task.status === col).length}
                  </span>
                </div>
                {tasks
                  .filter((task) => task.status === col)
                  .map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <motion.button
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="w-full text-left bg-white/90 p-4 mb-2 shadow rounded-2xl hover:shadow-md transition backdrop-blur"
                          onClick={() => handleOpenTask(task)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          style={{ opacity: transparency }}
                        >
                          <p className="text-sm font-semibold">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Priority: {task.priority}</p>
                        </motion.button>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </motion.div>
            )}
          </Droppable>
        ))}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseTask}
          >
            <motion.div
              className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                  <p className="text-sm text-gray-500">
                    Priority: {selectedTask.priority} · Status: {selectedTask.status}
                  </p>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={handleCloseTask}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">Admin Comments</p>
                <p className="text-xs text-gray-500 mt-1">
                  Add notes for the assignee and leadership.
                </p>

                <form className="mt-4 flex gap-3" onSubmit={handleAddComment}>
                  <input
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
                    placeholder="Share guidance, blockers, or approvals..."
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                  />
                  <motion.button
                    type="submit"
                    className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Post
                  </motion.button>
                </form>

                <div className="mt-4 space-y-3">
                  {(commentsByTask[selectedTask._id] || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No comments yet.</p>
                  ) : (
                    commentsByTask[selectedTask._id].map((comment) => (
                      <motion.div
                        key={comment.id}
                        className="rounded-2xl border border-gray-100 p-3 text-sm"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{comment.author}</span>
                          <span>{comment.time}</span>
                        </div>
                        <p className="text-gray-700 mt-2">{comment.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DragDropContext>
  );
};

export default TaskManager;
