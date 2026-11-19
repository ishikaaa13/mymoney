# MyMoney — Personal Money Manager

A beginner-friendly personal finance website built with React and Vite. It uses browser LocalStorage, so transactions remain saved in the same browser on the same device.

## Features in version 1

- Add income and expense transactions
- Categories, dates and optional notes
- Monthly income, expenses and net balance
- Monthly spending budget and progress indicator
- Spending totals by category
- Filter transactions by income or expense
- Delete transactions
- Export the selected month's transactions to CSV
- Responsive layout for desktop and mobile screens

## Requirements

Install **Node.js LTS** from https://nodejs.org/. After installation, close and reopen PowerShell.

Check that Node.js and npm are available:

```powershell
node -v
npm.cmd -v
```

## Run the project on Windows

1. Extract the `mymoney.zip` file.
2. Open the extracted `mymoney` folder.
3. In File Explorer, click the address bar, type `powershell`, and press Enter.
4. Run:

```powershell
npm.cmd install
npm.cmd run dev
```

5. Vite will show a local address, usually `http://localhost:5173/`.
6. Ctrl-click the address in PowerShell, or copy it into your browser.

Keep the PowerShell window open while using the development website. Press `Ctrl + C` to stop it.

## Create a production build

```powershell
npm.cmd run build
```

The finished website files will be placed in the `dist` folder.

## Important data note

This first version stores data in the browser's LocalStorage. It does not have an account or cloud sync. Your entries are not automatically shared between devices or browsers. Clearing browser site data can remove the saved transactions, so export your records regularly using **Export CSV**.

## Project structure

```text
mymoney/
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```
