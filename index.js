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
      let slicedArray = data.slice(i, i + 50);
      if (i + 50 > data.length) {
        slicedArray = data.slice(i, data.length);
      } else {
        slicedArray = data.slice(i, i + 50);
      }

      let percentage = Math.round((i * 100) / data.length);
      process.stdout.write(
        "Downloading " +
          i +
          " item/" +
          data.length +
          " " +
          percentage +
          "% complete... \r"
      );

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
        .then(async function (response) {
          let exportStatus = "IN_PROGRESS";
          do {
            await delay(1000).then(async () => {
              await reqInstance
                .post(
                  " https://ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/status/" +
                    response.data.uuid,

                  { useLang: false, config: {} }
                )
                .then(function (response) {
                  exportStatus = response.data.exportStatus;
                  if (exportStatus == "BULK_EXPORT_SUCCESS") {
                    open(
                      "https://ec.europa.eu/eurostat/databrowser-backend/api/bulk/1.0/LIVE/export/download/bulk/" +
                        response.data.uuid
                    );
                    i = i + 50;
                  }
                });
            });
          } while (exportStatus == "IN_PROGRESS");

          if (i >= data.length) {
            console.log("finished");

            return;
          }
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
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
