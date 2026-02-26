import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { z } from "zod";
import prisma from "../lib/prisma.js";

const TaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
});

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, status } = TaskSchema.parse(req.body);
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status || "TODO",
                userId: req.userId!,
            },
        });
        res.status(201).json(task);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: req.userId!,
                ...(status ? { status: status as string } : {}),
                ...(search ? { title: { contains: search as string } } : {}),
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
        });

        const total = await prisma.task.count({
            where: {
                userId: req.userId!,
                ...(status ? { status: status as string } : {}),
                ...(search ? { title: { contains: search as string } } : {}),
            },
        });

        res.json({
            tasks,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findFirst({
            where: { id: Number(id), userId: req.userId! },
        });
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const { title, description, status } = TaskSchema.partial().parse(req.body);
        const task = await prisma.task.updateMany({
            where: { id: Number(id), userId: req.userId! },
            data: { title, description, status },
        });
        if (task.count === 0) return res.status(404).json({ error: "Task not found" });
        const updatedTask = await prisma.task.findUnique({ where: { id: Number(id) } });
        res.json(updatedTask);

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.deleteMany({
            where: { id: Number(id), userId: req.userId! },
        });
        if (task.count === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const toggleTaskStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findFirst({
            where: { id: Number(id), userId: req.userId! },
        });
        if (!task) return res.status(404).json({ error: "Task not found" });

        const newStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
        const updatedTask = await prisma.task.update({
            where: { id: Number(id) },
            data: { status: newStatus },
        });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
