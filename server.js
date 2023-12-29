const express = require ("express");
const mysql = require ('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file);
  const image = req.file.filename;
  const userId = req.body.userId; 

  const sql = 'UPDATE users SET image = ? WHERE id = ?';
  const values = [image, userId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating profile image:', err);
      return res.json({ Message: "Error" });
    }
    return res.json({ Status: "Success" });
  });
});

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "lostlinker_server"
})

app.post('/sign-up', (req, res) =>{
    const sql = "INSERT INTO users(`name`, `institute`, `code`, `email`, `password`) VALUES (?)";
    const values = [
        req.body.name,
        req.body.institute,
        req.body.code,
        req.body.email,
        req.body.password,
    ]
    db.query(sql, [values], (err, data) =>{
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT name, institute, email, password, code, image FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

app.delete('/user/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({ message: 'Account deleted successfully' });
    }
  });
});






app.listen(5000, () => {
    console.log("listening");
})