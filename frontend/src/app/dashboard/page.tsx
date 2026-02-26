"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
    Plus, Search, Filter, LogOut, Loader2,
    ChevronLeft, ChevronRight, CheckCircle2,
    Circle, Trash2, Edit3, MoreVertical, X,
    Calendar, Clock, Layout
} from "lucide-react";

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [taskStatus, setTaskStatus] = useState("TODO");

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/tasks", {
                params: { search, status, page, limit: 10 }
            });
            setTasks(response.data.tasks);
            setTotal(response.data.pagination.total);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error: any) {

            toast.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    }, [search, status, page]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchTasks();
        }
    }, [fetchTasks, authLoading, user]);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await api.patch(`/tasks/${editingTask.id}`, { title, description, status: taskStatus });
                toast.success("Task updated");
            } else {
                await api.post("/tasks", { title, description, status: taskStatus });
                toast.success("Task created");
            }
            setIsModalOpen(false);
            setEditingTask(null);
            resetForm();
            fetchTasks();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success("Task deleted");
            fetchTasks();
        } catch (error: any) {
            toast.error("Failed to delete task");
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/tasks/${id}/toggle`);
            fetchTasks();
        } catch (error: any) {
            toast.error("Failed to toggle task");
        }
    };

    const openModal = (task: Task | null = null) => {
        if (task) {
            setEditingTask(task);
            setTitle(task.title);
            setDescription(task.description || "");
            setTaskStatus(task.status);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingTask(null);
        setTitle("");
        setDescription("");
        setTaskStatus("TODO");
    };

    if (authLoading) return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-[#6366f1]/30">
            {/* Sidebar/Nav */}
            <nav className="border-b border-white/5 bg-[#121215]/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Layout className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">TaskMaster</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium text-white">{user?.name || user?.email}</span>
                                <span className="text-xs text-gray-500">Premium Plan</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all active:scale-95"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight">Your Tasks</h2>
                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></span>
                            {total} tasks synced across all devices
                        </p>

                    </div>

                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-2xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Task
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                    <div className="md:col-span-7 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#6366f1] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#121215] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1] transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="md:col-span-5 relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-[#121215] border border-white/5 rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] transition-all appearance-none text-gray-300"
                        >
                            <option value="">All Statuses</option>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Task Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-12 h-12 text-[#6366f1] animate-spin" />
                        <p className="text-gray-500 font-medium">Loading your workflow...</p>
                    </div>
                ) : tasks.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tasks.map((task) => (
                                <div key={task.id} className="group bg-[#121215] border border-white/5 rounded-2xl p-6 hover:border-[#6366f1]/30 hover:bg-[#15151a] transition-all duration-300 relative overflow-hidden flex flex-col h-full shadow-lg hover:shadow-indigo-500/5">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <button
                                            onClick={() => handleToggle(task.id)}
                                            className={`p-1.5 rounded-lg transition-colors ${task.status === "COMPLETED" ? "text-emerald-400 bg-emerald-500/10" : "text-gray-500 bg-white/5 hover:text-gray-400"}`}
                                        >
                                            {task.status === "COMPLETED" ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                        </button>

                                        <div className="flex items-center gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(task)} className="p-2 text-gray-400 hover:text-white transition-colors"><Edit3 className="w-4.5 h-4.5" /></button>
                                            <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
                                        </div>
                                    </div>

                                    <div className="flex-1 mb-6">
                                        <h3 className={`text-xl font-bold mb-2 transition-all ${task.status === "COMPLETED" ? "text-gray-500 line-through" : "text-white group-hover:text-indigo-200"}`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                                            {task.description || "No description provided"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-gray-500 mt-auto">
                                        <span className={`px-2.5 py-1 rounded-full font-medium ${task.status === "TODO" ? "bg-amber-500/10 text-amber-500" :
                                            task.status === "IN_PROGRESS" ? "bg-[#6366f1]/10 text-[#6366f1]" :
                                                "bg-emerald-500/10 text-emerald-500"
                                            }`}>
                                            {task.status.replace("_", " ")}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-12">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="p-3 rounded-xl bg-[#121215] border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6366f1] transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="p-3 rounded-xl bg-[#121215] border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6366f1] transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-[#121215] border border-white/5 border-dashed rounded-3xl py-32 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                            <Calendar className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No tasks found</h3>
                        <p className="text-gray-400 max-w-sm mb-8">Refine your search or create a new task to start filling your workspace.</p>
                        <button
                            onClick={() => openModal()}
                            className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </main>

            {/* Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-[#121215] border border-white/10 w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-3xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold">{editingTask ? "Edit Task" : "Create Task"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-all"
                                    placeholder="What needs to be done?"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Description</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-all resize-none"
                                    placeholder="Capture some details..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Status</label>
                                <div className="flex gap-2">
                                    {["TODO", "IN_PROGRESS", "COMPLETED"].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setTaskStatus(s)}
                                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all border ${taskStatus === s
                                                ? (s === "TODO" ? "bg-amber-500/10 border-amber-500/50 text-amber-500" :
                                                    s === "IN_PROGRESS" ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-500" :
                                                        "bg-emerald-500/10 border-emerald-500/50 text-emerald-500")
                                                : "bg-[#1a1a1e] border-white/5 text-gray-500 hover:border-white/10"
                                                }`}
                                        >
                                            {s.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 px-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 px-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
                                >
                                    {editingTask ? "Save Changes" : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
