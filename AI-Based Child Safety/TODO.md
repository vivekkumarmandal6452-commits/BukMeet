# TODO - Login fix

## Plan summary
1. Verify backend JWT generation/verification robustness (JWT_SECRET missing/invalid cases) and improve error messages.
2. Update auth middleware to handle JWT_SECRET safely and keep demo login working.
3. Run backend/frontend build/test.

## Steps
- [ ] Read existing auth controller + auth middleware (already partly read, may re-check after edits)
- [ ] Edit `backend/controllers/authController.js` (generateToken guard + clearer error)
- [ ] Edit `backend/middleware/auth.js` (verify guard + log reason)
- [ ] Restart backend and try `/login` with demo credentials
- [ ] If still fails, inspect console/network errors and adjust frontend API baseURL or token storage

