# Speed_Friending

/project-root
│── /database
│   ├── database.py  <-- Database logic
│   ├── matchmaking.db  <-- SQLite file (auto-generated)
│── /static
    |── script.js
    |── style.css
│── /templates
   |── index.html
   |── opponet.html
   |── player.html
│── main.py  <-- Main Flask app
│── requirements.txt
│── render.yaml
|── Procfile
|── README.md

---

## **Speed Friending Game – Concept & Flow**  

### **Overview:**  

A social interaction game where participants meet new people through **randomized one-on-one conversations**. After each round, players **anonymously rate** their conversation partners, and the process continues until everyone has interacted with multiple participants.  

### **Game Flow:**  

1. **Player Registration:**  
   - Each participant fills in a brief form with details like:  
     - **Name (or Nickname)**  
     - **Gender (Optional)**  
     - **Interests (Hobbies, Study Program, etc.)**  
     - **Fun Fact or Icebreaker Question (Optional)**  

2. **Random Matching:**  
   - The system assigns each player a **random conversation partner**.  
   - Each round lasts for a **fixed duration** (e.g., 3-5 minutes).  
   - Players meet at a designated table and engage in conversation.  

3. **Rating System:**  
   - After each interaction, both participants **rate each other anonymously**.  
   - The rating can include:  
     - **Friendliness** 🌟 (1-5)  
     - **Shared Interests** 🤝 (Yes/No)  
     - **Would you talk again?** 🔄 (Yes/No)  
   - Feedback remains **confidential**, and players only see their **overall score** at the end.  

4. **Next Round:**  
   - The player is assigned a **new random opponent**.  
   - The process repeats until everyone has interacted with multiple players.  

5. **Final Summary:**  
   - At the end of the game, each player gets their **anonymous rating summary**, such as:  
     - “You received an average Friendliness rating of **4.5/5**.”  
     - “80% of participants would talk to you again!”  

### **Game Rules & Setup:**  

- Players seated at **fixed tables (opponents stay at their tables)**.  
- The **approaching players rotate** to the next table after each round.  
- **Time limit per round** ensures smooth transitions.  

### **Why It Works:**  

✅ **Encourages socializing in a fun & structured way**  
✅ **Removes awkwardness with guided interactions**  
✅ **Fosters meaningful connections through shared interests**  
✅ **Gives participants feedback on their social skills (anonymously)**  

---
