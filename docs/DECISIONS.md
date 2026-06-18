# DECISIONS.md

# Hilmi OS Decision Log

Dokumen ini berisi seluruh keputusan final proyek.

Dokumen ini menjadi referensi utama untuk seluruh pengembangan.

AI Coding Agent tidak boleh mengubah keputusan dalam dokumen ini tanpa persetujuan pemilik proyek.

---

# Product Decisions

## D-001

Product Name

Decision:

Hilmi OS

Status:

Approved

---

## D-002

Product Type

Decision:

Personal Operating System

Bukan website portofolio biasa.

Status:

Approved

---

## D-003

Target User

Decision:

Single User First

Hanya pemilik sistem yang menggunakan dashboard private.

Status:

Approved

---

# Language Decisions

## D-004

Primary Language

Decision:

Bahasa Indonesia

Status:

Approved

Requirements:

* Seluruh dashboard menggunakan Bahasa Indonesia
* Seluruh AI menggunakan Bahasa Indonesia
* Seluruh CMS menggunakan Bahasa Indonesia

---

## D-005

English Support

Decision:

Future Feature

Status:

Planned

Not included in V1.

---

# Authentication Decisions

## D-006

Public Registration

Decision:

Disabled

Status:

Approved

Requirements:

* Tidak ada halaman Sign Up
* Tidak ada registrasi publik

---

## D-007

Authentication Provider

Decision:

Supabase Auth

Status:

Approved

---

## D-008

Login Method

Decision:

Google Login

Primary Method

Status:

Approved

---

## D-009

Access Control

Decision:

Email Whitelist

Status:

Approved

Requirements:

Only approved email addresses may access private areas.

---

## D-010

MFA

Decision:

Supported

Status:

Approved

---

# Architecture Decisions

## D-011

Frontend Framework

Decision:

Next.js App Router

Status:

Approved

---

## D-012

Language

Decision:

TypeScript

Status:

Approved

Requirements:

No JavaScript files allowed.

---

## D-013

Styling

Decision:

TailwindCSS

Status:

Approved

---

## D-014

UI Components

Decision:

shadcn/ui

Status:

Approved

---

## D-015

Animation

Decision:

Framer Motion

Status:

Approved

Requirements:

Animation should be lightweight.

---

# Backend Decisions

## D-016

Backend Platform

Decision:

Supabase

Status:

Approved

---

## D-017

Database

Decision:

PostgreSQL

Status:

Approved

---

## D-018

Realtime Features

Decision:

Supabase Realtime

Status:

Approved

---

# Storage Decisions

## D-019

Image Storage

Decision:

Cloudinary

Status:

Approved

Used For:

* Blog images
* Gallery
* Project screenshots
* Media uploads

---

## D-020

Database Storage

Decision:

Do Not Store Images Inside Database

Status:

Approved

Only URLs may be stored.

---

# Deployment Decisions

## D-021

Hosting

Decision:

Vercel

Status:

Approved

---

## D-022

PWA

Decision:

Required

Status:

Approved

Requirements:

Application must be installable.

---

# UI Decisions

## D-023

Design Philosophy

Decision:

Minimal Premium

Status:

Approved

Requirements:

* Clean
* Modern
* Fast
* Professional

---

## D-024

Dashboard Complexity

Decision:

Simple UX

Status:

Approved

Requirements:

Powerful internally but simple externally.

---

## D-025

Dark Mode

Decision:

Supported

Status:

Approved

---

## D-026

Light Mode

Decision:

Supported

Status:

Approved

---

# AI Decisions

## D-027

AI First Philosophy

Decision:

AI is a layer, not the foundation.

Status:

Approved

Database remains source of truth.

---

## D-028

Primary AI Provider

Decision:

Grok API

Status:

Approved

---

## D-029

Future AI Providers

Decision:

Provider Abstraction

Status:

Approved

Future support:

* OpenAI
* Gemini
* Claude

---

## D-030

AI Memory

Decision:

Required

Status:

Approved

AI must understand:

* Tasks
* Projects
* Goals
* Notes
* Diary
* Blogs

---

## D-031

Voice Commands

Decision:

Required

Status:

Approved

---

# Security Decisions

## D-032

RLS

Decision:

Mandatory

Status:

Approved

Apply to every private table.

---

## D-033

Audit Logs

Decision:

Mandatory

Status:

Approved

---

## D-034

Secure Vault

Decision:

Encrypted Storage

Status:

Approved

Used for:

* Personal secrets
* API keys
* Sensitive notes

---

# CMS Decisions

## D-035

Public Content Management

Decision:

Integrated CMS

Status:

Approved

Must manage:

* Projects
* Blog
* Timeline
* Gallery
* Achievements

---

# Productivity Decisions

## D-036

Quick Capture

Decision:

Required

Status:

Approved

Purpose:

Fast idea capture.

---

## D-037

Second Brain

Decision:

Required

Status:

Approved

---

## D-038

Goal Tracking

Decision:

Required

Status:

Approved

---

## D-039

Diary

Decision:

Required

Status:

Approved

---

## D-040

Project Management

Decision:

Required

Status:

Approved

---

# Future Decisions

## D-041

Team Support

Decision:

Not Included

Status:

Rejected

Reason:

Single-user focus.

---

## D-042

Social Features

Decision:

Not Included

Status:

Rejected

Reason:

Not aligned with vision.

---

## D-043

Marketplace

Decision:

Not Included

Status:

Rejected

Reason:

Outside project scope.

---

# Final Rule

If any implementation conflicts with this document:

This document wins.

All future development must respect these decisions.
