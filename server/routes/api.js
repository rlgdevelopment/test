const Router = require("express").Router;
const router = new Router();
const db = require("../data/connection");
const util = require("../util/helper");
const axios = require('axios')

const debug = require('debug')('app:api');

// search orgs based on name (partial or full)
router.get('/api/org/search', async (req, res) => {
  try {
    const searchName = req.query.name
    const orgsData = await util.searchOrgsByName(searchName)
    const orgs = orgsData.data.items
     
    let orgsToSend = []
    for(let i = 0; i < 5; i++) {
      if (!orgs[i]) break;
      orgsToSend.push({
        name: orgs[i].item.name,
        id: orgs[i].item.id
      })
    }

    res.send(orgsToSend)
  }
  catch(e) {
    console.log(e)
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /api/org/search |
      query: ${req.query} |
      Error Message: ${e.message}
    `);
  }
})

router.get('/api/person/search', async (req, res) => {
  const personName = req.query.name
  const orgId = req.query.orgId
  let searchPersonQuery
  
  try {
    if(orgId != '') {
      searchPersonQuery = `fields=name&term=${personName}&organization_id=${orgId}&limit=10`
    }
    else {
      searchPersonQuery = `fields=name&term=${personName}&limit=10`
    }
    
    const personsData = await util.searchPersonsWithParams(searchPersonQuery)
    const persons = personsData.data.items
    let personsToSend = []
    for(let i = 0; i < 5; i++) {
      if (!persons[i]) break;
      const personId = persons[i].item.id
      
      personsToSend.push({
        name: persons[i].item.name,
        id: personId,
        email: persons[i].item.emails[0],
        phone: persons[i].item.phones[0]
      })
    }
    
    res.send(personsToSend)
  }
  catch(e) {
    console.log(e)
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /api/person/search |
      query: ${req.query} |
      Error Message: ${e.message}
    `);
  }
})

// search orgs based on name (partial or full)
router.get('/api/zipcode/search', async (req, res) => {
  try {
    const searchName = req.query.zipcode;
    const zipsData = await util.searchMcLeodZips(searchName);
    //console.log(zipsData);
    
    let zipsList = [];
    
    for (var i = 0; i < 5; i++) {
      //console.log(zipsData[i]);
      if (!zipsData[i]) break;
      zipsList.push({
        name: zipsData[i]['name']+', '+zipsData[i]['state_id']+' '+zipsData[i]['zip_code'],
        zip: zipsData[i]['zip_code'],
        city: zipsData[i]['name'],
        state: zipsData[i]['state_id']
      });
    }
    
    res.send({
      zips: zipsList
    });
    
  }
  catch(e) {
    console.log(e);
    if(e.message == "Cannot read property '0' of null") {
      return
    }
    await util.SendWebex(`
      ERROR |
      App: immediate-best-cardboard (Rate Quote) |
      /api/zipcode/search |
      query: ${JSON.stringify(req.query)} |
      Error Message: ${e.message}
    `);
  }
})

// Handle settings update
router.post("/api/settings", async (req, res) => {
    try {
        await db.updateSettings(req.body.company_id, req.body.settings);
        debug("Settings updated");
        res.send({
            success: true
        });
    } catch (error) {
        return util.getErrorResponse("Could not update app settings", error, 500, res);
    }
});

// Only on Glitch
router.get("/",async (req,res) => {
  res.send("Welcome to the DocuSign Custom UI demo App. Check the README.md for further details.");
})

module.exports = router;