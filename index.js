(function () {
  "use strict";
  // this function is strict...
})();

// Setting up our app requirements

const express = require("express");
const app = express();
const Server = require("http").Server;
const server = new Server(app);
const axios = require("axios");
const port = 5000;
const open = require("open");

// Setting up our port

server.listen(port, () => console.log("Server at 5000"));

let reqInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    Connection: "keep-alive",
  },
});

reqInstance
  .get(
    "https://ec.europa.eu/eurostat/databrowser-backend/api/collection/LIVE/all_dataflows/en?cacheId=1667728800000-4.1.9%2520-%25202022-10-18%252004%253A42"
  )
  .then(async (res) => {
    let data = res.data;
    for (let i = 0; i < data.length; ) {
      const slicedArray = data.slice(i, i + 49);
      let percentage = Math.round((i * 100) / data.length);
      process.stdout.write("Downloading " + percentage + "% complete... \r");

      await reqInstance
        .post(
          "https://ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/dataflowItems",
          {
            items: slicedArray,
            exportFormat: ["exportDataSdmxCsv"],
            isMyData: false,
            languages: ["en"],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Connection: "keep-alive",
            },
          }
        )
        .then(function (response) {
          open(
            "https://ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/download/bulk/" +
              response.data.uuid
          );
          i = i + 49;
        })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response);
            //do something
          } else if (error.request) {
            console.log(error.request);
            //do something else
          } else if (error.message) {
            console.log(error.message);
            //do something other than the other two
          }
        });
    }
  })
  .catch((error) => {
    if (error.response) {
      console.log(error.response);
      //do something
    } else if (error.request) {
      console.log(error.request);
      //do something else
    } else if (error.message) {
      console.log(error.message);
      //do something other than the other two
    }
  });
