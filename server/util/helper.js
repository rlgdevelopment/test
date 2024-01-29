const axios = require("axios");
const debug = require("debug")("app:helper");
const querystring = require("querystring");

async function SendWebex(messageBody) {
  try {
    const message = await axios({
      method: "POST",
      url: "https://webexapis.com/v1/messages",
      headers: {
        Authorization: `Bearer ${process.env.BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        roomId: `${process.env.WEBEX_ROOM}`,
        markdown: messageBody,
      },
    });
    return message.data;
  } catch (error) {
    console.log(error);
    throw new Error(`API request for WebEx Message failed`);
  }
}

async function searchOrgsByName(name) {
  try {
    const orgs = await axios({
      method: "GET",
      url: `${process.env.PIPEDRIVE_URL}/organizations/search?term=${name}&fields=name&limit=10&api_token=${process.env.PD_API_KEY}`,
    });
    return orgs.data;
  } catch (e) {
    await SendWebex(`
      ERROR |
      immediate-best-cardboard (Rate Quote) |
      searchOrgsByName(name) |
      name: ${name} |
      Error Message: ${e.message}
    `);
  }
}

async function searchMcLeodZips(zipcode) {
  try {
    const locations = await axios({
      method: "GET",
      url: `${process.env.MCLD_URL}city/search?zip_code=${zipcode}*`,
      headers: {
        Authorization: `Token ${process.env.MCLD_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-com.mcleodsoftware.CompanyID": "TMS",
      },
    });
    if (locations.data != null && locations.data != undefined) {
      locations.data = locations.data.filter((city) => city.inactive != true);
    }
    return locations.data;
  } catch (e) {
    await SendWebex(`
      ERROR |
      immediate-best-cardboard (Rate Quote) |
      searchOrgsByName(name) |
      name: ${name} |
      Error Message: ${e.message}
    `);
  }
}

async function botMessageToDavid(message) {
  try {
    const postedMessage = await axios({
      method: "POST",
      url: "https://webexapis.com/v1/messages",
      headers: {
        Authorization: `Bearer ${process.env.BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        toPersonId: process.env.DAVID_WEBEX_ID,
        markdown: message,
      },
    });
    return;
  } catch (error) {
    console.log("bot failed to send message to david");
  }
}

async function SendWebexTesting(messageBody) {
  try {
    const message = await axios({
      method: "POST",
      url: "https://webexapis.com/v1/messages",
      headers: {
        Authorization: `Bearer ${process.env.BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        roomId: process.env.WEBEX_TEST_ROOM,
        markdown: messageBody,
      },
    });
    return message.data;
  } catch (error) {
    console.log(error);
    throw new Error(`API request for WebEx Message TEST failed`);
  }
}

async function getOrgByName(name) {
  try {
    const org = await axios({
      method: "GET",
      url: `${process.env.PIPEDRIVE_URL}/organizations/search?term=${name}&fields=name&exact_match=true&api_token=${process.env.PD_API_KEY}`,
    });

    return org.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      getOrgByName(name) |
      name: ${name} |
      Error Message: ${e.message}
    `);
  }
}

async function getOrgById(id) {
  try {
    const org = await axios({
      method: "GET",
      url: `${process.env.PIPEDRIVE_URL}/organizations/${id}?api_token=${process.env.PD_API_KEY}`,
    });

    return org.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      getOrgById(id) |
      id: ${id} |
      Error Message: ${e.message}
    `);
  }
}

async function createOrg(name, ownerId) {
  try {
    const org = await axios({
      method: "POST",
      url: `${process.env.PIPEDRIVE_URL}/organizations?api_token=${process.env.PD_API_KEY}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        name: name,
        owner_id: ownerId,
        visible_to: "7",
      },
    });

    return org.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      createOrg(name, ownerId) |
      name: ${name}, 
      ownerId: ${ownerId} |
      Error Message: ${e.message}
    `);
  }
}

async function createDeal(data) {
  try {
    const deal = await axios({
      method: "POST",
      url: `${process.env.PIPEDRIVE_URL}/deals?api_token=${process.env.PD_API_KEY}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    });

    return deal.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      createDeal(data) |
      data: ${data} |
      Error Message: ${e.message}
    `);
  }
}

async function searchPersonsWithParams(params) {
  try {
    const org = await axios({
      method: "get",
      url: `${process.env.PIPEDRIVE_URL}/persons/search?${params}&api_token=${process.env.PD_API_KEY}`,
    });

    return org.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      searchPersonsWithParams(params) |
      params: ${params}, |
      Error Message: ${e.message}
    `);
  }
}

async function createPerson(data) {
  try {
    const person = await axios({
      method: "post",
      url: `${process.env.PIPEDRIVE_URL}/persons?api_token=${process.env.PD_API_KEY}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    });
    return person.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      createPerson(data) |
      data: ${JSON.stringify(data)}, |
      Error Message: ${e.message},
      Error: ${e.error}
    `);
  }
}

async function createLead(data) {
  try {
    const person = await axios({
      method: "post",
      url: `${process.env.PIPEDRIVE_URL}/leads?api_token=${process.env.PD_API_KEY}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    });

    return person.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      createLead(data) |
      data: ${JSON.stringify(data)}, |
      Error: ${JSON.stringify(e.response.data)}
    `);
  }
}

async function getPersonById(id) {
  try {
    const person = await axios({
      method: "get",
      url: `${process.env.PIPEDRIVE_URL}/persons/${id}?api_token=${process.env.PD_API_KEY}`,
    });

    return person.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      getPersonById(id) |
      id: ${JSON.stringify(id)}, |
      Error Message: ${e.message}
    `);
  }
}

