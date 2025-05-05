"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let data = [
      {
        state_code: "AL",
        name: "Alabama",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "AK",
        name: "Alaska",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "AS",
        name: "American Samoa",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "AZ",
        name: "Arizona",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "AR",
        name: "Arkansas",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "CA",
        name: "California",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "CO",
        name: "Colorado",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "CT",
        name: "Connecticut",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "DE",
        name: "Delaware",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "DC",
        name: "District Of Columbia",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "FM",
        name: "Federated States Of Micronesia",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "FL",
        name: "Florida",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "GA",
        name: "Georgia",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "GU",
        name: "Guam",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "HI",
        name: "Hawaii",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "ID",
        name: "Idaho",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "IL",
        name: "Illinois",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "IN",
        name: "Indiana",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "IA",
        name: "Iowa",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "KS",
        name: "Kansas",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "KY",
        name: "Kentucky",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "LA",
        name: "Louisiana",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "ME",
        name: "Maine",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MH",
        name: "Marshall Islands",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MD",
        name: "Maryland",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MA",
        name: "Massachusetts",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MI",
        name: "Michigan",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MN",
        name: "Minnesota",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MS",
        name: "Mississippi",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MO",
        name: "Missouri",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MT",
        name: "Montana",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "NE",
        name: "Nebraska",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "NV",
        name: "Nevada",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "NH",
        name: "New Hampshire",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "NJ",
        name: "New Jersey",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "NM",
        name: "New Mexico",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "NY",
        name: "New York",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "NC",
        name: "North Carolina",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "ND",
        name: "North Dakota",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "MP",
        name: "Northern Mariana Islands",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "OH",
        name: "Ohio",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "OK",
        name: "Oklahoma",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "OR",
        name: "Oregon",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "PW",
        name: "Palau",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "PA",
        name: "Pennsylvania",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "PR",
        name: "Puerto Rico",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "RI",
        name: "Rhode Island",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "SC",
        name: "South Carolina",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "SD",
        name: "South Dakota",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "TN",
        name: "Tennessee",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "TX",
        name: "Texas",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "UT",
        name: "Utah",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "VT",
        name: "Vermont",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "VI",
        name: "Virgin Islands",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "VA",
        name: "Virginia",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "WA",
        name: "Washington",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "WV",
        name: "West Virginia",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "WI",
        name: "Wisconsin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        state_code: "WY",
        name: "Wyoming",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert("states", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE states RESTART IDENTITY CASCADE"
    );
  }
};
