const Router = require("express").Router;
const router = new Router();
const db = require("../data/connection");
const util = require("../util/helper");
const querystring = require("node:querystring");
const axios = require("axios");

const debug = require("debug")("app:ui");

//render the rate quote floating window
router.get("/ui/rate-quote-window", async (req, res) => {
  try {
    const queryParams = req.query;
    const query_path = querystring.stringify(queryParams);
    //console.log(queryParams);
    var context = {
      company_id: queryParams.companyId,
      user_id: req.query.userId,
      query_path,
    };

    res.render("rate_quote_window/rate_quote", context);
  } catch (error) {
    console.log("no /ui/rate-quote-window");
    util.SendWebex(`no /ui/rate-quote-window`);
  }
});

//render the rate customer form
router.get("/ui/rate-customer", async (req, res) => {
  try {
    const queryParams = req.query;
    const bodyParams = req.body;
    let parsedQuery = querystring.stringify(queryParams);

    var context = {
      company_id: queryParams.companyId,
      user_id: req.query.userId,
      query_path: parsedQuery,
    };

    res.render("rate_quote_window/create_lead", context);
  } catch (error) {
    util.SendWebex(`no /ui/rate-quote-process`);
  }
});

//render the rate customer form
router.get("/ui/quote-customer", async (req, res) => {
  try {
    const queryParams = req.query;
    const bodyParams = req.body;
    let parsedQuery = querystring.stringify(queryParams);

    var context = {
      company_id: queryParams.companyId,
      user_id: req.query.userId,
      query_path: parsedQuery,
    };

    res.render("rate_quote_window/create_quote", context);
  } catch (error) {
    util.SendWebex(`no /ui/rate-quote-process`);
  }
});