async function updateOrg(id, data) {
  try {
    const org = await axios({
      method: "put",
      url: `${process.env.PIPEDRIVE_URL}/organizations/${id}?api_token=${process.env.PD_API_KEY}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    });

    return org.data;
  } catch (e) {
    await SendWebexTesting(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      updateOrg(id, data) |
      id: ${id}
      data: ${JSON.stringify(data)} |
      Error Message: ${e.message}
    `);
  }
}

async function createleadActivity_rate(data) {
  try {
    const activity = await axios({
      method: "POST",
      url: `https://rlgloballogistics.pipedrive.com/v1/activities?api_token=${process.env.PD_API_KEY}`,
      data: data,
    });
    var activity_id = activity.data.data.id;
    var log = activity_id + " Activity Successfully Created";
    
    return activity_id;
  } catch (error) {
    debug(error);
    await SendWebex(`ERROR | 
          App: immediate-best-cardboard (Rate Quote) | 
            createleadActivity_rate(data) | 
            Data: ${data} | 
            ${error.message}`);
    throw new Error("API request to create activity failed. " + error.message);
  }
}

async function getRLCQuote(data) {
  try {
    const quote = await axios({
      method: "POST",
      url: `https://api.rlc.com/RateQuote`,
      headers: {
        apiKey: `${process.env.RLC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: data,
    });

    return quote.data
  }
  catch(e) {
    console.log(JSON.stringify(e.response.data))
    await SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      getRLCQuote(data) |
      data: ${JSON.stringify(data)} |
      Error Message: ${JSON.stringify(e.response.data)}
    `);
  }
}

async function getLeadById(id) {
  try {
    const lead = await axios({
      method: "get",
      url: `${process.env.PIPEDRIVE_URL}/leads/${id}?api_token=${process.env.PD_API_KEY}`,
    })
    
    return lead.data
  }
  catch(e) {
    console.log(JSON.stringify(e.response.data))
    await SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      getLeadById(id) |
      id: ${JSON.stringify(id)} |
      Error Message: ${JSON.stringify(e.response.data)}
    `);
  }
}
async function updateLeadById(id, data) {
  try {
    const lead = await axios({
      method: "patch",
      url: `${process.env.PIPEDRIVE_URL}/leads/${id}?api_token=${process.env.PD_API_KEY}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data
    })
    
    return lead.data
  }
  catch(e) {
    console.log(JSON.stringify(e.response.data))
    await SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      updateLeadById(id, data) |
      id: ${JSON.stringify(id)}
      data: ${JSON.stringify(data)}|
      Error Message: ${JSON.stringify(e.response.data)}
    `);
  }
}

// -----------------------------------------------------------------------------------------------------------------------------------

// Generates a new token based on the refresh token
const getNewToken = async (refresh_token) => {
  try {
    return axios({
      method: "POST",
      url: "https://oauth.pipedrive.com/oauth/token",
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
        ).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify({
        grant_type: "refresh_token",
        refresh_token,
      }),
    });
  } catch (error) {
    debug(error);
    throw new Error("Getting new token from refresh token failed");
  }
};

// Gets the page context for rendering the HBS templates
function getPageContext(company_id, item_id, details) {
  return {
    company_id,
    item_id,
    details,
  };
}

// Gets information about a particular deal (by ID) in Pipedrive
async function getDeal(deal_id, access_token) {
  try {
    const deal = await axios({
      method: "GET",
      url: `https://api.pipedrive.com/v1/deals/${deal_id}`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return deal.data;
  } catch (error) {
    debug(error);
    throw new Error("API request to get deal by ID failed");
  }
}

// Generate error response, log the details
function getErrorResponse(name, detail, status_code, response) {
  console.error(`[${new Date().toISOString()}] ${name}: ${detail.message}`);
  debug(detail);
  response.status(status_code).send({
    success: false,
    message: name,
  });
}

function logImportantURLs() {
  debug("App started.");
  const domain = process.env.PROJECT_DOMAIN;
  const callBackUrl = `CallBack URL : https://${domain}.glitch.me/auth/callback`;
  const appPanelUrl = `Custom UI Panel URL : https://${domain}.glitch.me/ui/panel`;
  const appModalUrl = `Custom UI Modal URL : https://${domain}.glitch.me/ui/modal`;
  const appSettingsUrl = `Custom UI App Settings URL : https://${domain}.glitch.me/ui/settings`;

  console.info(
    `🟢 App is running\n${callBackUrl}\n${appPanelUrl}\n${appModalUrl}\n${appSettingsUrl}`
  );
}

module.exports = {
  getNewToken,
  getDeal,
  getPageContext,
  getErrorResponse,
  logImportantURLs,
  SendWebex,
  searchMcLeodZips,
  searchOrgsByName,
  botMessageToDavid,
  SendWebexTesting,
  getOrgByName,
  getOrgById,
  createOrg,
  createDeal,
  searchPersonsWithParams,
  createPerson,
  createLead,
  createleadActivity_rate,
  updateOrg,
  getRLCQuote,
  getLeadById,
  updateLeadById,
  getPersonById,
};
