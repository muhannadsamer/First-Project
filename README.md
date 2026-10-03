
# Expense Tracker - Full Stack Web Application

A complete Full-Stack web application built to track personal expenses .

## Features

- [x] Add an expense (with validation)
- [x] Delete an expense
- [x] Edit an expense
- [x] Filter by category
- [x] Summary cards (total, count, highest)
- [x] Data is saved in a PostgreSQL database
- [x] **Bonus:** Search by Title (Live search functionality)
- [x] **Bonus:** Dark Mode


## Technologies Used
- **Frontend:** HTML5, CSS3 (Grid), JavaScript (Fetch API, async/await, DOM manipulation), Bootstrap 5.3.
- **Backend:** Node.js, Express.js, CORS, dotenv.
- **Database:** PostgreSQL (using the `pg` library).

## How to Run the Project from Zero

### 1. Database Setup
1. Open pgAdmin and create a new database named `expense_tracker`.
2. Open the Query Tool and run the SQL commands found in `backend/schema.sql` to create the `expenses` table and insert initial sample data.

### 2. Backend Setup
1. Open your terminal and navigate to the `backend` folder: `cd backend`
2. Install the required dependencies: `npm install`
3. Create a `.env` file in the `backend` folder (use `.env.example` as a template) and add your PostgreSQL password: `DB_PASSWORD=your_password_here`
4. Start the server: `node server.js`
   - The API will be running on `http://localhost:3000`

### 3. Frontend Setup
1. Open the `frontend` folder in VS Code.
2. Run the `index.html` file using the **Live Server** extension.
3. The application will open in your default browser and automatically fetch data from the backend.

## Screenshots
All project screenshots can be found in the `images` folder within the repository.

## Demo Video
https://drive.google.com/file/d/1Vb838UjM550DSu4Fbk9sX-uCJGZydWyV/view?usp=sharing


## GitHub Repository Link
You can find the project repository on GitHub here:
[https://github.com/muhannadsamer/First-Project.git](https://github.com/muhannadsamer/First-Project)

## What was the hardest part?

**Challenge:** Managing state and ensuring the UI (table and summary cards) updates instantly after every POST, PUT, or DELETE request without forcing a full page reload, which is crucial for a smooth user experience.

**Solution:** I utilized `async/await` with the `fetch` API to handle asynchronous server requests. By calling `e.preventDefault()` on form submissions and immediately invoking the `fetchExpenses()` function after every successful API call, I ensured the frontend always syncs with the latest database state smoothly and dynamically.