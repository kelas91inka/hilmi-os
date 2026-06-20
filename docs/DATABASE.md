# DATABASE.md

# Hilmi OS Database Architecture

## Overview

Database menggunakan PostgreSQL melalui Supabase.

Design principles:

* Scalable
* AI-friendly
* Search-friendly
* Future-proof
* Normalized
* Easy to maintain

---

# Global Rules

Every table must contain:

```sql
id UUID PRIMARY KEY

created_at TIMESTAMP

updated_at TIMESTAMP
```

Private tables must also contain:

```sql
user_id UUID
```

referencing:

```sql
auth.users
```

---

# TABLE GROUPS

Database dibagi menjadi beberapa domain:

1. User Domain
2. Task Domain
3. Project Domain
4. Goal Domain
5. Knowledge Domain
6. Diary Domain
7. Habit Domain
8. Finance Domain
9. Vault Domain
10. Public CMS Domain
11. AI Domain
12. System Domain

---

# USER DOMAIN

## profiles

Purpose:

Store user profile.

Fields:

```sql
id UUID

email TEXT

full_name TEXT

avatar_url TEXT

bio TEXT

location TEXT

website TEXT

created_at
updated_at
```

---

## settings

Purpose:

Store user preferences.

Fields:

```sql
id UUID

user_id UUID

theme TEXT

language TEXT

timezone TEXT

ai_enabled BOOLEAN

created_at
updated_at
```

---

# TASK DOMAIN

## tasks

Purpose:

Store tasks.

Fields:

```sql
id UUID

user_id UUID

title TEXT

description TEXT

status TEXT

priority TEXT

due_date TIMESTAMP

completed_at TIMESTAMP

project_id UUID

goal_id UUID

created_at
updated_at
```

Status:

```text
belum_dimulai
sedang_dikerjakan
selesai
ditunda
```

Priority:

```text
rendah
normal
tinggi
kritis
```

---

## task_tags

Purpose:

Task categorization.

Fields:

```sql
id UUID

task_id UUID

tag TEXT
```

---

# PROJECT DOMAIN

## projects

Purpose:

Store projects.

Fields:

```sql
id UUID

user_id UUID

title TEXT

slug TEXT

description TEXT

status TEXT

visibility TEXT

start_date DATE

end_date DATE

cover_image TEXT

featured BOOLEAN

created_at
updated_at
```

Visibility:

```text
public
private
```

Status:

```text
planning
active
paused
completed
archived
```

---

## project_files

Purpose:

Store attachments.

Fields:

```sql
id UUID

project_id UUID

name TEXT

file_url TEXT

file_type TEXT

created_at
updated_at
```

---

## project_timeline

Purpose:

Store project milestones.

Fields:

```sql
id UUID

project_id UUID

title TEXT

description TEXT

event_date DATE

created_at
updated_at
```

---

# GOAL DOMAIN

## goals

Purpose:

Store goals.

Fields:

```sql
id UUID

user_id UUID

title TEXT

description TEXT

goal_type TEXT

status TEXT

target_date DATE

progress INTEGER

category TEXT

created_at
updated_at
```

Goal Types:

```text
mingguan
bulanan
tahunan
lifetime
```

---

## goal_milestones

Fields:

```sql
id UUID

goal_id UUID

title TEXT

description TEXT

completed BOOLEAN

completed_at TIMESTAMP

created_at
updated_at
```

---

# KNOWLEDGE DOMAIN

## notes

Purpose:

Second Brain.

Fields:

```sql
id UUID

user_id UUID

title TEXT

content TEXT

excerpt TEXT

is_favorite BOOLEAN

created_at
updated_at
```

---

## note_links

Purpose:

Relasi antar data.

Fields:

```sql
id UUID

note_id UUID

linked_type TEXT

linked_id UUID

created_at
updated_at
```

linked_type:

```text
project
goal
task
diary
blog
```

---

## note_tags

Fields:

```sql
id UUID

note_id UUID

tag TEXT
```

---

# DIARY DOMAIN

## diary_entries

Purpose:

Personal journal.

Fields:

```sql
id UUID

user_id UUID

title TEXT

content TEXT

mood TEXT

entry_date DATE

created_at
updated_at
```

---

## diary_links

Purpose:

