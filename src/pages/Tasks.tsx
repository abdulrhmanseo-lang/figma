import { useState } from 'react';
import { useData } from '../context/DataContext';

import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus, Search, Trash2, Calendar,
    User, ArrowLeftRight, CheckCircle2, Clock, AlertCircle, X
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types/database';

const statusLabels: Record<TaskStatus, string> = {
    pending: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ',
    review: 'مراجعة',
    completed: 'مكتملة',
    cancelled: 'ملغية',
};

const statusColors: Record<TaskStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    review: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const priorityLabels: Record<TaskPriority, string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
};

const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
};

export function Tasks() {
    const { tasks, employees, addTask, updateTaskStatus, deleteTask, transferTask } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

    // Form state for new task
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as TaskPriority,
        assignedTo: '',
        dueDate: new Date().toISOString().split('T')[0],
    });

    // Transfer form state
    const [transferTo, setTransferTo] = useState('');
    const [transferNote, setTransferNote] = useState('');

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.includes(searchQuery) ||
            task.description.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emp = employees.find(e => e.id === formData.assignedTo);
        if (!emp) return;

        addTask({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: 'pending',
            assignedTo: formData.assignedTo,
            assignedToName: emp.fullName,
            createdBy: 'emp-1', // Admin
            createdByName: 'أحمد محمد الأدمن',
            dueDate: formData.dueDate,
        });
        setShowModal(false);
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            assignedTo: '',
            dueDate: new Date().toISOString().split('T')[0],
        });
    };

    const handleTransfer = () => {
        if (!selectedTask || !transferTo) return;
        const emp = employees.find(e => e.id === transferTo);
        if (!emp) return;

        transferTask(selectedTask.id, transferTo, emp.fullName, transferNote);
        setShowTransferModal(false);
        setTransferTo('');
        setTransferNote('');
        setSelectedTask(null);
    };

    const handleStatusChange = (taskId: string, status: TaskStatus) => {
        updateTaskStatus(taskId, status);
    };

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            deleteTask(id);
        }
    };

    const tasksByStatus: Record<'pending' | 'in_progress' | 'review' | 'completed', Task[]> = {
        pending: filteredTasks.filter(t => t.status === 'pending'),
        in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
        review: filteredTasks.filter(t => t.status === 'review'),
        completed: filteredTasks.filter(t => t.status === 'completed'),
    };

    const TaskCard = ({ task }: { task: Task }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4 mb-3 hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-brand-dark text-sm">{task.title}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                </span>
            </div>

            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{task.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignedToName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
                </div>
            </div>

            <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                <button
                    onClick={() => { setSelectedTask(task); setShowTransferModal(true); }}
                    className="flex-1 text-xs py-1.5 px-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center gap-1"
                >
                    <ArrowLeftRight className="w-3 h-3" />
                    تحويل
                </button>
                {task.status !== 'completed' && (
                    <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="flex-1 text-xs py-1.5 px-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 flex items-center justify-center gap-1"
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        إنهاء
                    </button>
                )}
                <button
                    onClick={() => handleDelete(task.id)}
                    className="text-xs py-1.5 px-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-gray-500">{tasks.length} مهمة • {tasks.filter(t => t.status === 'pending').length} قيد الانتظار</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-4 py-2 rounded-lg text-sm ${viewMode === 'kanban' ? 'bg-white shadow' : ''}`}
                        >
                            كانبان
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg text-sm ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                        >
                            قائمة
                        </button>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="bg-brand-blue hover:bg-brand-dark text-white">
                        <Plus className="w-5 h-5 ml-2" />
                        مهمة جديدة
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="بحث في المهام..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    >
                        <option value="all">جميع الحالات</option>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {(['pending', 'in_progress', 'review', 'completed'] as const).map((status) => (
                        <div key={status} className={`rounded-2xl p-4 ${statusColors[status]} bg-opacity-30`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-brand-dark flex items-center gap-2">
                                    {status === 'pending' && <Clock className="w-4 h-4" />}
                                    {status === 'in_progress' && <AlertCircle className="w-4 h-4" />}
                                    {status === 'review' && <Search className="w-4 h-4" />}
                                    {status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                                    {statusLabels[status]}
                                </h3>
                                <span className="text-sm bg-white px-2 py-0.5 rounded-full">
                                    {tasksByStatus[status].length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {tasksByStatus[status].map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                                {tasksByStatus[status].length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        لا توجد مهام
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">المهمة</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">المسؤول</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الأولوية</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">التاريخ</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTasks.map(task => (
                                <tr key={task.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-brand-dark">{task.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{task.assignedToName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                                            {priorityLabels[task.priority]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                            className={`text-xs px-2 py-1 rounded-full border ${statusColors[task.status]}`}
                                        >
                                            {Object.entries(statusLabels).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSelectedTask(task); setShowTransferModal(true); }}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* New Task Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-brand-dark">إنشاء مهمة جديدة</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المهمة</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تعيين إلى</label>
                                        <select
                                            value={formData.assignedTo}
                                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        >
                                            <option value="">اختر موظف</option>
                                            {employees.filter(e => e.status === 'active').map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        >
                                            {Object.entries(priorityLabels).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1 bg-brand-blue hover:bg-brand-dark text-white">
                                        إنشاء المهمة
                                    </Button>
                                    <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                                        إلغاء
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transfer Task Modal */}
            <AnimatePresence>
                {showTransferModal && selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-brand-dark">تحويل المهمة</h2>
                                <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-1">المهمة:</p>
                                    <p className="font-medium text-brand-dark">{selectedTask.title}</p>
                                    <p className="text-sm text-gray-500 mt-2">المسؤول الحالي: {selectedTask.assignedToName}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تحويل إلى</label>
                                    <select
                                        value={transferTo}
                                        onChange={(e) => setTransferTo(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    >
                                        <option value="">اختر موظف</option>
                                        {employees.filter(e => e.status === 'active' && e.id !== selectedTask.assignedTo).map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة (اختياري)</label>
                                    <textarea
                                        value={transferNote}
                                        onChange={(e) => setTransferNote(e.target.value)}
                                        rows={2}
                                        placeholder="أضف ملاحظة للموظف الجديد..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleTransfer} disabled={!transferTo} className="flex-1 bg-brand-blue hover:bg-brand-dark text-white">
                                        تحويل
                                    </Button>
                                    <Button type="button" onClick={() => setShowTransferModal(false)} variant="outline" className="flex-1">
                                        إلغاء
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    );
}
