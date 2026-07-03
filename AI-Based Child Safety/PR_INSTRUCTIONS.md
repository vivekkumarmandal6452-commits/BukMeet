# Pull Request Instructions (manual)

GitHub CLI (`gh`) is not available on this environment, so PR create must be done via browser.

## What is already done
- Commit pushed to: `https://github.com/vivekkumarmandal6452-commits/BukMeet.git` on branch `main`
- Latest commit: `bf6787a` - "Fix production root route to serve React frontend"

## Create PR
1. Go to: https://github.com/vivekkumarmandal6452-commits/BukMeet
2. Click **Compare & pull request** (or **Pull requests** → **New pull request**)
3. Ensure:
   - **base** = target branch (commonly `main` in your main repo)
   - **compare** = your branch (you are on `main` in your fork). If base and compare are the same, you need a new branch (see below).
4. Title: `Fix production root route to serve React frontend`
5. Description: `Production / now serves frontend index.html (prevents blank/JSON root page on Render).`
6. Click **Create pull request**.

## If base and compare are identical
Create a new branch locally and push it, then open PR.

Run (in repo):
- `git checkout -b blackboxai/fix-production-root`
- `git push -u origin blackboxai/fix-production-root`

Then create PR with compare=`blackboxai/fix-production-root` and base=`<target-branch>`.

