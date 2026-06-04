# AcroHive — Final Product Requirements Document

> **Hackathon:** IntelliAI Arena 2026 — Squid Game Edition
> **Track:** Track 1 — Web & App Development
> **Team:** CSE (AI & ML), AITR Indore
> **Version:** v2.0 — Final Build Spec
> **Status:** ✅ APPROVED FOR BOLT IMPLEMENTATION

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design System — Cyber Blue Theme](#2-design-system--cyber-blue-theme)
3. [Authentication Architecture — Dual Login](#3-authentication-architecture--dual-login)
4. [Feature Specifications](#4-feature-specifications)
5. [Geofence at Scanner — Implementation](#5-geofence-at-scanner--implementation)
6. [Database Schema](#6-database-schema)
7. [Page-by-Page Change Log](#7-page-by-page-change-log)
8. [Bolt Prompt 1 — Theme + Footer](#8-bolt-prompt-1--theme--footer)
9. [Bolt Prompt 2 — Dual Auth (Student + Admin)](#9-bolt-prompt-2--dual-auth-student--admin)
10. [Bolt Prompt 3 — Geofence at Scanner](#10-bolt-prompt-3--geofence-at-scanner)
11. [Bolt Prompt 4 — Admin Command Center Live Views](#11-bolt-prompt-4--admin-command-center-live-views)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [Risk Register](#13-risk-register)

---

## 1. Executive Summary

AcroHive is a Smart Campus Event Operating System built for the IntelliAI Arena 2026 hackathon. The app is already scaffolded in Bolt with a working dark theme, navigation, QR scanner, AI Suite, and Command Center shell.

This PRD defines **four targeted change sets** to be applied via Bolt prompts:

| Change | Scope | Prompt |
|--------|-------|--------|
| Cyber Blue theme + dynamic footer page numbers | Global — all pages | Prompt 1 |
| Dual login (Student portal / Admin portal) with role-based routing | Auth + Nav | Prompt 2 |
| Geofence verification integrated into QR Scanner screen | Scanner page | Prompt 3 |
| Admin live attendee feed + Student read-only dashboard | Command Center | Prompt 4 |

---

## 2. Design System — Cyber Blue Theme

### 2.1 Color Token Changes

Replace all neon green (`#00FF87`, `#00E676`, `#39FF14`, and variants) with the **Cyber Blue** palette below. Every token must be updated globally — CSS variables, Tailwind config, and any hardcoded hex values.

| Token Name | OLD (Neon Green) | NEW (Cyber Blue) | Usage |
|---|---|---|---|
| `--color-primary` | `#00FF87` | `#00D4FF` | Primary CTA buttons, active nav, logo accent |
| `--color-primary-glow` | `#00FF8720` | `#00D4FF20` | Glow effects, card hover borders |
| `--color-primary-dark` | `#00C060` | `#0099CC` | Pressed states, darker accents |
| `--color-primary-text` | `#00E676` | `#00D4FF` | Inline text highlights, badge text |
| `--color-primary-bg` | `#001a0d` | `#001a2e` | Subtle tinted section backgrounds |
| `--color-success` | `#00FF87` | `#00D4FF` | "Valid scan", "LIVE" badges |
| `--color-accent-border` | `#00FF8740` | `#00D4FF40` | Card borders on hover |

**Unchanged tokens (keep as-is):**

| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#000000` | Main app background |
| `--color-bg-card` | `#0d0d0d` | Cards, panels |
| `--color-bg-elevated` | `#161616` | Elevated surfaces, modals |
| `--color-text-primary` | `#FFFFFF` | Body text |
| `--color-text-muted` | `#888888` | Subtitles, timestamps |
| `--color-danger` | `#FF1744` | Errors, invalid scan, locked states |
| `--color-warning` | `#FF9800` | Warnings, capacity warnings |

### 2.2 Tailwind Config Update

```js
// tailwind.config.js — extend colors section
colors: {
  primary: {
    DEFAULT: '#00D4FF',
    dark: '#0099CC',
    glow: 'rgba(0, 212, 255, 0.12)',
    border: 'rgba(0, 212, 255, 0.25)',
  },
  cyber: {
    bg: '#001a2e',
    card: '#0d1a2e',
  }
}
```

### 2.3 Logo Wordmark

- `ACRO` → white (`#FFFFFF`)
- `HIVE` → cyber blue (`#00D4FF`)
- Hexagon icon → cyber blue stroke, transparent fill

### 2.4 Typography

No changes. Maintain existing font stack (monospace for labels, sans-serif for body).

---

## 3. Authentication Architecture — Dual Login

### 3.1 Overview

Replace the current single Sign In page with a **role-selector landing** that routes to two distinct login flows. Supabase Auth handles both; roles are stored in a `profiles` table.

```
/auth                  ← Role selector (two cards: Student / Admin)
/auth/student          ← Student login + signup
/auth/admin            ← Admin login only (no self-signup; admin accounts pre-seeded)
```

### 3.2 Student Login Page (`/auth/student`)

**Visual design:**
- Full black background
- Centered card (same style as current Sign In card)
- Header: hexagon icon + `ACRO`**`HIVE`** wordmark in cyber blue
- Subtitle: `"Student Portal — Register for events, collect tickets"`
- Tab switcher: **Sign In** | **Sign Up** (cyber blue active tab)
- Sign In fields: `student@college.edu` placeholder, password + show/hide toggle
- Sign Up fields: Full Name, College Email, Roll Number, Password, Confirm Password
- Primary CTA button: cyber blue, full-width, label `"Enter the Arena →"`
- Below card: `"Admin? → Switch to Admin Login"` text link

**Post-login routing:**
- Redirect to `/events` (Events Directory)
- Nav shows: Events, My Tickets, Scanner *(hidden)*, AI Suite, *(no Command tab)*

**Permissions (Student role):**
- ✅ Browse events
- ✅ Register for events
- ✅ View own QR tickets
- ✅ Use QR Scanner to check in (geofence applies)
- ✅ Use AI Suite chatbot
- ❌ Cannot access Command Center
- ❌ Cannot create events
- ❌ Cannot see other students' data

### 3.3 Admin Login Page (`/auth/admin`)

**Visual design:**
- Same card structure as Student login
- Header: `ACRO`**`HIVE`** + badge `[ADMIN]` in cyber blue outline
- Subtitle: `"Command Center — Manage events, monitor attendance"`
- **No Sign Up tab** — admins are pre-created; show only Sign In
- Fields: Admin email, password
- Primary CTA: `"Access Command Center →"`
- Below card: `"Student? → Switch to Student Login"` text link
- Optional: subtle `[SHIELD]` icon watermark in background at 3% opacity

**Post-login routing:**
- Redirect to `/command` (Operations Dashboard)
- Nav shows: Events, *(no My Tickets)*, Scanner, AI Suite, Command *(highlighted)*

**Permissions (Admin role):**
- ✅ All student permissions
- ✅ Access Command Center dashboard
- ✅ Create / edit / delete events
- ✅ View all registrations and live attendee feed
- ✅ Open / close attendance window
- ✅ Toggle Demo Mode for geofence bypass
- ✅ Generate bulk certificates
- ✅ Export attendee data

### 3.4 Role Selector Page (`/auth`)

Two side-by-side cards on a black background:

```
┌─────────────────┐   ┌─────────────────┐
│   👤 STUDENT    │   │  🛡️  ADMIN      │
│                 │   │                 │
│ Browse & join   │   │ Create & manage │
│ campus events   │   │ campus events   │
│                 │   │                 │
│ [Enter Portal]  │   │ [Enter Command] │
└─────────────────┘   └─────────────────┘
```

- Cards have cyber blue `1px` border on hover
- Background has faint Squid Game geometric shapes (circle, triangle, square) at 4% opacity

### 3.5 Supabase `profiles` Table

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  role        TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  full_name   TEXT,
  roll_number TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 4. Feature Specifications

### 4.1 Current Features (Keep As-Is)

| Feature | Screen | Status |
|---|---|---|
| Landing / Hero | `/` | ✅ Keep, update colors only |
| Core Modules grid | `/` scroll | ✅ Keep, update colors only |
| Demo Flow (15 steps) | `/` scroll | ✅ Keep |
| Events Directory | `/events` | ✅ Keep, add auth guard |
| QR Ticket (My Tickets) | `/tickets` | ✅ Keep, student-only |
| AI Suite (4 tools) | `/ai` | ✅ Keep |

### 4.2 New / Modified Features

| Feature | Change | Prompt |
|---|---|---|
| Footer page numbers | Dynamic, count real DOM sections | Prompt 1 |
| Cyber Blue theme | Global token replacement | Prompt 1 |
| Dual auth login | New pages `/auth`, `/auth/student`, `/auth/admin` | Prompt 2 |
| Role-based nav | Show/hide nav items by role | Prompt 2 |
| Geofence at Scanner | GPS + IP check before scan allowed | Prompt 3 |
| Admin live attendee feed | Supabase Realtime subscription | Prompt 4 |
| Student dashboard | Read-only: my registrations, check-in status | Prompt 4 |

---

## 5. Geofence at Scanner — Implementation

### 5.1 Problem

The current `/scanner` page opens camera immediately with no location verification. A student could scan their QR from anywhere (dorm room, canteen) and fraudulently mark attendance.

### 5.2 Solution — Geofence Gate before Camera

Add a **pre-scan verification step** to the Scanner page. The camera only activates after the student passes the geofence check.

### 5.3 Scanner Page Flow (New)

```
[Scanner Page Loads]
        │
        ▼
[Step 1: VERIFY LOCATION]
  ┌─────────────────────────────┐
  │  📍 Location Verification   │
  │  "We need to confirm you're │
  │   at the event venue before │
  │   enabling the scanner."    │
  │                             │
  │  [Verify My Location →]     │
  └─────────────────────────────┘
        │
        ▼ (button click)
  navigator.geolocation.getCurrentPosition()
  + fetch('/api/verify-location', { lat, lng, event_id })
        │
   ┌────┴────┐
   │ PASS    │ FAIL
   ▼         ▼
[Step 2:  [Error card]
 SCAN]    "You must be at the
          venue to scan tickets.
          Distance: Xm away.
          [Try Again]"
  │
  ▼
[Camera opens — ZXing QR scanner]
[Scan → validate UUID → mark attendance]
```

### 5.4 Verification UI States

**State 1 — Idle (default on page load):**
```
┌──────────────────────────────────────┐
│  📍  LOCATION VERIFICATION           │
│  ─────────────────────────────────   │
│  Attendance scanner is geofenced.    │
│  You must be physically present at   │
│  the event venue to scan tickets.    │
│                                      │
│  Event: [Event Name]                 │
│  Venue: [Venue Name]                 │
│  Radius: 100m                        │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  📡  Verify My Location  →  │    │  ← cyber blue button
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

**State 2 — Checking:**
```
  🔄  Acquiring GPS signal...
  Checking your position against venue coordinates.
```

**State 3 — Verified (PASS):**
```
  ✅  LOCATION VERIFIED
  You are 42m from the venue. Scanner unlocked.
  ─────────────────────
  [Camera viewport opens below]
  [Scan QR ticket to record attendance]
```

**State 4 — Outside fence (FAIL):**
```
  ❌  OUTSIDE GEOFENCE
  You are 340m from the venue.
  Required: within 100m of [Venue Name].
  
  Not at the venue? Contact your organizer.
  [Try Again]
```

**State 5 — Demo Mode (Admin only):**
```
  🔧  DEMO MODE ACTIVE
  Geofence bypassed for demonstration.
  Scanner is open.
```

### 5.5 Backend API — `/api/verify-location`

```python
# FastAPI endpoint
@app.post('/api/verify-location')
async def verify_location(payload: LocationPayload, request: Request):
    event = await get_event(payload.event_id)

    # Demo mode bypass (admin only)
    if event.demo_mode:
        return {"verified": True, "method": "demo", "distance": 0}

    # Layer 1: GPS Haversine
    dist = haversine(payload.lat, payload.lng, event.venue_lat, event.venue_lng)
    if dist <= event.radius_metres:
        return {"verified": True, "method": "gps", "distance": round(dist)}

    # Layer 2: IP subnet fallback
    client_ip = request.client.host
    if event.allowed_ip_prefix and client_ip.startswith(event.allowed_ip_prefix):
        return {"verified": True, "method": "ip", "distance": round(dist)}

    return {"verified": False, "method": None, "distance": round(dist)}

def haversine(lat1, lng1, lat2, lng2) -> float:
    import math
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
```

### 5.6 Frontend State (React)

```tsx
type GeoState = 'idle' | 'checking' | 'verified' | 'failed' | 'demo';

const ScannerPage = () => {
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [distance, setDistance] = useState<number | null>(null);

  const verifyLocation = async () => {
    setGeoState('checking');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await fetch('/api/verify-location', {
          method: 'POST',
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            event_id: selectedEventId,
          })
        });
        const data = await res.json();
        setDistance(data.distance);
        setGeoState(data.verified ? 'verified' : 'failed');
      },
      () => setGeoState('failed')
    );
  };

  return (
    <>
      {geoState !== 'verified' && <GeofenceGate state={geoState} onVerify={verifyLocation} distance={distance} />}
      {geoState === 'verified' && <QRCamera onScan={handleScan} />}
    </>
  );
};
```

---

## 6. Database Schema

### `events` table
```sql
id              UUID PK
title           TEXT
description     TEXT
date_time       TIMESTAMPTZ
venue_name      TEXT
venue_lat       FLOAT8
venue_lng       FLOAT8
radius_metres   INT4    DEFAULT 100
capacity        INT4
registered_count INT4   DEFAULT 0
allowed_ip_prefix TEXT
attendance_open BOOL    DEFAULT false
demo_mode       BOOL    DEFAULT false
created_by      UUID    FK → auth.users
category        TEXT    CHECK IN ('Workshop','Hackathon','Bootcamp','Competition','Exhibition')
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### `registrations` table
```sql
id              UUID PK
event_id        UUID FK → events
student_id      UUID FK → auth.users
student_name    TEXT
student_email   TEXT
roll_number     TEXT
registered_at   TIMESTAMPTZ DEFAULT NOW()
qr_code_hash    TEXT UNIQUE
ticket_sent     BOOL DEFAULT false
```

### `attendance` table
```sql
id                  UUID PK
registration_id     UUID FK → registrations
event_id            UUID FK → events
student_id          UUID FK → auth.users
checked_in_at       TIMESTAMPTZ DEFAULT NOW()
verified            BOOL DEFAULT false
verification_method TEXT   CHECK IN ('gps','ip','demo','manual')
distance_metres     FLOAT8
ip_address          TEXT
```

### `profiles` table
```sql
id          UUID PK FK → auth.users
role        TEXT CHECK IN ('student','admin')
full_name   TEXT
roll_number TEXT
created_at  TIMESTAMPTZ DEFAULT NOW()
```

---

## 7. Page-by-Page Change Log

| Page | URL | Changes Required |
|---|---|---|
| Landing | `/` | Neon green → cyber blue globally. Footer: dynamic page counter. |
| Role Selector | `/auth` *(NEW)* | Two-card role picker. |
| Student Login | `/auth/student` *(NEW)* | Full student Sign In + Sign Up form. |
| Admin Login | `/auth/admin` *(NEW)* | Admin-only Sign In. No Sign Up. |
| Events | `/events` | Auth guard — redirect to `/auth` if not logged in. |
| My Tickets | `/tickets` | Student-only route guard. |
| Scanner | `/scanner` | Geofence gate added BEFORE camera. Event selector added. |
| AI Suite | `/ai` | Color tokens update only. |
| Command Center | `/command` | Admin-only guard. Live attendee feed. Student view: read-only dashboard. |

---

## 8. Bolt Prompt 1 — Theme + Footer

> **Copy this entire prompt into Bolt**

---

```
TASK: Global theme change from neon green to Cyber Blue, plus dynamic footer.

=== PART A: REPLACE ALL NEON GREEN WITH CYBER BLUE ===

Search the entire codebase for every instance of these neon green values and replace with cyber blue equivalents:

FIND → REPLACE:
- #00FF87  →  #00D4FF
- #00E676  →  #00D4FF
- #39FF14  →  #00D4FF
- #00c853  →  #0099CC
- #69ff47  →  #33DDFF
- #00FF8720 → #00D4FF20
- #00FF8740 → #00D4FF40
- #001a0d  →  #001a2e
- text-green-400  →  text-cyan-400
- text-green-300  →  text-cyan-300
- bg-green-500/10 →  bg-cyan-500/10
- border-green-500 → border-cyan-400
- ring-green → ring-cyan

Update tailwind.config.js to add:
  primary: { DEFAULT: '#00D4FF', dark: '#0099CC', glow: 'rgba(0,212,255,0.12)' }

Update the logo wordmark so "HIVE" is #00D4FF (was neon green), "ACRO" stays white.
Update all button backgrounds from neon green to #00D4FF.
Update the hexagon SVG icon stroke and fill-accent to #00D4FF.
Update the "LIVE" badge, "AI POWERED" badge, "SCANNER" badge colors to #00D4FF text.
Update the stat numbers on the landing hero (6+, 1200+, 98+, 0+) to #00D4FF.
Update all hover glow box-shadows from green tint to: 0 0 20px rgba(0,212,255,0.15).

=== PART B: DYNAMIC FOOTER PAGE COUNTER ===

On the landing page, the footer currently shows a static copyright.
Replace it with a dynamic section counter that reads the actual DOM.

Implementation:
1. Add a data-section attribute to every major scroll section on the landing page:
   - Hero section: data-section="1"
   - Core Modules section: data-section="2"
   - Demo Flow section: data-section="3"  
   - CTA section: data-section="4"
   - Footer: data-section="footer"

2. Use an IntersectionObserver to detect which section is currently most visible in the viewport.

3. Show in the footer (bottom-right corner, fixed position):
   Page [current] / [total]
   Example: "Page 2 / 4" when Core Modules is in view.

4. Style: small pill, #00D4FF text, dark bg, 0.5px cyan border, font-mono, 12px.
   Position: fixed bottom-6 left-6, z-50.
   Animate: fade-in on section change with 200ms transition.

5. Hide this counter when user is on any page other than the landing page ("/").
```

---

## 9. Bolt Prompt 2 — Dual Auth (Student + Admin)

> **Copy this entire prompt into Bolt**

---

```
TASK: Replace single Sign In page with a dual-role authentication system.

=== STEP 1: CREATE ROLE SELECTOR PAGE at /auth ===

Replace the current Sign In button behavior. When a user clicks "Sign In" (nav) or "Get Started" (landing CTA), route them to /auth (not directly to a form).

/auth page layout:
- Black background, centered content
- Title: "Choose Your Role" in white, 32px bold
- Subtitle: "Your access level determines what you can see and do." in muted gray

Two cards side by side (responsive: stacked on mobile):

CARD 1 — Student:
- Icon: 👤 (or Lucide UserCircle, cyber blue, 40px)
- Title: "Student" white bold 20px
- Badge: "ATTENDEE" in cyber blue outline pill
- Description: "Browse events, register instantly, collect your QR tickets and check in at the venue."
- Button: "Enter Student Portal →" (cyber blue bg, black text, full-width)
- Routes to: /auth/student

CARD 2 — Admin:  
- Icon: 🛡️ (or Lucide Shield, cyber blue, 40px)
- Title: "Admin" white bold 20px
- Badge: "ORGANIZER" in cyber blue outline pill
- Description: "Create events, monitor live registrations, open attendance windows and generate certificates."
- Button: "Enter Command Center →" (dark bg, cyber blue border + text, full-width)
- Routes to: /auth/admin

Card styles: bg #0d0d0d, border 0.5px solid rgba(0,212,255,0.2), border-radius 12px, padding 32px.
Hover: border-color rgba(0,212,255,0.6), box-shadow 0 0 20px rgba(0,212,255,0.1).
Cards should be equal width, max-width 360px each, gap 24px.

Background: faint geometric shapes (circle, triangle, square outlines) at 4% opacity white, same style as rest of app.

=== STEP 2: CREATE STUDENT LOGIN PAGE at /auth/student ===

Layout identical to current Sign In page but with:
- Header: hexagon + ACRO(white)HIVE(#00D4FF)
- Subtitle: "Student Portal — Register for events, collect tickets"
- Tab switcher: [Sign In] [Sign Up] — cyber blue active tab with underline
- SIGN IN tab fields:
  - Email (placeholder: student@college.edu)
  - Password with show/hide eye toggle
  - "Forgot password?" link (cyber blue, right-aligned)
  - CTA: "Enter the Arena →" (full-width, cyber blue bg)
- SIGN UP tab fields:
  - Full Name
  - College Email (placeholder: roll@aitr.ac.in)
  - Roll Number
  - Password
  - Confirm Password
  - CTA: "Join the Hive →" (full-width, cyber blue bg)
- Footer link: "Admin? → Switch to Admin Login" routes to /auth/admin

On successful Sign In/Sign Up:
1. Insert into profiles table: { id: user.id, role: 'student', full_name, roll_number }
2. Set auth context role = 'student'
3. Redirect to /events

=== STEP 3: CREATE ADMIN LOGIN PAGE at /auth/admin ===

Same layout as student page BUT:
- Subtitle: "Command Center — Manage events, monitor attendance"  
- NO Sign Up tab — only Sign In form
- Add subtle [SHIELD] icon at 5% opacity as background watermark
- Email placeholder: admin@aitr.ac.in
- CTA: "Access Command Center →"
- Footer link: "Student? → Switch to Student Login" routes to /auth/student

On successful Sign In:
1. Verify profiles.role = 'admin' — if not admin, show error: "This account does not have admin privileges."
2. Set auth context role = 'admin'  
3. Redirect to /command

=== STEP 4: ROLE-BASED NAVIGATION ===

Update the top navigation bar to show different items based on auth state:

LOGGED OUT:
  Events | My Tickets | Scanner | AI Suite | Command | [Sign In button → /auth]

LOGGED IN AS STUDENT:
  Events | My Tickets | AI Suite | [Avatar + name, dropdown: Profile / Sign Out]
  Hide: Scanner, Command from nav (students access scanner only from event check-in flow)

LOGGED IN AS ADMIN:
  Events | Scanner | AI Suite | Command | [Avatar + "ADMIN" badge, dropdown: Sign Out]
  Hide: My Tickets (admins don't register as students)

=== STEP 5: ROUTE GUARDS ===

Add guards to these routes:
- /tickets → redirect to /auth/student if not logged in or not student role
- /command → redirect to /auth/admin if not logged in or not admin role
- /scanner → redirect to /auth if not logged in

Use Supabase auth state. Read role from profiles table after login.
Store role in React context (AuthContext) for use across the app.
```

---

## 10. Bolt Prompt 3 — Geofence at Scanner

> **Copy this entire prompt into Bolt**

---

```
TASK: Add geofence verification gate to the Scanner page BEFORE the camera activates.

=== CURRENT STATE ===
The /scanner page currently opens the camera immediately when user clicks "Open Camera Scanner".

=== NEW FLOW ===
Scanner page now has TWO steps:
  Step 1: Location Verification (geofence check)
  Step 2: Camera Scanner (only activates after Step 1 passes)

=== STEP 1: ADD EVENT SELECTOR TO SCANNER PAGE ===

At the top of the Scanner page, add a dropdown:
  Label: "SELECT EVENT TO SCAN FOR"
  Options: Fetch from Supabase — events where attendance_open = true AND date_time >= today
  Placeholder: "Choose an active event..."
  Style: full-width, dark bg, cyber blue border on focus

If no active events: show message "No events have opened their attendance window yet. Ask your organizer."

=== STEP 2: GEOFENCE GATE COMPONENT ===

After an event is selected from dropdown, show GeofenceGate component INSTEAD of the camera.

GeofenceGate component states:

STATE: 'idle'
┌─────────────────────────────────────────────┐
│  📡  LOCATION VERIFICATION REQUIRED          │
│                                              │
│  Event: [selected event name]                │
│  Venue: [event venue_name]                   │  ← pulled from events table
│  Required proximity: [radius_metres]m        │
│                                              │
│  The attendance scanner is geofenced.        │
│  You must be physically present at the       │
│  venue to scan and record attendance.        │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  📍  Verify My Location              │    │  ← cyber blue button
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘

STATE: 'checking' (after button click, while GPS + API call in progress)
  Show pulsing cyber blue ring animation
  Text: "Acquiring GPS signal..." then "Verifying position..."
  Use a 2-step loading text that alternates every 1.2s

STATE: 'verified' (GPS or IP check passed)
┌─────────────────────────────────────────────┐
│  ✅  LOCATION VERIFIED                        │
│  You are [distance]m from the venue.         │
│  Method: GPS  (or: Campus Network)           │
│                                              │  ← green success card
│  Scanner is now active. Point camera at      │
│  student QR tickets to record attendance.    │
└─────────────────────────────────────────────┘
  [Camera viewport appears BELOW this card]

STATE: 'failed' (outside geofence, GPS denied, or timeout)
┌─────────────────────────────────────────────┐
│  ❌  OUTSIDE GEOFENCE                         │
│  You are approximately [distance]m away.     │
│  Required: within [radius]m of venue.        │
│                                              │  ← red danger card
│  If you are at the venue, try these fixes:   │
│  • Move closer to a window for GPS signal    │
│  • Connect to campus Wi-Fi                   │
│  • Ask your admin to enable Demo Mode        │
│                                              │
│  [Try Again]  [Contact Organizer]            │
└─────────────────────────────────────────────┘

STATE: 'demo' (event has demo_mode = true, admin only)
┌─────────────────────────────────────────────┐
│  🔧  DEMO MODE ACTIVE                         │
│  Geofence bypassed for demonstration.        │  ← amber warning card
│  Scanner is open.                            │
└─────────────────────────────────────────────┘
  [Camera viewport appears BELOW this card]

=== STEP 3: GEOFENCE LOGIC (FRONTEND + SUPABASE FUNCTION) ===

Create a Supabase Edge Function at /functions/verify-location/index.ts:

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const phi1 = lat1 * Math.PI / 180
  const phi2 = lat2 * Math.PI / 180
  const dphi = (lat2 - lat1) * Math.PI / 180
  const dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dphi/2)**2 + Math.cos(phi1)*Math.cos(phi2)*Math.sin(dl/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

serve(async (req) => {
  const { lat, lng, event_id } = await req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  
  const { data: event } = await supabase.from('events').select('*').eq('id', event_id).single()
  
  if (event.demo_mode) return Response.json({ verified: true, method: 'demo', distance: 0 })
  
  const dist = haversine(lat, lng, event.venue_lat, event.venue_lng)
  if (dist <= event.radius_metres) return Response.json({ verified: true, method: 'gps', distance: Math.round(dist) })
  
  const ip = req.headers.get('x-forwarded-for') || ''
  if (event.allowed_ip_prefix && ip.startsWith(event.allowed_ip_prefix)) {
    return Response.json({ verified: true, method: 'ip', distance: Math.round(dist) })
  }
  
  return Response.json({ verified: false, method: null, distance: Math.round(dist) })
})
```

Call this from the React component:
```tsx
const verifyLocation = async () => {
  setGeoState('checking')
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { data } = await supabase.functions.invoke('verify-location', {
        body: { lat: pos.coords.latitude, lng: pos.coords.longitude, event_id: selectedEvent.id }
      })
      setDistance(data.distance)
      setMethod(data.method)
      setGeoState(data.verified ? 'verified' : 'failed')
    },
    (err) => { setGeoState('failed'); setDistance(null) },
    { timeout: 10000, enableHighAccuracy: true }
  )
}
```

=== STEP 4: VALID SCANS COUNTER UPDATE ===

The current page shows "Valid scans: 0" and "Invalid scans: 0".
After geofence is verified and camera is active:
- Successful QR scan → insert into attendance table with verified=true, verification_method from geofence result
- Failed QR scan → increment invalid counter
- Update both counters live without page reload
- Show last scanned student name + timestamp in a small log below the camera

=== STEP 5: STAT CARDS UPDATE ===

Current stat cards show "Valid scans" (green) and "Invalid scans" (red).
Add a third card: "Verification Method" showing 'GPS' / 'Network' / 'Demo' based on how the session was verified.
Style: same dark card, cyber blue text for label.
```

---

## 11. Bolt Prompt 4 — Admin Command Center Live Views

> **Copy this entire prompt into Bolt**

---

```
TASK: Update Command Center to show live admin data and add a student-facing dashboard.

=== PART A: ADMIN COMMAND CENTER — LIVE ATTENDEE FEED ===

The Operations Dashboard at /command currently shows placeholder zeros.
Connect it to Supabase Realtime for live data.

--- METRIC CARDS ---
Replace placeholder zeros with live Supabase queries:

1. "Total Events" card → SELECT COUNT(*) FROM events WHERE created_by = auth.uid()
2. "My Events" card → same as above (or events active today)
3. "Total Registrations" card → SELECT COUNT(*) FROM registrations WHERE event_id IN (admin's events)
4. "Attendance Rate" card → (checked_in count / total_registrations) * 100, formatted as "XX%"

Use Supabase Realtime channel to subscribe to registrations and attendance tables.
When a new row is inserted, re-fetch the counts and update the cards with a subtle pulse animation (0.3s cyber blue glow flash on the number).

--- LIVE ACTIVITY STREAM ---
The "Live Activity Stream" currently shows "Waiting for activity..."

Replace with a real Supabase Realtime subscription:
Subscribe to: INSERT on registrations, INSERT on attendance

For each event:
- Registration: show → "👤 [student_name] registered for [event_title]" + timestamp
- Check-in: show → "✅ [student_name] checked in to [event_title] • [method: GPS/Network/Demo]" + timestamp

Format each entry as a row:
  [icon] [message]                          [HH:MM:SS]
  
Show last 20 entries maximum. New entries appear at TOP with a fade-in slide-down animation (translateY(-8px) → 0, opacity 0 → 1, 300ms ease).
If no activity in 30 seconds, show a pulsing "● Listening for events..." text.

--- EVENTS TAB ---
Under Command Center → "Events" tab, show a table:

Columns: Event Name | Date | Registered | Capacity | Attendance % | Status | Actions

"Status" shows:
  - "OPEN" badge (cyber blue) when attendance_open = true
  - "SCHEDULED" badge (gray) when upcoming
  - "CLOSED" badge (dim) when past

"Actions" column has three icon buttons:
  [📋 Attendees] → opens a modal/drawer with full attendee list for that event
  [🔓 Open Window] / [🔒 Close Window] → toggles attendance_open in Supabase
  [🔧 Demo Mode] → toggles demo_mode in Supabase (only visible to admin)

Attendee modal/drawer:
  - Slide in from right
  - Title: "[Event Name] — Attendees"
  - Search box to filter by name/roll number
  - Table: Name | Roll No | Registered At | Checked In | Method
  - "Checked In" column: ✅ with time if yes, ⏳ if not yet
  - "Export CSV" button at top-right
  - Supabase Realtime: subscribe to attendance INSERT for this event_id
  - When new check-in appears, the row animates in (same fade-in as activity stream)

--- SEAT UTILIZATION ---
Connect the "Seat Utilization" card to real data:
  Bar per event: [event name] [████░░░░] 42% (42/100 seats)
  Color: cyber blue fill, dark bg track
  Subscribe to Realtime for live updates

=== PART B: STUDENT DASHBOARD VIEW ===

When a student logs in and visits /command (even though nav hides it), show a STUDENT version of the dashboard (not an error).

Student dashboard at /command (role = student):

Title: "My Campus Activity"
Subtitle: "Your registered events and check-in history."

Section 1 — MY REGISTERED EVENTS (table):
Columns: Event | Date | Venue | Seat Status | QR Ticket | Check-in Status

- "Seat Status" → "Confirmed" (cyber blue) or "Waitlisted" (amber)  
- "QR Ticket" → [View Ticket] button → opens the QR modal from My Tickets
- "Check-in Status" → "✅ Checked In [time]" or "⏳ Not yet"

Subscribe to Realtime on registrations WHERE student_id = auth.uid()
New registrations appear at top of table instantly.

Section 2 — ACTIVITY TIMELINE (vertical timeline):
Show chronological list of student's own events:
  [Date] — Registered for [Event Name]
  [Date] — Checked in to [Event Name] via GPS/Network
  
Style: left vertical line (cyber blue), dots on left, text on right.
Most recent at top.

Section 3 — STATS ROW (3 metric cards):
  Card 1: "Events Registered" → COUNT of student's registrations
  Card 2: "Events Attended" → COUNT where attendance exists
  Card 3: "Attendance Rate" → attended/registered as percentage

=== PART C: CERTIFICATES TAB (ADMIN ONLY) ===

The existing Certificates tab in Command Center:
1. Add event dropdown: "Select event to generate certificates for"
2. Only show events that have attendance_open = false (closed events) AND at least 1 check-in
3. "Generate Certificates" button → call Gemini 1.5 Flash API:
   - For each verified attendee, generate personalized certificate text
   - Show preview grid of certificate cards (name, event, date, unique code)
4. "Download All" button → render each cert as HTML and trigger browser print/save
5. Unique code format: ACRO-[EVENT_SHORTCODE]-[STUDENT_ROLL]-[TIMESTAMP_HASH]
```

---

## 12. Acceptance Criteria

### Theme (Prompt 1)
- [ ] AC-01: Zero instances of `#00FF87`, `#00E676`, or any neon green hex remain in codebase
- [ ] AC-02: All buttons, badges, stat numbers, and highlights display `#00D4FF`
- [ ] AC-03: Footer counter shows "Page 2 / 4" when scrolled to Core Modules section
- [ ] AC-04: Counter transitions smoothly (no flash) between sections
- [ ] AC-05: Counter is only visible on the landing page (`/`), hidden on all other routes

### Auth (Prompt 2)
- [ ] AC-06: `/auth` shows two-card role selector, not a login form
- [ ] AC-07: Student can sign up and is assigned `role = 'student'` in profiles table
- [ ] AC-08: Admin login rejects accounts where `profiles.role != 'admin'` with an error message
- [ ] AC-09: Logged-in student nav hides Scanner and Command tabs
- [ ] AC-10: Visiting `/command` as a student shows student dashboard, not admin dashboard
- [ ] AC-11: Visiting `/command` as a non-logged-in user redirects to `/auth`

### Geofence at Scanner (Prompt 3)
- [ ] AC-12: Camera does NOT open until geofence verification passes
- [ ] AC-13: "Checking" state shows animated GPS pulse for realistic feedback
- [ ] AC-14: Verified state shows distance in metres and method used
- [ ] AC-15: Failed state shows approximate distance and helpful troubleshooting tips
- [ ] AC-16: Demo mode (event.demo_mode = true) bypasses all location checks and shows amber warning card
- [ ] AC-17: Successful scan inserts to `attendance` table with `verified = true` and `verification_method`

### Admin Live Feed (Prompt 4)
- [ ] AC-18: Metric cards show live numbers, not zeros, within 2 seconds of page load
- [ ] AC-19: A new registration in a separate browser tab appears in Activity Stream within 1 second
- [ ] AC-20: Attendance Window toggle changes `attendance_open` in Supabase and reflects in Scanner immediately
- [ ] AC-21: Student dashboard at `/command` shows own registrations — no other students' data visible
- [ ] AC-22: Certificate generation produces unique codes per student (no duplicates)

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GPS denied by browser/device | Medium | High | IP subnet fallback; demo mode bypass |
| GPS inaccurate indoors | High | Medium | Set radius 150m; IP fallback; demo mode |
| Supabase Realtime drops during demo | Low | High | Manual refresh button as fallback |
| Gemini API quota hit during demo | Medium | Medium | Pre-cache one response per Gemini feature |
| Admin account not pre-seeded before demo | Medium | High | Seed script included; fallback: manually insert role='admin' in Supabase dashboard |
| Judges can't check in (not on campus Wi-Fi) | High | Medium | Demo mode toggle — must be tested before presentation |
| Color change breaks contrast ratios | Low | Low | Check against WCAG AA — cyan on black passes |

---

*AcroHive — IntelliAI Arena 2026 — CSE (AI & ML), AITR Indore*
*Think. Innovate. Survive.*
