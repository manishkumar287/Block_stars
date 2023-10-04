const express = require("express");
const app = express();
const http = require("http").Server(app);
const axios = require("axios");
const rateLimit = require("express-rate-limit");


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3000, // Max requests per day
  message: "API rate limit exceeded, please try again later.",
});

// Apply rate limiting to the API endpoint
app.use("/sse", apiLimiter);

app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Logic to send real-time price updates using setInterval
  const interval = setInterval (async () => {
    // Fetch cryptocurrency price from the API
    // Beautify the price (round it to 2 decimal places)
    const price = await fetchPrice();
    res.write(`data: ${JSON.stringify({ price })}\n\n`);
  }, 1000); // Update every second

  // Close the connection when the client disconnects
  req.on("close", () => {
    clearInterval(interval);
  });
});



// Function to fetch cryptocurrency price from an API
async function fetchPrice() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets?per_page=50&vs_currency=usd&ids=bitcoin&x_cg_demo_api_key=CG-TtUVWWdJ9Fbs5VUNvxqyy8jt"
    );


    if (response.data) {
        console.log("response dtaa", response.data);
      const price = beautifyPrice(response.data[0].current_price);
      return price;
    }
  } catch (error) {
    console.error("Error fetching price:", error);
  }
  return 0;
}

// Function to beautify the price (round to 2 decimal places)
function beautifyPrice(price) {
  return parseFloat(price).toFixed(2);
}




const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
