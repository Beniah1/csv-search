# CSV Search App

A simple web application that allows users to upload CSV files and search through the data. The app works directly in the browser and requires no backend server.

## Features

- Upload and parse CSV files
- Search through CSV data
- Responsive design
- Works offline
- Free to host and use

## How to Host on GitHub Pages (Free Hosting)

1. Create a GitHub account if you don't have one at https://github.com/signup
2. Create a new repository at https://github.com/new
3. Name your repository (e.g., `csv-search`)
4. Make it Public
5. Don't initialize with any files
6. After creating the repository, run these commands in your terminal (replace `yourusername` with your GitHub username):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/csv-search.git
git push -u origin main
```

7. Go to your repository's settings
8. Scroll down to "GitHub Pages" section
9. Under "Source", select "main" branch
10. Click Save

Your site will be available at: `https://yourusername.github.io/csv-search`

## Local Development

Simply open `index.html` in your web browser to run the application locally.

## File Format

The CSV file should have headers in the first row. You can download the sample.csv file from the application to see the expected format.

## Data Storage

The application uses the browser's localStorage to store the CSV data. This means:
- Data persists even after closing the browser
- Each user has their own private data storage
- Data can be cleared by clearing browser data
- No server storage costs
