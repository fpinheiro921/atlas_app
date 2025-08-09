# To-Do List

- [ ] Fix Firestore data deletion on login: The application is currently overwriting existing Firestore data with an empty local state when a user logs in from a new browser. The app should load data from Firestore first, and only save after the initial load is complete.
