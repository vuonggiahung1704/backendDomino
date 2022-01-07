const fs = require('fs');

const deleteFile = (file) => {
  fs.unlink(`./src/uploads/${file}`, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
