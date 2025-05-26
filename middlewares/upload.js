const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + '-' + file.originalname;
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });

module.exports = upload;