//add rate as lead - form submission
router.post("/ui/lead-create", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const query_path = querystring.stringify(query);

  const userId = query.userId;
  const orgNameInput = body.org ? body.org : "";
  let personInput = body.person ? body.person : "";
  const personPhoneInput = body.person_phone ? body.person_phone : "";
  const personEmailInput = body.person_email ? body.person_email : "";
  let pickupDateInput = body.pick_date;
  let deliveryDateInput = body.delivery_date;
  const originInput = body.origin;
  const destinationInput = body.destination;
  const valueInput = body.value;
  let orgId = body.orgId ? body.orgId : "";
  let personId = body.personId ? body.personId : "";
  const originZip = body.originZipInput;
  const destinationZip = body.destinationZipInput;

  const pickupDateParts = pickupDateInput.split("/");
  pickupDateInput = `${pickupDateParts[2]}-${pickupDateParts[0]}-${pickupDateParts[1]}`;
  const pickdateCard = `${pickupDateParts[0]}/${pickupDateParts[1]}/${pickupDateParts[2]}`;

  const deliveryDateParts = deliveryDateInput.split("/");
  deliveryDateInput = `${deliveryDateParts[2]}-${deliveryDateParts[0]}-${deliveryDateParts[1]}`;
  const deliverydateCard = `${deliveryDateParts[0]}/${deliveryDateParts[1]}/${deliveryDateParts[2]}`;

  try {
    // handle org
    if (orgId == "" && orgNameInput != "") {
      const createdOrg = await util.createOrg(orgNameInput, userId);
      orgId = createdOrg.data.id;
    }

    // handle person
    if (personId == "" && personInput != "") {
      const createPersonData = {
        name: personInput,
        owner_id: userId,
        org_id: orgId,
        visible_to: "7",
      };

      if (personPhoneInput) {
        createPersonData["phone"] = [
          { label: "work", value: personPhoneInput, primary: true },
        ];
      }
      if (personEmailInput) {
        createPersonData["email"] = [
          { label: "work", value: personEmailInput, primary: true },
        ];
      }

      const createdPerson = await util.createPerson(createPersonData);
      personId = createdPerson.data.id;
    }

    var leadTitle = `Rate | ${originZip} - ${destinationZip} | $${valueInput}`;
    var leadTitle2 = `Rate Created | ${originZip} - ${destinationZip} | $${valueInput}`;

    const leadData = {
      title: leadTitle,
      owner_id: parseInt(userId),
      value: {
        amount: parseInt(valueInput),
        currency: "USD",
      },
      label_ids: ["084279c0-9dc0-11ee-98c4-8b14e7552970"],
      person_id: parseInt(personId),
      organization_id: parseInt(orgId),
      "5476630603a21becbcaeeb56a6ed0de9043b7a02": originInput, // origin location
      "887c61db16906db23c112eaac6a06ba28fc3d4cd": pickupDateInput, // origin pickup date
      "887c61db16906db23c112eaac6a06ba28fc3d4cd_until": "",
      "1b5ede534657eb6d1fc4940c3312fc442acec41c": destinationInput, // destination location
      "5c549171ba0a562a8ef476b16bd1f72290d0c8be": deliveryDateInput, // destination delivery date
      "5c549171ba0a562a8ef476b16bd1f72290d0c8be_until": "",
      b763f2994f4176581ffc947bda74107b7cda1a40: valueInput,
    };

    const lead = await util.createLead(leadData);
    const leadId = lead.data.id;

    var my_date = new Date();
    var year = my_date.getFullYear();
    var month = my_date.getMonth();
    var day = my_date.getDate();
    var due_date = year + "-" + month + "-" + day;
    var h = my_date.getHours();
    var m = my_date.getMinutes();
    var due_time = h + ":" + m;
    
    var note_final = `<strong>Rate:</strong><br/>$${valueInput}<br/><br/><strong>Pick Up:</strong><br/>${pickdateCard}<br/>${originInput}<br/><br/><strong>Destination:</strong><br/>${deliverydateCard}<br/>${destinationInput}`;

    //generate update deal JSON
    var activity_data = {
      user_id: query.userId,
      type: "rate",
      due_date: due_date,
      due_time: due_time,
      duration: "",
      busy_flag: false,
      org_id: orgId,
      person_id: personId,
      lead_id: leadId,
      private: false,
      note: note_final,
      subject: leadTitle2,
      done: 1,
    };

    const leadActivity = await util.createleadActivity_rate(activity_data);

    var context = {
      company_id: query.companyId,
      user_id: query.userId,
      query_path,
      lead_id: leadId,
      org_id: orgId,
      org_name: orgNameInput,
      person_id: personId,
      person_name: personInput,
      person_phone: personPhoneInput,
      person_email: personEmailInput,
      pick_up: pickdateCard,
      delivery: deliverydateCard,
      origin: originInput,
      destination: destinationInput,
      value: valueInput,
      title: leadTitle,
    };

    res.render("rate_quote_window/lead_confirmation", context);

    console.log("created lead");
  } catch (e) {
    console.log(e);
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/lead/create |
      body: ${JSON.stringify(body)},
      query: ${JSON.stringify(query)} |
      Error Message: ${e.message}
    `);
  }
});

//add quote as deal - form submission
router.post("/ui/quote-create", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const userId = query.userId;
  const query_path = querystring.stringify(query);
  try {
    var orgId;
    var mcleodId;
    var personId;
    const orgNameInput = body.org;
    const personInput = body.person;
    const personPhoneInput = body.person_phone;
    const personEmailInput = body.person_email;
    //handle Organization
    if (!body.orgId) {
      //no org id
      const createdOrg = await util.createOrg(orgNameInput, userId);
      orgId = createdOrg.data.id;
    } else {
      //org id exists
      orgId = body.orgId;
      console.log("orgId exists: " + orgId);
      const org = await util.getOrgById(orgId);
      var mcleodId = org.data["6f21dcab9cbf88d81bac0499569bf1aedcb68746"]; //McLeod Customer ID Field in PD
      console.log(mcleodId);
    }

    //handle person
    if (!body.personId) {
      console.log("personId does not exist");
      const createPersonData = {
        name: personInput,
        owner_id: userId,
        org_id: orgId,
        email: [{ label: "work", value: personEmailInput, primary: true }],
        visible_to: "7",
      };
      if (personPhoneInput) {
        createPersonData["phone"] = [
          { label: "work", value: personPhoneInput, primary: true },
        ];
      }

      const createdPerson = await util.createPerson(createPersonData);
      console.log(createdPerson);
      personId = createdPerson.data.id;
    } else {
      //person id exists
      personId = body.personId;
      console.log("personId exists: " + personId);
    }

    //handle pipeline stage
    var pipeline_stage = 21;
    if (mcleodId) {
      pipeline_stage = 22;
    }

    var deal_title = orgNameInput + " deal";
    //handle deal creation
    const deal_data = {
      title: deal_title,
      user_id: userId,
      person_id: personId,
      org_id: orgId,
      pipeline_id: 3,
      stage_id: pipeline_stage,
      status: "open",
      visible_to: "7",
      currency: "USD",
    };

    const deal = await util.createDeal(deal_data);
    const dealId = deal.data.id;

    var context = {
      company_id: query.companyId,
      user_id: query.userId,
      query_path,
      org_id: orgId,
      person_id: personId,
      deal_id: dealId,
      deal_title: deal_title,
      deal_org: orgNameInput,
      deal_person: personInput,
      person_phone: personPhoneInput,
      person_email: personEmailInput,
    };
    console.log(context);

    //handle confirmation routing
    if (!mcleodId) {
      console.log("no mcleod id on org - route to customer credit request");
      res.render("rate_quote_window/org_address", context);
      //res.render("rate_quote_window/org_address", context);
    } else {
      console.log("mcleod id on org - route to create order");
      res.render("rate_quote_window/quote_confirmation", context);
    }
    //console.log("body", req.body);
    //console.log("query", req.query);
    //console.log("params", req.params);
  } catch (e) {
    console.log(e);
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/quote/create |
      body: ${body},
      query: ${query} |
      Error Message: ${e.message}
    `);
  }
});

