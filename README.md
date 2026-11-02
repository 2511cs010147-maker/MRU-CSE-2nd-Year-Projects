
# 🎓 Edulytix - Smart Education System with Risk Alert & Digital Library

**Edulytix** is a full-stack college academic management and early-intervention system built with **React.js + Bootstrap**, **Java 17 + Spring Boot REST API**, and **MySQL**.

---

## 🌟 Key Features

1. **Role-Based Portals & Authentication:**
   - **Admin:** Complete CRUD management for Students and Teachers, system metrics overview.
   - **Teacher:** Grade weekly quizzes with instant performance tracking.
   - **Student:** View personal details, weekly quiz breakdowns, interactive performance chart, and risk status.

2. **Automated Risk Alert Engine (Core Feature):**
   - Automatically monitors score changes across consecutive weeks.
   - When a student's score decreases by **&ge; 20%** compared to the previous week, a **Risk Alert** (HIGH or CRITICAL) is automatically created and displayed.
   - Instructors and administrators can review, filter, and mark alerts as **Resolved** after mentoring.

3. **Digital Academic Library:**
   - Centralized repository for Books, Notes, PDFs, and Study Materials.
   - Students can search materials by title, author, or subject and filter by category.
   - Teachers and Admins can publish new resources or remove outdated items.

4. **Interactive Performance Charting:**
   - Visual trend line of weekly scores using Chart.js on the Student Dashboard.

---

## 🗄️ Database Tables (`edulytixf_db`)

- `users`: User authentication, roles (`ADMIN`, `TEACHER`, `STUDENT`), and profile information.
- `students`: Roll number, semester, department, contact info, linked user.
- `teachers`: Teacher code, designation, department, contact info, linked user.
- `courses`: Course code, name, department, semester, assigned teacher.
- `quiz_results`: Weekly scores, total marks, percentage, instructor remarks, and date.
- `risk_alerts`: Student, course, previous score, current score, percentage drop, severity level (`HIGH` / `CRITICAL`), status (`ACTIVE` / `RESOLVED`).
- `library`: Academic title, author, category (`Book`, `Notes`, `PDF`, `Study Material`), subject, download/view URL.

---

## 🚀 Running the Project Locally

### 1. Backend (Spring Boot)
- **Directory:** `backend/`
- **Port:** `8080`
- **Command:**
  ```powershell
  cd backend
  mvn spring-boot:run
  ```

### 2. Frontend (React + Vite + Bootstrap)
- **Directory:** `frontend/`
- **Port:** `5173`
- **URL:** [http://localhost:5173](http://localhost:5173)
- **Command:**
  ```powershell
  cd frontend
  npm install
  npm run dev
  ```

---

## 🔑 Pre-Configured Demo Credentials

The application comes pre-seeded with sample data and 1-Click Demo Login cards on the login page:

| Role | Username | Password | Purpose / Features to Test |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | View university statistics, Add/Edit/Delete Students and Teachers |
| **Teacher** | `prof_sharma` | `teacher123` | Grade weekly quizzes, trigger automatic 20% drop Risk Alerts |
| **Teacher** | `prof_anita` | `teacher123` | Assistant Professor in Data Science |
| **Student (At Risk)** | `student_priya` | `student123` | **Shows active Critical Risk Alert** (dropped 90% &rarr; 55%) &amp; performance chart |
| **Student (Good)** | `student_aarav` | `student123` | High performing student with 90%+ scores |
| **Student** | `student_rohan` | `student123` | Student with DBMS Risk Alert (dropped 90% &rarr; 65%) |
| **Student** | `student_sneha` | `student123` | Improving student profile |

---

## 📄 Application Pages

1. **Home (`/`)**: Academic portal overview, live system statistics, feature cards, and demo quick-guide.
2. **Login (`/login`)**: Role-based access with 1-click quick-fill demo cards.
3. **Admin Dashboard (`/admin`)**: Metric cards, student directory, faculty directory, and CRUD modals.
4. **Teacher Dashboard (`/teacher`)**: Weekly quiz entry form, auto-risk detection, and grading table.
5. **Student Dashboard (`/student`)**: Academic profile, KPI metrics, weekly performance line chart, and prominent risk alert warning card.
6. **Risk Alerts (`/risk-alerts`)**: Centralized alerts view with score comparison badges and resolve toggles.
7. **Digital Library (`/library`)**: Searchable academic materials categorized by Book, Notes, PDF, and Study Material.
8. **Profile (`/profile`)**: User information, assigned academic role badge, and sign-out.

# MRU-CSE-2nd-Year-Projects
Upload All Second Year Projects - Mini-projects, Python, Java, web development, DBMS and introductory AI/ML projects

