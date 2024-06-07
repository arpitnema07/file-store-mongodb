const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;
const env = require("dotenv");
env.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

// Mongo URI
const mongoURI = process.env.DATABASE_URL;
// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;
let safeGfs;
conn.on("error", (err) => {
  console.log("Could not connect to mongo server!");
  console.log(err);
});
conn.once("open", () => {
  console.log("MongoDB Connected...");
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  safeGfs = Grid(conn.db, mongoose.mongo);
  safeGfs.collection("safeUploads");
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: file.originalname,
        bucketName: "uploads",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get("/", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render("index", { files: false });
    } else {
      files.map((file) => {
        if (
          file.contentType === "image/jpeg" ||
          file.contentType === "image/png"
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render("index", { files: files });
    }
  });
});

app.get("/time", (req, res) => {
  res.send(Math.floor(Date.now()));
});

app.get("/share", (req, res) => {
  res.render("share");
});

// @route POST /upload
// @desc  Uploads file to DB
app.post("/upload", upload.single("file"), (req, res) => {
  // return res.json({ file: req.file });
  return res.redirect("/");
});

// @route GET /files/:filename
// @desc  Display single file object
app.get("/files/:id", (req, res) => {
  gfs.files.findOne({ _id: ObjectId(req.params.id) }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
app.get("/image/:id", (req, res) => {
  const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  gfs.files.findOne({ _id: ObjectId(req.params.id) }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    // Check if image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      res.set("Content-Type", file.contentType);
      const readstream = gridfsBucket.openDownloadStream(file._id);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not an image",
      });
    }
  });
});

// @route GET /download/:id
// @desc  Download single file object
app.get("/download/:id", (req, res) => {
  const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  gfs.files.findOne({ _id: ObjectId(req.params.id) }, (err, file) => {
    // if error
    if (err) {
      return res.status(400).send(err);
    }
    // check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    res.set("Content-Type", file.contentType);
    res.setHeader("Content-Length", file.length);
    res.set(
      "Content-Disposition",
      'attachment; filename="' + file.filename + '"'
    );
    // streaming from gridfs
    const readstream = gridfsBucket.openDownloadStream(file._id);
    // on error while reading
    readstream.on("error", function (err) {
      res.end();
    });
    readstream.pipe(res);
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete("/files/:id", (req, res) => {
  console.log(req.params.id);
  const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  gridfsBucket.delete(ObjectId(req.params.id.toString()), (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    } else {
      res.redirect("/");
    }
  });
});

// Api for personal use

// Create safe storage engine
const safeStorage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "safeUploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const safeUpload = multer({ safeStorage });

// @route POST /safeUpload
// @desc  Uploads file to DB
app.post("/Arpit/safeUpload", safeUpload.single("file"), (req, res) => {
  return res.json({ file: req.file });
  // res.redirect("/");
});

// @route GET /download/:id
// @desc  Download single file object
app.get("/Arpit/safeDownload/:id", (req, res) => {
  const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "safeUploads",
  });
  gfs.files.findOne({ _id: ObjectId(req.params.id) }, (err, file) => {
    // if error
    if (err) {
      return res.status(400).send(err);
    }
    // check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    res.set("Content-Type", file.contentType);
    res.set(
      "Content-Disposition",
      'attachment; filename="' + file.filename + '"'
    );
    // streaming from gridfs
    const readstream = gridfsBucket.openDownloadStream(file._id);
    // on error while reading
    readstream.on("error", function (err) {
      res.end();
    });
    readstream.pipe(res);
  });
});

// @route GET /safeFiles/Arpit
// @desc  Display files object
app.get("/Arpit/safeFiles/secret", (req, res) => {
  safeGfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }

    // Files exist
    return res.json(files);
  });
});

/** Important for project */

// @route GET /files
// @desc  Display all files in JSON
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }

    // Files exist
    return res.json(files);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
