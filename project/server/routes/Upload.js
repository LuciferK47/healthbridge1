const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  res.send({ message: 'File uploaded successfully' });
});

module.exports = router;
