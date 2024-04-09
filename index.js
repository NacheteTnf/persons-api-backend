const express = require("express");
const app = express();
var fs = require("fs");
var morgan = require("morgan");
var path = require("path");

app.use(express.json());
// log only 4xx and 5xx responses to console
app.use(
  morgan("dev", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);

// log all requests to access.log
app.use(
  morgan("common", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  })
);

// Define a new token in Morgan to display POST request data
morgan.token("postData", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

// Configure Morgan to log requests to the console
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.postData(req, res), // Add the custom token to display POST request body data
    ].join(" ");
  })
);

persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

morgan.token("/", function (req, res) {
  return req.headers["content-type"];
});

app.get("/info", (req, res) => {
  let size = Object.values(persons);
  let lenght = size.length;
  let dateNow = new Date().toTimeString();
  res.send(`<p>Phone has info for ${lenght} people </br> ${dateNow}</p>`);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const person = req.body;

  if (!person || !person.name) {
    return res
      .status(400)
      .json({
        error: "person.name is missing",
      })
      .end();
  }

  if (!person || !person.number) {
    return res
      .status(400)
      .json({
        error: "person.number is missing",
      })
      .end();
  }

  const existingPerson = persons.find((p) => p.name === person.name);

  if (existingPerson) {
    return res
      .status(400)
      .json({
        error: "person.name is already exist",
      })
      .end();
  }

  const ids = persons.map((person) => person.id);
  const maxId = Math.max(...ids);

  const newPerson = {
    id: maxId + 1,
    name: person.name,
    number: person.number,
  };

  persons = persons.concat(newPerson);

  res.status(201).json(newPerson);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
