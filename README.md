🏥 Sanjeevani Hospital AI — The Blocked Bed
An AI-powered hospital operations command centre for smarter patient flow and resource coordination.

Sanjeevani Hospital AI is a web-based prototype designed to help hospital administrators identify operational bottlenecks by connecting information across beds, appointments, diagnostics, discharges, staff rosters, and patient feedback.

Instead of viewing each department in isolation, the system highlights related issues, ranks operational priorities, and recommends actions for authorised staff to review.

🚀 Key Features
Hospital Operations Dashboard — Overview of bed occupancy, waiting patients, blocked beds, and operational alerts.
Bed Management — Monitor bed availability, occupancy, cleaning, and discharge-related blockages.
Appointment Coordination — Review appointment status, waiting times, and department workload.
Diagnostic Tracking — Identify pending tests and delayed reports that may affect patient flow.
Discharge Coordination — Highlight incomplete documentation and other pending discharge tasks.
Staff & Roster Management — Review staff availability, shifts, and workload distribution.
Smart Operational Insights — Connect signals from different departments to identify possible root causes.
Prioritised Recommendations — Rank operational issues by urgency and potential impact.
Action & Alert Management — Organise follow-up tasks and operational escalations.
Human-in-the-Loop Review — Provide a review workflow for proposed actions.
Responsive Interface — Designed for desktop and mobile screens.
Dark Glass UI — Modern interface with animated transitions and interactive dashboard components.
💡 The Problem
Hospital operations teams may struggle to understand why emergency departments are becoming congested, even when individual departments appear to be functioning normally.

For example:

Beds may remain blocked because discharge paperwork is incomplete.
Delayed diagnostic reports may slow discharge coordination.
One department may experience long waiting times while another has available staff capacity.
Several small operational issues may combine to create a larger patient-flow problem.
Sanjeevani Hospital AI aims to connect these signals and help administrators understand what is happening, why it may be happening, and what should be reviewed first.

🧠 How It Works
Observe: Collect and display operational information across hospital departments.
Analyse: Identify related bottlenecks using available operational signals.
Prioritise: Rank issues based on urgency and potential operational impact.
Recommend: Suggest appropriate administrative follow-up actions.
Review: Allow authorised personnel to review proposed actions.
Track: Organise alerts and follow-up tasks for operational coordination.
The current project is a prototype. Its recommendations should be validated against real operational data before any production use.

🛠️ Technology Stack
HTML5
CSS3
JavaScript
Browser Local Storage for demo-state persistence
Responsive CSS layouts and animations
▶️ Getting Started
Option 1: Run locally
Clone the repository:

git clone https://github.com/YOUR-USERNAME/sanjeevani-hospital-ai.git
Open the project folder.

Open index.html in a modern web browser.

No package installation or build step is required for the standalone HTML prototype.

Option 2: Run with VS Code
Open the project folder in Visual Studio Code.
Open index.html.
Use the Live Server extension, if installed, to run the application locally.
Rename your uploaded HTML file to index.html before committing it if you want to follow these instructions exactly.

📊 Demo Data
The prototype uses sample hospital operational data to demonstrate dashboard behaviour and workflows.

The sample data is intended for demonstration and testing. It is not live hospital information.

For a hackathon demonstration, useful scenarios include:

Discharge bottleneck: Beds remain blocked while discharge tasks are pending.
Delayed diagnostics: Pending reports contribute to operational delays.
Staffing imbalance: Waiting times and staff workloads indicate a possible capacity mismatch.
🔐 Safety & Limitations
This project is an operational decision-support prototype, not a clinical decision-making system.
It does not replace medical professionals or authorised hospital administrators.
Proposed operational actions should be reviewed by authorised personnel before implementation.
Demo role selection should not be treated as secure authentication.
Browser Local Storage is not suitable for storing real patient information.
No live hospital-system integration is claimed by this prototype.
Do not enter real patient-identifiable or confidential hospital information into the demo.
🔮 Future Improvements
Connect a secure backend and database.
Import editable sample datasets from CSV or JSON.
Build a transparent, evidence-based bottleneck analysis engine.
Add a structured task queue with approval and audit history.
Implement secure authentication and role-based access control.
Add automated scenario testing and measurable evaluation of recommendations.
Integrate with authorised hospital systems only after appropriate security, privacy, and clinical governance reviews.
🎯 Project Goal
To help hospital operations teams move from disconnected department dashboards to a connected view of operational bottlenecks, with explainable recommendations and human oversight.

👥 Contributors
Add your team members' names and GitHub profiles here.

📄 License
No license has been specified yet. Add a license before permitting others to reuse or distribute this project.

Built as a hospital operations AI prototype for the “The Blocked Bed” challenge.
