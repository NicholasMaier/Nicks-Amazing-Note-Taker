const express = require("express");
const path = require("path");
const db = require("./db/db.json");
const fs = require("fs");
const utils = require("./helpers/fsUtils.js");
const uuid = require("./helpers/uuid.js");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/api/notes", (req, res) => {
    utils.readFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

app.post("/api/notes", (req, res) => {
    console.log(req.body)

    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        utils.readFile("./db/db.json")
            .then((data) => {
                const existingNotes = JSON.parse(data);

                existingNotes.push(newNote);

                utils.writeFile("./db/db.json", JSON.stringify(existingNotes));
            });

        const response = {
            status: "success",
            body: newNote,
        };

        res.status(201).json(response);
    }
    else {
        res.status(500).json("There was a problem saving a Note");
    }
});

app.delete("/api/notes/:id", (req, res) => {
    utils.readFile("./db/db.json")
        .then((data) => {
            let notes = JSON.parse(data);

            for (let i = 0; i < notes.length; i++) {
                let currentNote = notes[i];
                if (currentNote.id === req.params.id) {
                    notes.splice(i, 1);
                    utils.writeFile("./db/db.json", JSON.stringify(notes))
                    return res.status(200).json(`${currentNote} was removed.`);
                }
            }
            return res.status(500).json("There was a problem deleting a Note");
        })
});

app.get("/notes", (req, res) =>
    res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.listen(PORT, () =>
    console.log(`Nicks Amazing Note Taker listening at http://localhost:${PORT}`),
);