//render the rlc rate customer form
router.get("/ui/rlc-rate-customer-lead", async (req, res) => {
  try {
    const queryParams = req.query;
    const bodyParams = req.body;
    let parsedQuery = querystring.stringify(queryParams);

    var context = {
      company_id: queryParams.companyId,
      user_id: req.query.userId,
      query_path: parsedQuery,
    };

    res.render("rate_quote_window/rlc_lead_rate", context);
  } catch (error) {
    util.SendWebex(`/ui/rlc-rate-customer-lead`);
  }
});

router.get("/ui/rlc-rate-customer-deal", async (req, res) => {
  try {
    const queryParams = req.query;
    const bodyParams = req.body;
    let parsedQuery = querystring.stringify(queryParams);

    var context = {
      company_id: queryParams.companyId,
      user_id: req.query.userId,
      query_path: parsedQuery,
    };

    res.render("rate_quote_window/rlc_deal_rate", context);
  } catch (error) {
    util.SendWebex(`/ui/rlc-rate-customer-quote`);
  }
});

router.post("/ui/rlc-lead", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const query_path = querystring.stringify(query);

  try {
    // handle Items with overdimensions
    let overDimensionItems = [];
    for (let i = 0; i < body.items.length; i++) {
      if (body.items[i].length >= 96 || body.items[i].width >= 96) {
        console.log("item", body.items[i]);
        let mostInches;
        console.log(
          parseInt(body.items[i].length) > parseInt(body.items[i].width)
        );
        if (parseInt(body.items[i].length) > parseInt(body.items[i].width)) {
          mostInches = body.items[i].length;
        } else {
          mostInches = body.items[i].width;
        }
        overDimensionItems.push({
          Pieces: body.items[i].units,
          Inches: mostInches,
        });

        if (!body.items.includes("OverDimension")) {
          if (!body.accessorials) {
            body.accessorials = [];
          }
          body.accessorials.push("OverDimension");
        }
      }
    }

    const data = {
      RateQuote: {
        Origin: {
          City: body.originCity,
          StateOrProvince: body.originState,
          ZipOrPostalCode: body.originZipCode,
          CountryCode: "USA",
        },
        Destination: {
          City: body.destinationCity,
          StateOrProvince: body.destinationState,
          ZipOrPostalCode: body.destinationZipCode,
          CountryCode: "USA",
        },
        Items: body.items,
        AdditionalServices: body.accessorials,
        OverDimensions: overDimensionItems,
        PickupDate: body.pick_date,
      },
    };

    const quote = await util.getRLCQuote(data);
    const rateQuote = quote.RateQuote;

    // add rate to service levels with margin
    const marginFlat = 270;
    const marginPercent = 1.15;
    for (let i = 0; i < quote.RateQuote.ServiceLevels.length; i++) {
      let netCharge = quote.RateQuote.ServiceLevels[i].NetCharge;
      netCharge = netCharge.replace("$", "");
      netCharge = netCharge.replace(",", "");
      netCharge = parseFloat(netCharge);

      let rate = 0;
      if (netCharge + marginFlat > netCharge * marginPercent) {
        rate = netCharge + marginFlat;
      } else {
        rate = netCharge * marginPercent;
      }

      rate = rate.toFixed(2);
      quote.RateQuote.ServiceLevels[i].rate = rate;
    }

    // create note with charges table on lead
    const context = {
      serviceLevels: rateQuote.ServiceLevels,
      query_path: query_path,
      origin: rateQuote.Origin,
      destination: rateQuote.Destination,
      originServiceCenter: rateQuote.OriginServiceCenter,
      destinationServiceCenter: rateQuote.DestinationServiceCenter,
      charges: rateQuote.Charges,
      rateQuote: JSON.stringify(rateQuote),
      originInput: body.origin,
      destinationInput: body.destination,
      originZip: body.originZipCode,
      destinationZip: body.destinationZipCode
    };

    res.render("rate_quote_window/rlc_lead_options", context);
  } catch (e) {
    console.log(JSON.stringify(e.response.data));
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/rlc-rate-create |
      body: ${body},
      query: ${query} |
      Error: ${JSON.stringify(e.response.data)}
    `);
  }
});

// user selcts service level of rlc rate
router.post("/ui/rlc-lead-select", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const query_path = querystring.stringify(query);
  const netCharge = body.netCharge;
  const selectedRate = body.rate;
  const rateQuoteString = body.rateQuote;

  try {
    const rateQuote = JSON.parse(rateQuoteString);

    const context = {
      selectedRate: selectedRate,
      rateQuote: rateQuoteString,
      pickupDate: rateQuote.PickupDate,
      query_path: query_path,
      origin: body.origin,
      destination: body.destination,
      originZip: body.originZip,
      destinationZip: body.destinationZip
    };

    res.render("rate_quote_window/rlc_lead_create", context);
  } catch (e) {
    console.log(JSON.stringify(e));
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/rlc-rate-select |
      body: ${JSON.stringify(body)},
      query: ${JSON.stringify(query)} |
      Error: ${JSON.stringify(e)}
    `);
  }
});

