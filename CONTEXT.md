# Ask AI

An assistant on the portfolio that lets a recruiter or HR contact ask about Tharit's background, projects, and fit for their company. It answers only from what Tharit has chosen to expose.

## Language

**Visitor**:
Anyone who opens Ask AI. Usually an HR contact or recruiter, but not verified to be one.
_Avoid_: User, HR (as a type)

**Intro**:
The self-reported name, role, and company a Visitor gives before asking. Unverified.
_Avoid_: Registration, sign-up, login

**Ask Session**:
A Visitor's bounded run of questions, starting after the Intro and ending when the Question Allowance is spent or the session expires.
_Avoid_: Chat, conversation, account

**Question Allowance**:
The number of questions one Ask Session may ask.
_Avoid_: Quota, rate limit

**Knowledge Brief**:
The curated, reviewed summary of Tharit's resume, projects, and stated preferences that is the only source the assistant answers from.
_Avoid_: Knowledge base, corpus, documents

**Gate**:
The check on each Visitor message that decides whether it is answered, refused, or turned into a Contact Request, before any answer is written.
_Avoid_: Filter, guardrail, moderation

**Off-topic Message**:
A message that is not about Tharit's experience, projects, or fit for a role. Refused with a pointer back to on-topic questions.
_Avoid_: Irrelevant question

**Contact Request**:
A Visitor asking for Tharit's phone number or email. Answered by a confirmation dialog, not by text.
_Avoid_: Contact question

**Activity Feed**:
The private stream where Tharit sees each Visitor's Intro and questions.
_Avoid_: Analytics, admin page, dashboard
