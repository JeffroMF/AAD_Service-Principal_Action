# GitHub Action to create new Application registrations in Azure Active Directory
This action enables you to automize the creation of Azure Active Directory applications in order to test your graph-powered or Single Sign-on enabled application.

## How to use
In order to generate new applications automatically, you need an existing application that the tenant administrator has granted the Application.ReadWrite.All scope.

Mandatory parameters:
- adminApplicationId: Client ID of an existing application with the Application.ReadWrite.All scope
- adminApplicationSecret: Client secret of the same existing application with the Application.ReadWrite.All scope
- tenantId: ID of the tenant in which the new application should be created

Optional parameters:
- applicationName: Any string, is set as the name of the application and displayed to users on sign-in
- redirectUrl: A list or URLs that should be registered as redirect URLs (Format: "URL,URL,URL")
- logoutUrl: A single URL that should be registered as the logout URL
- allowImplicitIdToken: Boolean indicator if the ID token acquisition through an implicit flow should be allowed
- allowImplicitAccessToken:Boolean indicator if the access token acquisition through an implicit flow should be allowed
- requireSecret: Boolean indicator if the action should return an application secret to use in the further flow

The Action returns two outputs, clientId and clientSecret. You can use these in the further workflow to configure your applications environment setting or make MS Graph calls in other actions. Note: If requireSecret is not true, clientSecret will be an empty string.

## Example
    name: Create new Application with Secret
    uses: urmade/AAD_Service-Principal_Action@v1.0
    with:
        adminApplicationId: ${{ secrets.ADMINCLIENTID }}
        adminApplicationSecret: ${{ secrets.ADMINCLIENTSECRET }}
        tenantId: ${{ secrets.TENANTID }}
        requireSecret: true
        applicationName: 'My App Name'
        redirectUrl: 'http://localhost:8000/redirect,https://myapp.awesome.com/redirect'
        logoutUrl: 'https://myapp.awesome.com/logout'
        allowImplicitIdToken: "true"

## Disclaimer
> It is not recommended to use this as a way of production rollout, although you can feel free to leave an issue if this would be relevant to you. As of now, only a limited set of settings are supported in the action, leading to non-ideal end user experiences (which on demand could be extended).