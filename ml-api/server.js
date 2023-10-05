const express = require("express");
// const fetch = require('node-fetch');
const bodyParser = require("body-parser");
const { PythonShell } = require("python-shell");
const fetch = require("node-fetch");
const natural = require("natural");
const app = express();
const tokenizer = new natural.WordTokenizer();
const port = process.env.PORT || 3000;
const apiUrl = "http://localhost:5000/predict";
const inputUrl = "https://amazon.com";

app.use(bodyParser.json());

// Load your machine learning model
const loadModel = () => {
  PythonShell.run("load_model.py", null, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Model loaded successfully.");
    }
  });
};

// Define a route to load the model (call this once when your app starts)
app.get("/load-model", (req, res) => {
  loadModel();
  res.send("Loading the model...");
});

// Define a route to make predictions
// app.post("/predict", (req, res) => {
//   const inputData = req.body;

//   // Tokenize the input URL
//   const tokenizedInput = tokenizeURL(inputData.url);

//   // Add padding to tokenized input (for example, pad to a fixed length)
//   const maxLength = 100; // Define the maximum sequence length
//   const paddedInput = padArray(tokenizedInput, maxLength);

//   fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ url: inputUrl }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log("Prediction:", data.prediction);
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });

//   // Now you can use 'paddedInput' as input for your model

//   PythonShell.run(
//     "./predict.py",
//     { args: [JSON.stringify(paddedInput)] },
//     (err, results) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send("Error making predictions.");
//       } else {
//         const prediction = JSON.parse(results[0]);
//         res.json({ prediction });
//       }
//     }
//   );
// });

app.post("/predict", (req, res) => {
  const inputData = req.body;

  // Tokenize the input URL
  const tokenizedInput = tokenizeURL(inputData.url);

  // Add padding to tokenized input (for example, pad to a fixed length)
  const maxLength = 100; // Define the maximum sequence length
  const paddedInput = padArray(tokenizedInput, maxLength);

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: inputData.url }), // Use the input URL here
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Prediction:", data.prediction);

      // Now you can use 'paddedInput' as input for your model
      PythonShell.run(
        "./predict.py",
        { args: [JSON.stringify(paddedInput)] },
        (err, results) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error making predictions.");
          } else {
            const prediction = JSON.parse(results[0]);
            res.json({ prediction });
          }
        }
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

function tokenizeURL(url) {
  // You can use a custom function or library to tokenize a URL appropriately
  // For simplicity, we'll split the URL by non-alphanumeric characters
  return url.split(/[^a-zA-Z0-9]+/);
}

// Function to pad an array to a specified length
function padArray(arr, length) {
  while (arr.length < length) {
    arr.push(""); // You can use any padding token you prefer
  }
  return arr.slice(0, length); // Ensure the array is not longer than the specified length
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  loadModel(); // Load the model when the server starts
});