router.post("/ui/rlc-lead-create", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const query_path = querystring.stringify(query);
  console.log(body)
  const userId = query.userId;
  const orgNameInput = body.org ? body.org : "";
  let personInput = body.person ? body.person : "";
  const personPhoneInput = body.person_phone ? body.person_phone : "";
  const personEmailInput = body.person_email ? body.person_email : "";
  let pickupDateInput = body.pick_date;
  let deliveryDateInput = body.delivery_date;
  const originInput = body.origin;
  const destinationInput = body.destination;
  const valueInput = body.value;
  let orgId = body.orgId ? body.orgId : "";
  let personId = body.personId ? body.personId : "";
  const originZip = body.originZip;
  const destinationZip = body.destinationZip;
  const rateQuoteString = body.rlcRateQuote
  
  const pickupDateParts = pickupDateInput.split("/");
  pickupDateInput = `${pickupDateParts[2]}-${pickupDateParts[0]}-${pickupDateParts[1]}`;
  const pickdateCard = `${pickupDateParts[0]}/${pickupDateParts[1]}/${pickupDateParts[2]}`;

  const deliveryDateParts = deliveryDateInput.split("/");
  deliveryDateInput = `${deliveryDateParts[2]}-${deliveryDateParts[0]}-${deliveryDateParts[1]}`;
  const deliverydateCard = `${deliveryDateParts[0]}/${deliveryDateParts[1]}/${deliveryDateParts[2]}`;

  try {
    const rateQuote = JSON.parse(rateQuoteString)
    console.log(rateQuote)
    const charges = rateQuote.Charges
    
    // handle org
    if (orgId == "" && orgNameInput != "") {
      const createdOrg = await util.createOrg(orgNameInput, userId);
      orgId = createdOrg.data.id;
    }

    // handle person
    if (personId == "" && personInput != "") {
      const createPersonData = {
        name: personInput,
        owner_id: userId,
        org_id: orgId,
        visible_to: "7",
      };

      if (personPhoneInput) {
        createPersonData["phone"] = [
          { label: "work", value: personPhoneInput, primary: true },
        ];
      }
      if (personEmailInput) {
        createPersonData["email"] = [
          { label: "work", value: personEmailInput, primary: true },
        ];
      }

      const createdPerson = await util.createPerson(createPersonData);
      personId = createdPerson.data.id;
    }

    var leadTitle = `Rate | ${originZip} - ${destinationZip} | $${valueInput}`;
    var leadTitle2 = `Rate Created | ${originZip} - ${destinationZip} | $${valueInput}`;

    const leadData = {
      title: leadTitle,
      owner_id: parseInt(userId),
      value: {
        amount: parseInt(valueInput),
        currency: "USD",
      },
      label_ids: ["084279c0-9dc0-11ee-98c4-8b14e7552970"],
      person_id: parseInt(personId),
      organization_id: parseInt(orgId),
      "5476630603a21becbcaeeb56a6ed0de9043b7a02": originInput, // origin location
      "887c61db16906db23c112eaac6a06ba28fc3d4cd": pickupDateInput, // origin pickup date
      "887c61db16906db23c112eaac6a06ba28fc3d4cd_until": pickupDateInput,
      "2265370b128fcf6c1a48fecdd480d8ecb5a747db": '08:00:00',
      "2265370b128fcf6c1a48fecdd480d8ecb5a747db_until": '17:00:00', 
      "1b5ede534657eb6d1fc4940c3312fc442acec41c": destinationInput, // destination location
      "5c549171ba0a562a8ef476b16bd1f72290d0c8be": deliveryDateInput, // destination delivery date
      "5c549171ba0a562a8ef476b16bd1f72290d0c8be_until": deliveryDateInput,
      "fcbcb0cdac81c011a5be9c2c997139486dee00d2": '08:00:00',
      "fcbcb0cdac81c011a5be9c2c997139486dee00d2_until": '17:00:00',
      b763f2994f4176581ffc947bda74107b7cda1a40: valueInput,
    };

    const lead = await util.createLead(leadData);
    const leadId = lead.data.id;

    var my_date = new Date();
    var year = my_date.getFullYear();
    var month = my_date.getMonth();
    var day = my_date.getDate();
    var due_date = year + "-" + month + "-" + day;
    var h = my_date.getHours();
    var m = my_date.getMinutes();
    var due_time = h + ":" + m;

    let noteCharges = []
    for (let i = 0; i < charges.length; i++) {
      noteCharges = `${noteCharges}<li>${charges[i].Title} - ${charges[i].Amount}</li>`
    }
    
    var note_final = `
      <strong>Pick Up:</strong><br/>
      ${pickdateCard}<br/>
      ${originInput}<br/><br/>
      <strong>Destination:</strong><br/>
      ${deliverydateCard}<br/>
      ${destinationInput}<br/><br/>
      <strong>Charges</strong><br/>
      <ul>${noteCharges}</ul>
    `;
    
    //generate update deal JSON
    var activity_data = {
      user_id: query.userId,
      type: "rate",
      due_date: due_date,
      due_time: due_time,
      duration: "",
      busy_flag: false,
      org_id: orgId,
      person_id: personId,
      lead_id: leadId,
      private: false,
      note: note_final,
      subject: leadTitle2,
      done: 1,
    };

    const leadActivity = await util.createleadActivity_rate(activity_data);

    var context = {
      company_id: query.companyId,
      user_id: query.userId,
      query_path,
      lead_id: leadId,
      org_id: orgId,
      org_name: orgNameInput,
      person_id: personId,
      person_name: personInput,
      person_phone: personPhoneInput,
      person_email: personEmailInput,
      pick_up: pickdateCard,
      delivery: deliverydateCard,
      origin: originInput,
      destination: destinationInput,
      value: valueInput,
      title: leadTitle,
    };

    console.log("route to lead");
    console.log(context);
    res.render("rate_quote_window/lead_confirmation", context);

    console.log("created lead");
  } catch (e) {
    console.log(e);
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/rlc-lead-create |
      body: ${JSON.stringify(body)},
      query: ${JSON.stringify(query)} |
      Error Message: ${e.message}
    `);
  }
});

router.post("/ui/rlc-deal", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const query_path = querystring.stringify(query);
  //console.log("/ui/rlc-deal", body);

  try {
    // handle Items with overdimensions
    let overDimensionItems = [];
    for (let i = 0; i < body.items.length; i++) {
      if (body.items[i].length >= 96 || body.items[i].width >= 96) {
        console.log("item", body.items[i]);
        let mostInches;
        console.log(
          parseInt(body.items[i].length) > parseInt(body.items[i].width)
        );
        if (parseInt(body.items[i].length) > parseInt(body.items[i].width)) {
          mostInches = body.items[i].length;
        } else {
          mostInches = body.items[i].width;
        }
        overDimensionItems.push({
          Pieces: body.items[i].units,
          Inches: mostInches,
        });

        if (!body.items.includes("OverDimension")) {
          if (!body.accessorials) {
            body.accessorials = [];
          }
          body.accessorials.push("OverDimension");
        }
      }
    }

    const data = {
      RateQuote: {
        Origin: {
          City: body.originCity,
          StateOrProvince: body.originState,
          ZipOrPostalCode: body.originZipCode,
          CountryCode: "USA",
        },
        Destination: {
          City: body.destinationCity,
          StateOrProvince: body.destinationState,
          ZipOrPostalCode: body.destinationZipCode,
          CountryCode: "USA",
        },
        Items: body.items,
        AdditionalServices: body.accessorials,
        OverDimensions: overDimensionItems,
        PickupDate: body.pick_date,
      },
    };

    const quote = await util.getRLCQuote(data);
    const rateQuote = quote.RateQuote;

    // add rate to service levels with margin
    const marginFlat = 270;
    const marginPercent = 1.15;
    for (let i = 0; i < quote.RateQuote.ServiceLevels.length; i++) {
      let netCharge = quote.RateQuote.ServiceLevels[i].NetCharge;
      netCharge = netCharge.replace("$", "");
      netCharge = netCharge.replace(",", "");
      netCharge = parseFloat(netCharge);

      let rate = 0;
      if (netCharge + marginFlat > netCharge * marginPercent) {
        rate = netCharge + marginFlat;
      } else {
        rate = netCharge * marginPercent;
      }

      rate = rate.toFixed(2);
      quote.RateQuote.ServiceLevels[i].rate = rate;
    }

    // create note with charges table on lead
    const context = {
      serviceLevels: rateQuote.ServiceLevels,
      query_path: query_path,
      origin: rateQuote.Origin,
      destination: rateQuote.Destination,
      originServiceCenter: rateQuote.OriginServiceCenter,
      destinationServiceCenter: rateQuote.DestinationServiceCenter,
      charges: rateQuote.Charges,
      rateQuote: JSON.stringify(rateQuote),
      originInput: body.origin,
      destinationInput: body.destination,
      originZip: body.originZipCode,
      destinationZip: body.destinationZipCode
    };

    res.render("rate_quote_window/rlc_deal_options", context);
  } catch (e) {
    console.log(JSON.stringify(e.response.data));
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/rlc-rate-create |
      body: ${body},
      query: ${query} |
      Error: ${JSON.stringify(e.response.data)}
    `);
  }
});

