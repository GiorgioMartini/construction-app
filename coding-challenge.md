# Assessment for SR. FULL STACK DEVELOPER - REACT , NODE.JS

---

## Hi 👋😊

Thank you for taking the time to speak with us and for tackling the assessment – we really appreciate the effort you're putting in.

We’ll review your submission thoroughly on our end.

Please make sure to send us the completed assessment **within 7 days** of receiving it. That’s the deadline – no extensions unless agreed beforehand.

While we generally **don’t provide support or clarifications** during the task, you're always welcome to reach out if something is completely unclear. If you're unsure about a detail, we encourage you to go with what you believe is the most practical and professional approach.

If everything looks good and we don’t find any major issues, the next step will be a **60-minute final call**. In that call, we’ll go through your solution, give feedback, maybe ask a few technical questions, and you’ll also have a chance to ask us anything you'd like.

Looking forward to seeing what you build and we really hope that we will be able to wotj together on awesome things for a very long time to come! 🚀

## Construction tasks Web-App

Build a minimal **offline-first** Web-App where users can create “construction tasks” on a floor-plan.

**Tech stack constraints**

- Use latest React
- Use Latest RxDB (No native RxDB sync helper)
- TS strict mode
- Zustand for state (or Redux, but Zustand is preferred)
- Use React-Router
- Styling: tailwind or something similar; no CSS frameworks that hide the DOM.

High-level:

1. **Login-light** – user enters a _name_ (no password).

   Everything should be handled inside the DB. Multiple users should be able to login. No real authentication necessary. If the user doesn’t exist, a new user is created. The data from the users is separated so that user A can’t access Data of user B.

2. **Plan view**
   - Load the supplied example-construction plan:
     ![image.png](attachment:faccddd0-fa51-4ae3-a40b-effcefaf974c:image.png)
   - User should be able to add tasks. The tasks will be shown in a board/list and on the plan
     ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/c0e5ea69-8984-447d-993c-ea3e88115d43/1ef40e80-935b-43e6-adfb-77d905bf3f8e/Untitled.png)
3. **Add / edit task and checklists**
   - Each task will have
     - A title
     - Checklist
       - Inspiration for design: https://www.figma.com/design/ItlX4Eej7yhKq92k29oNSb/Assessment?node-id=1-76
       - A default checklist will be shown for each new task
       - Users will be able to edit, delete and add new checklist items+
       - Each checklist item can be "checked oof", with the following statuses:
         - No started
         - In progress
         - Blocked
         - Final Check awaiting
         - Done
4. **Task board/list**
   - List of tasks.
5. **Real offline**
   - All data should be saved and accessible offline.

### Handover

Send us a **GitHub link or ZIP** with:

- the code
- `/README.md`
  - **Time you spent on each feature or task.**
  - All necessary instructions
  - Due to limited time, you might have some things, that you would like to refactor/improve in the code. What would these be?
  - Create a very short video explaining the code and the functionality.
