# Bottleneck Bots - Quick Start Guide

**Get up and running in 15 minutes**

**Version**: 1.0
**Last Updated**: December 2025
**Audience**: New Users

---

## Welcome to Bottleneck Bots!

This guide will help you get started with AI-powered GoHighLevel automation in just 15 minutes. By the end, you'll have:

- Your account configured
- Your first automation running
- An understanding of key features
- Confidence to explore more

**Time Investment**: 15 minutes
**Result**: Your first successful automation

---

## Table of Contents

1. [Account Setup (3 minutes)](#account-setup)
2. [First Login (2 minutes)](#first-login)
3. [Connect GoHighLevel (4 minutes)](#connect-gohighlevel)
4. [Run Your First Automation (5 minutes)](#run-your-first-automation)
5. [What's Next?](#whats-next)
6. [Need Help?](#need-help)

---

## Account Setup

### Step 1: Create Your Account (1 minute)

1. **Visit** your Bottleneck Bots instance URL
2. **Click** "Sign Up" or "Get Started"
3. **Choose** authentication method:
   - Google (recommended for speed)
   - GitHub
   - Email + Password

**Using Google**:
- Click "Continue with Google"
- Select your Google account
- Approve permissions
- You're in!

**Using Email**:
- Enter email address
- Create secure password (min 8 characters)
- Verify email (check inbox)
- Click verification link

### Step 2: Choose Your Plan (1 minute)

Select the plan that fits your needs:

| Plan | Best For | Monthly Executions | Price |
|------|----------|-------------------|-------|
| **Starter** | Solo users, testing | 500 | $99/mo |
| **Growth** | Small agencies | 2,000 | $249/mo |
| **Professional** | Growing agencies | 10,000 | $499/mo |
| **Enterprise** | Large operations | Unlimited | Custom |

**Recommendation for First-Time Users**: Start with **Starter** plan. You can upgrade anytime.

**Click** your preferred plan → **Enter** payment details → **Confirm**

### Step 3: Complete Onboarding (1 minute)

Answer a few quick questions:

1. **What's your primary use case?**
   - Automate GoHighLevel tasks
   - Browser automation
   - Data extraction
   - All of the above

2. **How many clients do you manage?**
   - 1-10
   - 11-50
   - 50+

3. **What's your experience level?**
   - Beginner (new to automation)
   - Intermediate (some automation experience)
   - Advanced (automation expert)

These answers help us customize your experience.

**Click** "Complete Setup"

---

## First Login

### What You'll See

Upon login, you'll land on the **Dashboard Home**:

**Top Navigation Bar**:
- Logo (top-left) - Click to return home
- Main menu: Agent Dashboard, Swarms, Browser Sessions, Settings
- User menu (top-right) - Profile, Settings, Logout
- Notification bell - Alerts and updates

**Quick Stats** (4 cards across top):
- Active Tasks: 0 (no tasks running yet)
- Total Executions: 0 (you haven't run anything)
- Success Rate: N/A (no history yet)
- Subscription: Your plan name + usage

**Getting Started Checklist**:
A helpful widget showing setup progress:
- [x] Account created
- [ ] GoHighLevel connected
- [ ] First automation run
- [ ] Subscription configured

### Explore the Interface

Take 1 minute to familiarize yourself:

1. **Click** "Agent Dashboard" in the navigation
   - This is where you'll create and monitor tasks
   - Large text input for task descriptions
   - Real-time execution viewer

2. **Click** "Browser Sessions"
   - Shows active browser automation sessions
   - Empty for now (you haven't run anything yet)

3. **Click** "Settings" (gear icon or menu)
   - API Keys
   - OAuth Integrations
   - Webhooks
   - Preferences

**Don't configure anything yet - we'll do this in the next section**

---

## Connect GoHighLevel

To automate GoHighLevel, you need to connect your GHL account.

### Option A: OAuth Connection (Recommended - 2 minutes)

**Most secure and easiest method**

1. **Navigate to Settings**
   - Click Settings in main menu
   - Or click gear icon in top-right

2. **Go to OAuth Integrations tab**
   - Should be the second tab
   - Scroll to find "GoHighLevel"

3. **Connect GoHighLevel**
   - Click "Connect" button on GHL card
   - OAuth popup window opens
   - **Log in** to your GoHighLevel account
   - **Approve** requested permissions:
     - Read contacts
     - Write contacts
     - Manage campaigns
     - Manage workflows
     - Manage calendars

4. **Verify Connection**
   - Popup closes automatically
   - GHL card now shows "Connected" with green checkmark
   - Your GHL email address displayed

**Troubleshooting**:
- **Popup blocked?** Enable popups for this site in browser settings
- **Connection failed?** Try incognito/private browsing mode
- **Wrong account?** Click "Disconnect" and reconnect with correct account

### Option B: API Key (Alternative - 4 minutes)

**Use this if OAuth doesn't work**

1. **Get GHL API Key**:
   - Log in to GoHighLevel
   - Navigate to Settings → Integrations
   - Find "API Key" section
   - Click "Generate API Key" or copy existing key

2. **Add to Bottleneck Bots**:
   - In Bottleneck Bots: Settings → API Keys tab
   - Click "+ Add API Key"
   - Select "GoHighLevel" from dropdown
   - Paste your API key
   - Click "Test" to verify
   - If green checkmark appears, click "Save"

### Configure Required AI Model

Bottleneck Bots uses AI to understand your tasks. You need one of these:

**Choose One**:

**Option 1: Google Gemini** (Recommended for beginners - cheapest)
1. Visit https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with "AIza...")
4. In Bottleneck Bots: Settings → API Keys → Add API Key
5. Select "Google Gemini"
6. Paste key → Test → Save

**Option 2: OpenAI** (Most popular)
1. Visit https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with "sk-...")
4. In Bottleneck Bots: Settings → API Keys → Add API Key
5. Select "OpenAI"
6. Paste key → Test → Save

**Option 3: Anthropic Claude** (Best quality)
1. Visit https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key (starts with "sk-ant-...")
4. In Bottleneck Bots: Settings → API Keys → Add API Key
5. Select "Anthropic"
6. Paste key → Test → Save

**Cost Comparison**:
- Gemini: ~$0.01 per task (cheapest)
- OpenAI: ~$0.05 per task
- Claude: ~$0.08 per task (highest quality)

### Verify Setup

**Quick Check**:
1. Settings → API Keys
2. You should see:
   - GoHighLevel: ✓ Valid (green checkmark)
   - AI Model (Gemini/OpenAI/Claude): ✓ Valid

If both show green checkmarks, you're ready to automate!

---

## Run Your First Automation

### Choose Your First Task

We'll start with something simple: **Create a contact in GoHighLevel**

This task will:
- Navigate to your GHL Contacts
- Open the contact creation form
- Fill in the details
- Save the contact

**Time**: 1-2 minutes to complete

### Step-by-Step

#### 1. Open Agent Dashboard (30 seconds)

- Click "Agent Dashboard" in main navigation
- You'll see a large text input field labeled "New Task"
- This is where you describe what you want the agent to do

#### 2. Enter Task Description (1 minute)

**Copy and paste this into the Task Input field**:

```
Navigate to GoHighLevel Contacts and create a new contact with these details:
- First Name: Alex
- Last Name: Demo
- Email: alex.demo@example.com
- Phone: (555) 123-4567
- Tags: "Quick Start", "Test Contact"
- Source: Website

After creating the contact, take a screenshot to confirm it was created successfully.
```

**Why this task description works**:
- Clearly states the goal (create a contact)
- Specifies exact location (GoHighLevel Contacts)
- Provides all necessary data
- Requests confirmation (screenshot)

#### 3. Execute the Task (10 seconds)

- **Click** the "Execute" button (blue button)
- Or press `Enter` on your keyboard

**What happens next**:
1. System validates your subscription has available executions
2. Agent begins "Planning" phase (5-15 seconds)
3. Status indicator turns blue with brain icon
4. You'll see thinking steps appear in the center panel

#### 4. Watch It Work (1-2 minutes)

**Planning Phase** (10-20 seconds):
```
Agent is thinking:
"I need to create a contact in GoHighLevel.
First, I'll navigate to app.gohighlevel.com.
Then I'll find the Contacts section.
I'll click the Add Contact button.
I'll fill in all the provided fields.
Finally, I'll save and screenshot the result."
```

**Executing Phase** (1-2 minutes):

Watch the real-time updates:

**Left Panel** - Current Execution card shows:
- Status badge: "Executing" (amber/yellow)
- Progress bar filling up
- Current step description

**Center Panel** - Agent Thinking shows:
- Each thought step
- Confidence levels
- Decision making process

**Right Panel** - Browser Preview shows:
- Live screenshot of what agent sees
- Updates every 2-3 seconds
- Red box highlights elements being clicked

**Log Stream** (bottom of left panel):
```
[14:30:01] 🔵 INFO: Starting execution
[14:30:03] ✅ SUCCESS: Browser session created
[14:30:05] 💻 SYSTEM: Navigating to app.gohighlevel.com
[14:30:10] ✅ SUCCESS: Logged into GoHighLevel
[14:30:12] 🔵 INFO: Clicking Contacts menu
[14:30:15] ✅ SUCCESS: Contacts page loaded
[14:30:17] 🔵 INFO: Clicking Add Contact button
[14:30:20] ✅ SUCCESS: Contact form opened
[14:30:22] 🔵 INFO: Filling First Name: Alex
[14:30:24] 🔵 INFO: Filling Last Name: Demo
[14:30:26] 🔵 INFO: Filling Email: alex.demo@example.com
[14:30:28] 🔵 INFO: Filling Phone: (555) 123-4567
[14:30:32] 🔵 INFO: Adding tags: Quick Start, Test Contact
[14:30:35] 🔵 INFO: Selecting source: Website
[14:30:37] 🔵 INFO: Clicking Save button
[14:30:40] ✅ SUCCESS: Contact created successfully
[14:30:42] 🔵 INFO: Taking confirmation screenshot
[14:30:43] ✅ SUCCESS: Screenshot captured
```

#### 5. Review Results (1 minute)

**When execution completes**:

1. **Status changes to "Completed"** (green checkmark)
2. **Completion message appears**:
   ```
   Task completed successfully!
   Duration: 1m 42s
   Contact created: con_abc123
   ```
3. **Screenshot shows the new contact** in GHL

**Verify in GoHighLevel** (optional):
1. Log in to GHL manually
2. Go to Contacts
3. Search for "Alex Demo"
4. Confirm all details match

**Congratulations!** You just ran your first automation.

### What You Learned

In this first automation, you:
- Wrote a task description in natural language
- Watched the AI agent plan and execute
- Monitored real-time progress
- Verified successful completion

**Key Takeaways**:
- Task descriptions should be clear and specific
- Agent shows you its thinking process (transparency)
- Real-time browser preview lets you watch it work
- Logs provide detailed step-by-step record

---

## What's Next?

Now that you've run your first automation, here's how to level up:

### Immediate Next Steps (Next 15 minutes)

**1. Try a Template** (5 min)

Templates are pre-configured tasks for common operations:

1. Click "Templates" tab in right panel
2. Browse available templates
3. Select "Create Email Campaign"
4. Template populates task field with structured description
5. Customize with your details
6. Execute

**Popular Templates to Try**:
- Create Contact
- Update Contact Details
- Create Email Campaign
- Extract Contact List
- Schedule Appointment

**2. Explore the Dashboard** (5 min)

- **Execution History**: Click "View All Executions" to see your completed tasks
- **Browser Sessions**: View active and past browser automation sessions
- **Swarm Coordination**: For complex multi-step tasks (advanced)
- **Settings**: Explore available configurations

**3. Read the Docs** (5 min)

Bookmark these guides for deeper learning:

- **[Agent Dashboard User Guide](/root/github-repos/active/ghl-agency-ai/docs/AGENT_DASHBOARD_USER_GUIDE.md)**: Complete dashboard walkthrough
- **[GHL Automation Tutorials](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md)**: 10 step-by-step tutorials
- **[User Guide](/root/github-repos/active/ghl-agency-ai/docs/USER_GUIDE.md)**: Comprehensive platform documentation
- **[Troubleshooting Guide](/root/github-repos/active/ghl-agency-ai/docs/TROUBLESHOOTING.md)**: Solutions to common issues

### Progressive Learning Path

**Week 1: Master the Basics**
- Day 1: Create 3-5 contacts (different variations)
- Day 2: Try updating existing contacts
- Day 3: Create a simple email campaign
- Day 4: Set up a basic workflow
- Day 5: Explore task templates

**Week 2: Intermediate Automations**
- Create multi-email campaigns
- Set up appointment booking
- Build workflows with conditional logic
- Import contacts from CSV
- Configure webhooks

**Week 3: Advanced Features**
- Multi-step workflows
- Swarm coordination for complex tasks
- Custom field management
- A/B testing campaigns
- Performance optimization

**Month 2+: Business Integration**
- Full lead-to-customer automation
- Multi-channel campaigns (email + SMS)
- Advanced segmentation
- Custom reporting dashboards
- Integration with external tools

### Recommended Tutorials (In Order)

Follow these tutorials in sequence:

1. **[Tutorial 1: Creating Your First Contact](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md#tutorial-1-creating-your-first-contact)** (10 min)
   - You already did this! Review for reinforcement

2. **[Tutorial 2: Building an Email Campaign](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md#tutorial-2-building-an-email-campaign)** (20 min)
   - Create multi-email nurture sequence
   - Learn campaign settings

3. **[Tutorial 3: Setting Up Automated Workflows](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md#tutorial-3-setting-up-automated-workflows)** (30 min)
   - Build trigger-based automation
   - Use conditional logic

4. **[Tutorial 5: Managing Appointments and Calendar](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md#tutorial-5-managing-appointments-and-calendar)** (20 min)
   - Set up appointment booking
   - Configure reminders

5. **[Tutorial 6: Bulk Contact Import](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md#tutorial-6-bulk-contact-import)** (30 min)
   - Import CSV files
   - Map fields correctly

### Quick Tips for Success

**1. Start Small**
- Begin with simple tasks
- Add complexity gradually
- Don't try to automate everything at once

**2. Use Clear Language**
- Write task descriptions as if explaining to a person
- Be specific about what you want
- Include all necessary details

**3. Learn from History**
- Review completed executions
- See what worked well
- Learn from any failures

**4. Provide Feedback**
- Rate executions (thumbs up/down)
- Agent learns from your feedback
- Helps improve future performance

**5. Monitor Your Usage**
- Check execution count regularly
- Plan high-volume tasks strategically
- Upgrade plan if needed

---

## Need Help?

### Quick Reference

**Common Questions**:

**Q: How many executions do I have left?**
A: Check the Subscription Usage widget (top-right of dashboard). Shows X / Y used.

**Q: What if a task fails?**
A: Review the error message in logs, adjust task description, and retry. See [Troubleshooting Guide](/root/github-repos/active/ghl-agency-ai/docs/TROUBLESHOOTING.md).

**Q: Can I cancel a running task?**
A: Yes! Click "Terminate" button in Current Execution card.

**Q: How do I upgrade my plan?**
A: Settings → Subscription → "Upgrade Plan"

**Q: Can I pause a task?**
A: Yes! Click "Pause" button. Resume anytime with no progress lost.

### Get Support

**Documentation**:
- Knowledge Base: `/docs` folder
- Video Tutorials: Coming soon
- Community Forum: Coming soon

**Direct Support**:

**Starter Plan**:
- Email: support@bottleneckbots.com
- Response: Within 48 hours

**Growth Plan**:
- Email + Live Chat
- Response: Within 24 hours

**Professional Plan**:
- Email + Live Chat
- Response: Within 12 hours
- Priority queue

**Enterprise Plan**:
- 24/7 Phone Support
- Dedicated Success Manager
- 4-hour response SLA

### Helpful Resources

**Step-by-Step Guides**:
1. [Agent Dashboard User Guide](/root/github-repos/active/ghl-agency-ai/docs/AGENT_DASHBOARD_USER_GUIDE.md)
2. [GHL Automation Tutorials](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md)
3. [User Guide](/root/github-repos/active/ghl-agency-ai/docs/USER_GUIDE.md)

**Technical Documentation**:
1. [API Reference](/root/github-repos/active/ghl-agency-ai/docs/API_REFERENCE.md)
2. [Troubleshooting](/root/github-repos/active/ghl-agency-ai/docs/TROUBLESHOOTING.md)
3. [Architecture](/root/github-repos/active/ghl-agency-ai/docs/ARCHITECTURE.md)

**Video Walkthroughs** (Coming Soon):
- Account setup and first login
- Creating your first automation
- Building email campaigns
- Setting up workflows
- Advanced features overview

### Community

**Join the Conversation**:
- Discord Server: Coming soon
- Community Forum: Coming soon
- Monthly Webinars: Coming soon
- Newsletter: Subscribe in Settings

**Share Your Wins**:
- Tag us on social media
- Share success stories
- Request features
- Contribute to docs

---

## Quick Start Checklist

Use this checklist to track your progress:

**Initial Setup** (15 minutes)
- [ ] Account created
- [ ] Plan selected and payment configured
- [ ] First login completed
- [ ] GoHighLevel connected (OAuth or API key)
- [ ] AI model API key configured (Gemini/OpenAI/Claude)
- [ ] First automation executed successfully
- [ ] Verified contact created in GHL

**First Week Goals**
- [ ] Run 5+ different automations
- [ ] Try 3+ task templates
- [ ] Create an email campaign
- [ ] Set up a basic workflow
- [ ] Review execution history
- [ ] Read Agent Dashboard User Guide
- [ ] Complete Tutorial 1 and 2

**First Month Goals**
- [ ] Build complete lead capture funnel
- [ ] Create multi-channel nurture campaign
- [ ] Set up appointment booking
- [ ] Import contacts from CSV
- [ ] Configure webhooks
- [ ] Complete all 10 tutorials
- [ ] Optimize at least 3 automations based on data

---

## Congratulations!

You've completed the Quick Start Guide and run your first automation. You now have:

- A configured account
- GoHighLevel connected
- Your first successful automation
- Knowledge to build more

**What makes you successful**:
- Curiosity to experiment
- Willingness to learn from mistakes
- Consistent practice with small tasks
- Gradual progression to complex automations

**Remember**:
- Every expert was once a beginner
- Start simple, add complexity gradually
- Learn from execution history
- Use templates as learning tools
- Ask for help when stuck

**Your Next Action**:
1. Bookmark the documentation
2. Try one more automation right now
3. Choose your next tutorial
4. Set a goal for this week

---

## Welcome to the Future of Automation!

You're now part of a growing community using AI to automate repetitive tasks, save time, and scale operations.

**Questions? Comments? Feedback?**
- Email: support@bottleneckbots.com
- Docs: https://docs.bottleneckbots.com
- Updates: Follow us for new features and tips

**Happy Automating!**

---

*Last Updated: December 2025*
*Version: 1.0*
*For: Bottleneck Bots - GHL Agency AI Platform*
