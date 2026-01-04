# Requirements & Features

## User Stories
**As a general visitor/participant:**
- I can view a directory of all amateur radio NETs.
- I can filter the NET directory to find NETs that interest me.
- I can view the details of a specific NET, including its schedule and technical information.
- I can see which NETs are currently live.
- I can view the live check-in log for an active session.
- I can look up my own or another operator's call sign to see their participation history and earned awards.

**As a Net Control Operator (NCO):**
- I can register for an account to manage my NETs.
- I can log in to my account securely.
- After my account is approved by an admin, I can create, edit, and delete the NETs I manage.
- I can configure detailed schedules for my NETs (weekly, daily, monthly).
- I can specify the technical details of my NET (repeater info, frequencies, etc.).
- I can start a live session for one of my NETs.
- During a live session, I can log check-ins from participants in real-time.
- I can edit or delete check-ins if I make a mistake.
- I can end a session, which archives the log.
- I can create a roster of regular members for my NET to speed up check-ins.
- I can delegate management permissions to other users by creating a passcode for my NET.

**As an Administrator:**
- I can view a list of all registered users.
- I can approve new NCO accounts to grant them management privileges.
- I can revoke access for existing NCOs if necessary.

## Feature Backlog
- ✅ Authentication (Supabase magic links)
- ✅ User Stories
- 🔲 Preferred Name
- 🔲 Join Net


## Acceptance Criteria
- All CRUD operations persist reliably in Supabase.
- Authenticated users only see their own data.
- AI prioritization produces useful recommendations.

## Priorities
- MVP: Auth + CRUD tasks
- Next: AI prioritization
