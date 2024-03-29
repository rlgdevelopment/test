# DocuSign Custom UI App

A sample app showcasing DocuSign integration using Pipedrive Custom UI.

### Custom UI Panel

![DocuSign Custom UI Panel](https://user-images.githubusercontent.com/19341550/186169010-6c337710-f89b-4baa-b25f-c889c8972ea7.png)

### Custom UI Modal

![Custom UI Modal](https://user-images.githubusercontent.com/19341550/186170582-7da68926-baa9-4abe-93dd-a2b33b801d52.png)

### Custom UI App Settings

![DocuSign Custom UI App Settings](https://user-images.githubusercontent.com/19341550/186170594-9ebab884-68cb-4188-8d7b-17c24242cbc2.png)

## Steps to run the app:

- Create a [DocuSign developer account](https://developers.docusign.com/platform/account/) and [Pipedrive Sandbox Account](https://developers.pipedrive.com/start-here) with Marketplace Manager enabled.
- Create a new app in Pipedrive with Basic scope and Deals (read-only) scope.
- Fill in the `.env` file with `CLIENT_ID` and `CLIENT_SECRET` details of the newly created app.
- In the Glitch app **Logs section** you will notice the Callback, Custom UI modal, settings and panel URL. Open the created app in Marketplace Manager and add them in the respective places.
- To install the app in your account, click on the `Preview` link near the app name shown in the Marketplace manager.
- Fill in the app settings page after the authorization in the Custom UI App settings page.
- In your [DocuSign demo account](https://admindemo.docusign.com/), create templates for usage. This will appear in the Deal Details section.
- Click on the _Preview_ button to preview and edit the template from within Pipedrive.
- You can also _Send_ the document to the deal contact if a valid email is provided.

> For advanced troubleshooting, you can start the app using the following command - `DEBUG=app* npm start`. If you are using Glitch to preview the app, this is enabled by default.
