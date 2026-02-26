import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/auth.js";

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = RegisterSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
        });

        res.status(201).json({ message: "User registered successfully", userId: user.id });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = LoginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

    try {
        const { userId } = verifyRefreshToken(refreshToken);
        const newAccessToken = generateAccessToken(userId);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ error: "Invalid refresh token" });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
};
