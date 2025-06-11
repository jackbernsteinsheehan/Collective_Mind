# Getting Started
- - - - - - - - - - - - - - - - - -
- In your finder, navigate to the location that you want to store the project (documents, desktop, some other folder) and create a new, empty folder
- Open the folder in your code editor and open a new terminal
- Run git clone [repo url]
- Enter your github username and password. If login fails, follow these steps, if not, skip ahead
    - on github, go to your profile on the top right and click settings -> developer settings (bottom left) 
    - click personal access tokens -> tokens (classic) -> generate new token -> generate new token (classic)
    - copy the token, you can only see it once
    - go back to the last step and enter the token instead of your password
- You should see the codebase appear in your editor.

# Starting Work
- - - - - - - - - - - - - -
- On the <> Code page for our repo, click main -> view all branches -> new branch
- Name it something like what I did (jack_workbranch)
- Open the issues page on GitHub, within our repo, and check if you have any issues assigned to you
- If you do, begin working on them
- When you're done, commit the changes to your branch by running in your terminal, one line at a time:
  git fetch
  git branch -r
  make sure you're on your workbranch. If not, run 
  git add .
  git commit -m "enter message here"
  
  