Relate diary to system.

Fields:

```sql
id UUID

diary_id UUID

linked_type TEXT

linked_id UUID
```

---

# HABIT DOMAIN

## habits

Fields:

```sql
id UUID

user_id UUID

title TEXT

description TEXT

target_frequency TEXT

active BOOLEAN

created_at
updated_at
```

---

## habit_logs

Fields:

```sql
id UUID

habit_id UUID

completed_date DATE

created_at
updated_at
```

---

# FINANCE DOMAIN

## finance_transactions

Fields:

```sql
id UUID

user_id UUID

type TEXT

amount NUMERIC

category TEXT

description TEXT

transaction_date DATE

created_at
updated_at
```

Type:

```text
income
expense
saving
```

---

# VAULT DOMAIN

## vault_items

Purpose:

Encrypted storage.

Fields:

```sql
id UUID

user_id UUID

title TEXT

encrypted_content TEXT

category TEXT

created_at
updated_at
```

Important:

Never store plaintext secrets.

---

# BOOKMARK DOMAIN

## bookmarks

Fields:

```sql
id UUID

user_id UUID

title TEXT

url TEXT

description TEXT

created_at
updated_at
```

---

# READING DOMAIN

## reading_items

Fields:

```sql
id UUID

user_id UUID

title TEXT

type TEXT

status TEXT

source_url TEXT

created_at
updated_at
```

Type:

```text
book
course
video
article
```

---

# PUBLIC CMS DOMAIN

## blogs

Fields:

```sql
id UUID

title TEXT

slug TEXT

excerpt TEXT

content TEXT

cover_image TEXT

published BOOLEAN

published_at TIMESTAMP

created_at
updated_at
```

---

## blog_categories

Fields:

```sql
id UUID

name TEXT
```

---

## blog_tags

Fields:

```sql
id UUID

name TEXT
```

---

## blog_tag_relations

Fields:

```sql
id UUID

blog_id UUID

tag_id UUID
```

---

## gallery

Fields:

```sql
id UUID

title TEXT

image_url TEXT

description TEXT

created_at
updated_at
```

---

## achievements

Fields:

```sql
id UUID

title TEXT

description TEXT

category TEXT

achievement_date DATE

image_url TEXT

created_at
updated_at
```

---

## timeline_events

Fields:

```sql
id UUID

title TEXT

description TEXT

event_date DATE

created_at
updated_at
```

---

# AI DOMAIN

## ai_conversations

Fields:

```sql
id UUID

user_id UUID

title TEXT

created_at
updated_at
```

---

## ai_messages

Fields:

```sql
id UUID

conversation_id UUID

role TEXT

content TEXT

created_at
```

Role:

```text
user
assistant
system
```

---

## ai_memories

Purpose:

Store AI memory references.

Fields:

```sql
id UUID

user_id UUID

memory_type TEXT

reference_id UUID

summary TEXT

importance INTEGER

created_at
updated_at
```

memory_type:

```text
task
project
goal
note
diary
blog
```

---

# SYSTEM DOMAIN

## notifications

Fields:

```sql
id UUID

user_id UUID

title TEXT

message TEXT

read BOOLEAN

created_at
updated_at
```

---

## activity_logs

Fields:

```sql
id UUID

user_id UUID

action TEXT

entity_type TEXT

entity_id UUID

created_at
```

---

# RELATIONSHIPS

Core Relationship:

Goal
├── Tasks
├── Projects
├── Habits
└── Notes

Project
├── Tasks
├── Notes
├── Files
└── Timeline

Diary
├── Goals
├── Projects
└── Notes

AI
├── Tasks
├── Goals
├── Projects
├── Notes
├── Diary
└── Blogs

---

# SEARCH REQUIREMENTS

Global Search must support:

* Tasks
* Projects
* Goals
* Notes
* Diary
* Blogs

Future:

PostgreSQL Full Text Search

---

# SECURITY REQUIREMENTS

Mandatory:

* Row Level Security
* Private Data Isolation
* Secure Session Validation

Every private table must enforce ownership.

No exceptions.

---

# FUTURE EXTENSIBILITY

Database must support:

* AI Memory Expansion
* Semantic Search
* Vector Embeddings
* Multi-language Content

without major schema redesign.