// user selcts service level of rlc rate
router.post("/ui/rlc-deal-select", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const query_path = querystring.stringify(query);
  const netCharge = body.netCharge;
  const selectedRate = body.rate;
  const rateQuoteString = body.rateQuote;
  //console.log("/ui/rlc-deal-select", body)

  try {
    const rateQuote = JSON.parse(rateQuoteString);

    const context = {
      selectedRate: selectedRate,
      rateQuote: rateQuoteString,
      pickupDate: rateQuote.PickupDate,
      query_path: query_path,
      origin: body.origin,
      destination: body.destination,
      originZip: body.originZip,
      destinationZip: body.destinationZip
    };

    res.render("rate_quote_window/rlc_deal_create", context);
  } catch (e) {
    console.log(JSON.stringify(e));
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/rlc-rate-select |
      body: ${JSON.stringify(body)},
      query: ${JSON.stringify(query)} |
      Error: ${JSON.stringify(e)}
    `);
  }
});

router.post("/ui/rlc-deal-create", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const userId = query.userId;
  const query_path = querystring.stringify(query);
  const rateQuoteString = body.rateQuote
  console.log("/ui/rlc-deal-create", body)
  
  try {
    const rateQuote = JSON.parse(rateQuoteString)
    let pickupDate = rateQuote.PickupDate
    const pickupDateParts = pickupDate.split("/");
    pickupDate = `${pickupDateParts[2]}-${pickupDateParts[0]}-${pickupDateParts[1]}`;
    const pickdateCard = `${pickupDateParts[0]}/${pickupDateParts[1]}/${pickupDateParts[2]}`;
    
    var orgId;
    var mcleodId;
    var personId;
    const orgNameInput = body.org;
    const personInput = body.person;
    const personPhoneInput = body.person_phone;
    const personEmailInput = body.person_email;
    //handle Organization
    if (!body.orgId) {
      //no org id
      const createdOrg = await util.createOrg(orgNameInput, userId);
      orgId = createdOrg.data.id;
    } else {
      //org id exists
      orgId = body.orgId;
      console.log("orgId exists: " + orgId);
      const org = await util.getOrgById(orgId);
      var mcleodId = org.data["6f21dcab9cbf88d81bac0499569bf1aedcb68746"]; //McLeod Customer ID Field in PD
      console.log(mcleodId);
    }

    //handle person
    if (!body.personId) {
      console.log("personId does not exist");
      const createPersonData = {
        name: personInput,
        owner_id: userId,
        org_id: orgId,
        email: [{ label: "work", value: personEmailInput, primary: true }],
        visible_to: "7",
      };
      if (personPhoneInput) {
        createPersonData["phone"] = [
          { label: "work", value: personPhoneInput, primary: true },
        ];
      }

      const createdPerson = await util.createPerson(createPersonData);
      console.log(createdPerson);
      personId = createdPerson.data.id;
    } else {
      //person id exists
      personId = body.personId;
      console.log("personId exists: " + personId);
    }

    //handle pipeline stage
    var pipeline_stage = 21;
    if (mcleodId) {
      pipeline_stage = 22;
    }
    
    // TODO: create deal with more fields from the rlc rate quote

    var deal_title = orgNameInput + " deal";
    //handle deal creation
    const deal_data = {
      title: deal_title,
      user_id: userId,
      person_id: personId,
      org_id: orgId,
      pipeline_id: 3,
      stage_id: pipeline_stage,
      status: "open",
      visible_to: "7",
      value: body.selectedRate,
      currency: "USD",
      "5476630603a21becbcaeeb56a6ed0de9043b7a02": body.origin, // origin location
      "887c61db16906db23c112eaac6a06ba28fc3d4cd": pickupDate, // origin pickup date
      "887c61db16906db23c112eaac6a06ba28fc3d4cd_until": pickupDate,
      '2265370b128fcf6c1a48fecdd480d8ecb5a747db': '08:00:00',
      '2265370b128fcf6c1a48fecdd480d8ecb5a747db_until': '17:00:00',
      "1b5ede534657eb6d1fc4940c3312fc442acec41c": body.destination, // destination location
      "b763f2994f4176581ffc947bda74107b7cda1a40": body.selectedRate,
    };

    const deal = await util.createDeal(deal_data);
    const dealId = deal.data.id;

    var context = {
      company_id: query.companyId,
      user_id: query.userId,
      query_path,
      org_id: orgId,
      person_id: personId,
      deal_id: dealId,
      deal_title: deal_title,
      deal_org: orgNameInput,
      deal_person: personInput,
      person_phone: personPhoneInput,
      person_email: personEmailInput,
    };

    //handle confirmation routing
    if (!mcleodId) {
      console.log("no mcleod id on org - route to customer credit request");
      res.render("rate_quote_window/org_address", context);
      //res.render("rate_quote_window/org_address", context);
    } else {
      console.log("mcleod id on org - route to create order");
      res.render("rate_quote_window/quote_confirmation", context);
    }
  } catch (e) {
    console.log(e);
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/quote/create |
      body: ${body},
      query: ${query} |
      Error Message: ${e.message}
    `);
  }
});

