import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// =======================
// TASKS & WORKFLOWS
// =======================

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { 
        user: { select: { name: true } },
        customer: { select: { name: true, company: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { title, description, status, dueDate, userId, customerId } = req.body;
    const task = await prisma.task.create({
      data: { title, description, status, dueDate: dueDate ? new Date(dueDate) : null, userId, customerId: customerId || null }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, status, dueDate, userId } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        ...(userId ? { userId } : {})
      }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// =======================
// RECRUITMENT (HRMS)
// =======================

router.get('/jobs', async (req, res) => {
  try {
    const jobs = await prisma.jobOpening.findMany({
      include: { applications: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const { title, department, description, status } = req.body;
    const job = await prisma.jobOpening.create({
      data: { title, department, description, status }
    });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/jobs/:id', async (req, res) => {
  try {
    const { title, department, description, status } = req.body;
    const job = await prisma.jobOpening.update({
      where: { id: req.params.id },
      data: {
        ...(title ? { title } : {}),
        ...(department ? { department } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {})
      }
    });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job opening' });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    await prisma.jobApplication.deleteMany({ where: { jobId } });
    await prisma.jobOpening.delete({ where: { id: jobId } });
    res.json({ message: 'Job opening and applications deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job opening' });
  }
});

router.post('/jobs/:jobId/apply', async (req, res) => {
  try {
    const { name, email, phone, resumeUrl } = req.body;
    const application = await prisma.jobApplication.create({
      data: { jobId: req.params.jobId, name, email, phone, resumeUrl }
    });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// =======================
// CUSTOMER SERVICE
// =======================

router.get('/tickets', async (req, res) => {
  try {
    const tickets = await prisma.serviceTicket.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const { title, description, priority, userId } = req.body;
    const ticket = await prisma.serviceTicket.create({
      data: { title, description, priority, userId: userId || null }
    });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.put('/tickets/:id', async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const ticket = await prisma.serviceTicket.update({
      where: { id: req.params.id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(priority ? { priority } : {}),
        ...(status ? { status } : {})
      }
    });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

router.delete('/tickets/:id', async (req, res) => {
  try {
    await prisma.serviceTicket.delete({ where: { id: req.params.id } });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// =======================
// FINANCE
// =======================

router.get('/finance', async (req, res) => {
  try {
    const tx = await prisma.financeTransaction.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch finance records' });
  }
});

router.post('/finance', async (req, res) => {
  try {
    const { type, amount, category, description, status, userId } = req.body;
    const tx = await prisma.financeTransaction.create({
      data: { type, amount, category, description, status, userId: userId || null }
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log transaction' });
  }
});

router.put('/finance/:id', async (req, res) => {
  try {
    const { type, amount, category, description, status, userId } = req.body;
    const tx = await prisma.financeTransaction.update({
      where: { id: req.params.id },
      data: {
        ...(type ? { type } : {}),
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(category ? { category } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        ...(userId !== undefined ? { userId: userId || null } : {})
      }
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.delete('/finance/:id', async (req, res) => {
  try {
    await prisma.financeTransaction.delete({ where: { id: req.params.id } });
    res.json({ message: 'Finance transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
