# DrugCopilot Demo Credentials & Access Reference

This document contains pre-configured authentication credentials and Role-Based Access Control (RBAC) permissions for the **DrugCopilot** platform.

---

## 🔐 System Accounts

### 1. Lead Administrator
- **Email:** `admin@drugcopilot.org`
- **Password:** `Admin@2025!`
- **Role:** `admin`
- **Designated Portal:** `/admin` (Admin Command Center)
- **Permissions:**
  - Full read/write access to the Knowledge Graph
  - Trigger live upstream ETL pipelines (ChEMBL, Open Targets, UniProt, ClinicalTrials.gov, PubChem, PubMed)
  - Inspect system telemetry, schema constraints, and database connections
  - Full access to all Researcher Discovery tools and AI Copilot

---

### 2. Biomedical Researcher (Primary User)
- **Email:** `user@drugcopilot.org`
- **Password:** `User@2025!`
- **Role:** `user`
- **Designated Portal:** `/copilot` (Researcher Discovery Portal)
- **Permissions:**
  - AI Drug Repurposing Copilot (`/copilot`)
  - Interactive Knowledge Graph Explorer (`/explore`)
  - Drug Profiles & Indication Search (`/drugs`)
  - Disease Target Associations (`/diseases`)
  - Clinical Trials Matching (`/trials`)
  - W3C PROV-DM Evidence Inspector (`/evidence`)
  - *Restricted:* Cannot trigger data pipeline ingestions or destroy graph records

---

### 3. Senior Pharmacologist (Secondary Researcher)
- **Email:** `researcher@drugcopilot.org`
- **Password:** `Research@2025!`
- **Role:** `user`
- **Designated Portal:** `/copilot`
- **Permissions:** Same as Primary Researcher (Read-only discovery)

---

## 🛡️ Authentication Methods

### 1. Web Portal Authentication
Navigate to [http://localhost:3000/login](http://localhost:3000/login) and sign in using your email and password. A secure JWT Bearer Token will be stored in your session.

### 2. HTTP Basic Authentication (API / CLI / cURL)
All backend API endpoints accept standard RFC 7617 HTTP Basic Auth:

```bash
# Example: Query system status with Basic Auth
curl -u "admin@drugcopilot.org:Admin@2025!" http://localhost:8000/auth/me
```

### 3. JWT Bearer Token (API / Scripts)
Authenticate via the login endpoint to receive a JWT token:

```bash
# Obtain JWT token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@drugcopilot.org", "password": "Admin@2025!"}'

# Use Bearer Token
curl -X GET http://localhost:8000/ingestion/status \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