//add quote as deal - form submission
router.post("/ui/org-update", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const userId = query.userId;
  const query_path = querystring.stringify(query);
  const dealId = body.deal_id;
  const deal_title = body.deal_title;
  const orgId = body.orgId;
  const orgNameInput = body.org;
  const personId = body.personId;
  const personInput = body.person;
  try {
    //handle updating Org Address
    const orgData = {
      address: body.addressSearch,
      address_street_number: body.street_number,
      address_route: body.route,
      address_locality: body.locality,
      address_admin_area_level_1: body.administrative_area_level_1,
      address_country: body.country,
      address_postal_code: body.postal_code,
    };

    const updatedOrg = await util.updateOrg(orgId, orgData);

    console.log("no mcleod id on org - route to customer credit request");
    var context = {
      company_id: query.companyId,
      user_id: query.userId,
      query_path,
      org_id: orgId,
      deal_id: dealId,
      person_id: personId,
      deal_title: deal_title,
      deal_org: orgNameInput,
      deal_person: personInput,
    };
    console.log(context);
    res.render("rate_quote_window/customer_confirmation", context);
  } catch (e) {
    console.log(e);
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/org-update |
      body: ${body},
      query: ${query} |
      Error Message: ${e.message}
    `);
  }
});

//add quote as deal - form submission
router.get("/ui/org-test", async (req, res) => {
  const body = req.body;
  const query = req.query;
  const userId = query.userId;
  const query_path = querystring.stringify(query);

  try {
    res.render("rate_quote_window/org_address");
  } catch (e) {
    console.log(e);
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /ui/org-test |
      body: ${body},
      query: ${query} |
      Error Message: ${e.message}
    `);
  }
});

// Render the settings page
router.get("/ui/settings", async (req, res) => {
  try {
    const queryParams = req.query;
    let settings = await db.getSettings(queryParams.companyId);
    let context = util.getPageContext(
      queryParams.companyId,
      queryParams.selectedIds,
      settings.values
    );
    debug("Rendering the Custom UI Settings page");
    res.render("settings", context);
  } catch (error) {
    return util.getErrorResponse(
      "Could not render the settings page",
      error,
      500,
      res
    );
  }
});

module.exports = router;
