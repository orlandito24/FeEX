https://learngitbranching.js.org/ - site provided to practice git commands and their interactions with branches, commits, remote and local repositories

Git Commands Used

- git commit - Record changes to the repository
    -a, --all - adds all changes in the changing area to be commited
    -m - allows you to attach a message to the commit
- git cherry-pick - Apply changes from existing commits
- git gc - Cleanup unnecessary files and optimize the repository
- git pull  - Fetch from and integrate with another repository or branch
    --force - forces the pull regardless of how the local repository commit history is
    --rebase - pulls from remote but moves commits around on local to fit with the remote
- git clone - Clone a repository into a local directory
- git fetch - Download objects and refs from a repository
    --force
- git branch - List, create, or delete branches
    -a - lists all local and remote tracking branches
- git add <file> - Add file contents to the staging area
    -A - allows for all edited files to be added
- git restore - Restore working tree files
- git reset - Reset current HEAD to a specified state
- git revert - Revert some existing commits
- git merge - Joins two or more development history together
- git log  - Show commit logs
- git rebase - Reapply commits on top of another base tip
    -i - interactive flag that allows you to move commits around, rename, remove etc.
- git status - Show the working tree status
- git checkout - Switch branches or restore working tree files
    -b <branch-name> - allows you to create a new branch and check it out
- git push  - Pushes any local commits onto the remote repository
- git describe - Give an object a human readable name
- git tag  - Create, list, or delete tag references
- git switch - Switch branches
    -c <branch-name> - does same thing as checkout with flag but is the better practice command